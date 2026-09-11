import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { CTA } from './CTA';

function renderCta() {
  return render(
    <MemoryRouter>
      <LanguageProvider>
        <CTA />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

describe('CTA conversion channels (public-pii-minimization)', () => {
  it('renders no phone or WhatsApp link and no PII literals', () => {
    const { container } = renderCta();
    expect(screen.queryByRole('link', { name: /Llámanos/ })).toBeNull();
    expect(screen.queryByRole('link', { name: /WhatsApp/ })).toBeNull();
    expect(container.innerHTML).not.toMatch(/wa\.me|tel:/i);
    expect(container.innerHTML).not.toContain('3727134');
  });

  it('keeps a contact-form link to /contacto', () => {
    renderCta();
    const form = screen.getByRole('link', { name: 'Enviar mensaje por el formulario' });
    expect(form).toHaveAttribute('href', '/contacto');
  });

  it('contains no mismatched contact values (CIN-4)', () => {
    const { container } = renderCta();
    expect(container.innerHTML).not.toContain('573001234567');
    expect(container.innerHTML).not.toContain('info@jsoftsolutions.com');
  });
});
