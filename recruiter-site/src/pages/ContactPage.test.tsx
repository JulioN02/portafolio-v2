import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PROFILE } from '@jsoft/shared';
import { LanguageProvider } from '../i18n/LanguageContext';
import { ContactPage } from './ContactPage';

vi.mock('../api/client', () => ({
  apiClient: { post: vi.fn(), get: vi.fn() },
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

function renderPage() {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LanguageProvider>
          <ContactPage />
        </LanguageProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ContactPage contact channels (public-pii-minimization)', () => {
  it('renders no WhatsApp link and no PII literals', () => {
    const { container } = renderPage();
    expect(screen.queryByRole('link', { name: /WhatsApp/ })).toBeNull();
    expect(container.innerHTML).not.toMatch(/wa\.me|tel:/i);
    expect(container.innerHTML).not.toContain('3727134');
  });

  it('keeps the LinkedIn, GitHub and Email social links', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /LinkedIn/ })).toHaveAttribute(
      'href',
      PROFILE.linkedinUrl,
    );
    expect(screen.getByRole('link', { name: /GitHub/ })).toHaveAttribute(
      'href',
      PROFILE.githubUrl,
    );
    expect(screen.getByRole('link', { name: /Email/ })).toHaveAttribute(
      'href',
      `mailto:${PROFILE.email}`,
    );
  });
});
