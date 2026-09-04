import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PROFILE } from '@jsoft/shared';
import { LanguageProvider } from '../../i18n/LanguageContext';

vi.mock('../../components/seo/MetaTags', () => ({
  MetaTags: () => null,
}));

import { ContactPage } from './index';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

function renderPage() {
  return render(
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ContactPage />
      </LanguageProvider>
    </QueryClientProvider>,
  );
}

describe('ContactPage sweep (CIN-2/3/4/5)', () => {
  it('renders the email with the canonical inbox and mailto href', () => {
    renderPage();
    const email = screen.getByRole('link', { name: PROFILE.email });
    expect(email).toHaveAttribute('href', `mailto:${PROFILE.email}`);
  });

  it('renders WhatsApp with the canonical URL and the canonical display phone', () => {
    renderPage();
    const whatsapp = screen.getByRole('link', { name: PROFILE.phoneDisplay });
    expect(whatsapp).toHaveAttribute('href', PROFILE.whatsappUrl);
  });

  it('contains no mismatched contact values (CIN-4)', () => {
    const { container } = renderPage();
    expect(container.innerHTML).not.toContain('573001234567');
    expect(container.innerHTML).not.toContain('info@jsoftsolutions.com');
  });
});