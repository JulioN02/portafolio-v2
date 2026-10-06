import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PROFILE } from '@jsoft/shared';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { Footer } from './Footer';
import { CONSENT_REOPEN_EVENT } from '../public/ConsentBanner';

function renderFooter() {
  return render(
    <MemoryRouter>
      <LanguageProvider>
        <Footer />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

describe('Footer contact sweep (CIN-1/3/4)', () => {
  it('renders no WhatsApp link and no PII literals (public-pii-minimization)', () => {
    const { container } = renderFooter();
    expect(screen.queryByRole('link', { name: 'WhatsApp' })).toBeNull();
    expect(container.innerHTML).not.toMatch(/wa\.me|tel:/i);
    expect(container.innerHTML).not.toContain('3727134');
  });

  it('points LinkedIn and GitHub to the canonical jsoftsolutions handles', () => {
    renderFooter();
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', PROFILE.linkedinUrl);
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', PROFILE.githubUrl);
  });

  it('points email links (social icon + contact block) to the canonical inbox', () => {
    renderFooter();
    expect(screen.getByRole('link', { name: 'Email' })).toHaveAttribute('href', `mailto:${PROFILE.email}`);
    expect(screen.getByRole('link', { name: PROFILE.email })).toHaveAttribute('href', `mailto:${PROFILE.email}`);
  });

  it('contains no mismatched contact values or old julion handles (CIN-4)', () => {
    const { container } = renderFooter();
    expect(container.innerHTML).not.toContain('573001234567');
    expect(container.innerHTML).not.toContain('info@jsoftsolutions.com');
    expect(container.innerHTML).not.toContain('github.com/julion');
    expect(container.innerHTML).not.toContain('linkedin.com/in/julion');
  });
});

describe('Footer privacy preferences button', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('exposes the privacy preferences control with the ES label by default', () => {
    renderFooter();
    expect(screen.getByRole('button', { name: 'Preferencias de privacidad' })).toBeInTheDocument();
  });

  it('reopens consent preferences and clears the stored choice on click', () => {
    localStorage.setItem('jsoft-consent-v1', 'accepted');
    const listener = vi.fn();
    window.addEventListener(CONSENT_REOPEN_EVENT, listener);
    renderFooter();
    screen.getByRole('button', { name: 'Preferencias de privacidad' }).click();
    expect(localStorage.getItem('jsoft-consent-v1')).toBeNull();
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(CONSENT_REOPEN_EVENT, listener);
  });

  it('uses the English label when the stored language is en', async () => {
    localStorage.setItem('site_language', 'en');
    renderFooter();
    expect(await screen.findByRole('button', { name: 'Privacy preferences' })).toBeInTheDocument();
  });
});
