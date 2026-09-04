import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PROFILE } from '@jsoft/shared';
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

describe('CTA conversion channels (CHC-6 / CIN-3/5)', () => {
  it('renders a phone action with the canonical href and display format', () => {
    renderCta();
    const phone = screen.getByRole('link', { name: /Llámanos/ });
    expect(phone).toHaveAttribute('href', PROFILE.phoneHref);
    expect(phone).toHaveTextContent(PROFILE.phoneDisplay);
  });

  it('renders a WhatsApp action with the canonical URL', () => {
    renderCta();
    const whatsapp = screen.getByRole('link', { name: 'Escríbenos por WhatsApp' });
    expect(whatsapp).toHaveAttribute('href', PROFILE.whatsappUrl);
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