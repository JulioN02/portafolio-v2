import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider, useTranslation } from './LanguageContext';
import type { ReactNode } from 'react';

// Helper component that consumes the context
function TestConsumer() {
  const { lang, t, setLang } = useTranslation();
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <span data-testid="translation">{t('dashboard.title')}</span>
      <span data-testid="missing">{t('nonexistent.key')}</span>
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

  it('provides default language as Spanish', () => {
    renderWithProvider(<TestConsumer />);
    expect(screen.getByTestId('lang')).toHaveTextContent('es');
  });

  it('returns Spanish translations by default', () => {
    renderWithProvider(<TestConsumer />);
    expect(screen.getByTestId('translation')).toHaveTextContent('Panel de Control');
  });

  it('returns English translations after setLang("en")', async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestConsumer />);

    await user.click(screen.getByTestId('set-en'));

    expect(screen.getByTestId('lang')).toHaveTextContent('en');
    expect(screen.getByTestId('translation')).toHaveTextContent('Dashboard');
  });

  it('returns the key when a translation is missing', () => {
    renderWithProvider(<TestConsumer />);
    expect(screen.getByTestId('missing')).toHaveTextContent('nonexistent.key');
  });
});
