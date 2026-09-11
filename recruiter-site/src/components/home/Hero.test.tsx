import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PROFILE } from '@jsoft/shared';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { Hero } from './Hero';

function renderHero(props: { name?: string } = {}) {
  return render(
    <MemoryRouter>
      <LanguageProvider>
        <Hero {...props} />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

describe('Hero canonical name (public-pii-minimization / seo)', () => {
  it('defaults the displayed name to PROFILE.fullName', () => {
    renderHero();
    expect(
      screen.getByRole('heading', { level: 1, name: PROFILE.fullName }),
    ).toBeInTheDocument();
  });

  it('lets an explicit name override the canonical default', () => {
    renderHero({ name: 'Otro Nombre' });
    expect(
      screen.getByRole('heading', { level: 1, name: 'Otro Nombre' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { level: 1, name: PROFILE.fullName }),
    ).toBeNull();
  });

  it('renders the hero tags strip as a semantic list', () => {
    renderHero();
    const tags = screen.getByRole('list');
    const items = within(tags).getAllByRole('listitem');
    expect(items.map((item) => item.textContent)).toEqual([
      'Backend',
      'APIs',
      'PostgreSQL',
      'TypeScript',
      'Node.js',
    ]);
  });
});
