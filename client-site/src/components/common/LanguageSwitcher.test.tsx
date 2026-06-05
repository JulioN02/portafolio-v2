import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import type { ReactNode } from 'react';

function renderWithProvider(ui: ReactNode) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

describe('LanguageSwitcher', () => {
  it('renders the current language label (EN when lang is es)', () => {
    renderWithProvider(<LanguageSwitcher />);
    // Default language is 'es', so the button shows 'EN'
    expect(screen.getByRole('button')).toHaveTextContent('EN');
  });

  it('toggles language on click (ES → EN → ES)', async () => {
    const user = userEvent.setup();
    renderWithProvider(<LanguageSwitcher />);

    // Initially ES → shows EN
    expect(screen.getByRole('button')).toHaveTextContent('EN');

    // Click to toggle
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveTextContent('ES');

    // Click again
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveTextContent('EN');
  });
});
