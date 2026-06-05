import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider, useTranslation } from './LanguageContext';
import type { ReactNode } from 'react';

// Helper component that consumes the context
function TestConsumer() {
  const { lang, t, toggleLang } = useTranslation();
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <span data-testid="translation">{t('nav.home')}</span>
      <span data-testid="missing">{t('nonexistent.key')}</span>
      <button data-testid="toggle" onClick={toggleLang}>
        Toggle
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

  it('returns the key when a translation is missing', () => {
    renderWithProvider(<TestConsumer />);
    expect(screen.getByTestId('missing')).toHaveTextContent('nonexistent.key');
  });
});
