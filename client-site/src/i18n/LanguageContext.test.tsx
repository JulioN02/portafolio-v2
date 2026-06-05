import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider, useTranslation } from './LanguageContext';
import type { ReactNode } from 'react';

// Helper component that consumes the context
function TestConsumer() {
  const { lang, t, toggleLang, setLang } = useTranslation();
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <span data-testid="translation">{t('nav.home')}</span>
      <span data-testid="with-params">{t('footer.copyright', { year: 2024 })}</span>
      <span data-testid="missing">{t('nonexistent.key')}</span>
      <button data-testid="toggle" onClick={toggleLang}>
        Toggle
      </button>
      <button data-testid="set-en" onClick={() => setLang('en')}>
        Set EN
      </button>
    </div>
  );
}

function renderWithProvider(ui: ReactNode) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

describe('LanguageProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders children', () => {
    renderWithProvider(<div data-testid="child">Hello</div>);
    expect(screen.getByTestId('child')).toHaveTextContent('Hello');
  });

  it('provides Spanish translations by default', () => {
    renderWithProvider(<TestConsumer />);
    expect(screen.getByTestId('lang')).toHaveTextContent('es');
    expect(screen.getByTestId('translation')).toHaveTextContent('Inicio');
  });

  it('returns English translations after toggling language', async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestConsumer />);

    await user.click(screen.getByTestId('toggle'));

    expect(screen.getByTestId('lang')).toHaveTextContent('en');
    expect(screen.getByTestId('translation')).toHaveTextContent('Home');
  });

  it('returns English after setLang("en")', async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestConsumer />);

    await user.click(screen.getByTestId('set-en'));

    expect(screen.getByTestId('lang')).toHaveTextContent('en');
    expect(screen.getByTestId('translation')).toHaveTextContent('Home');
  });

  it('supports {param} replacements in translations', () => {
    renderWithProvider(<TestConsumer />);
    expect(screen.getByTestId('with-params')).toHaveTextContent(
      '© 2024 J Soft Solutions. Todos los derechos reservados.',
    );
  });

  it('returns the key when a translation is missing', () => {
    renderWithProvider(<TestConsumer />);
    expect(screen.getByTestId('missing')).toHaveTextContent('nonexistent.key');
  });
});
