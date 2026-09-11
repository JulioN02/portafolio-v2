import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { TechStack } from './TechStack';

const DOMAINS_ES = ['Backend & Core', 'Datos & Persistencia', 'Infraestructura', 'Frontend'];
const DOMAINS_EN = ['Backend & Core', 'Data & Persistence', 'Infrastructure', 'Frontend'];

const TECH_NAMES = [
  'Node.js',
  'TypeScript',
  'Express',
  'Nest.js',
  'PostgreSQL',
  'MySQL',
  'Prisma ORM',
  'Docker',
  'Linux',
  'CI/CD',
  'Git',
  'React',
  'Vite',
  'Vanilla JS',
  'HTML & CSS',
];

function renderTechStack() {
  return render(
    <LanguageProvider>
      <TechStack />
    </LanguageProvider>,
  );
}

describe('TechStack (TS-1.1/1.2/2.1/3.1)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the Spanish copy with 4 domain cards, 4 lists and 15 techs (es default)', () => {
    const { container } = renderTechStack();

    expect(screen.getByRole('heading', { level: 2, name: 'Tech Stack' })).toBeInTheDocument();

    for (const domain of DOMAINS_ES) {
      expect(screen.getByRole('heading', { level: 3, name: domain })).toBeInTheDocument();
    }
    for (const tech of TECH_NAMES) {
      expect(screen.getByText(tech)).toBeInTheDocument();
    }

    expect(container.querySelectorAll('article')).toHaveLength(4);
    expect(container.querySelectorAll('ul')).toHaveLength(4);
    expect(container.querySelectorAll('li')).toHaveLength(15);

    const icons = container.querySelectorAll('svg');
    expect(icons).toHaveLength(15);
    for (const icon of icons) {
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('renders the English copy when the language is en (tech names identical)', () => {
    localStorage.setItem('site_language', 'en');
    renderTechStack();

    expect(screen.getByRole('heading', { level: 2, name: 'Tech Stack' })).toBeInTheDocument();

    for (const domain of DOMAINS_EN) {
      expect(screen.getByRole('heading', { level: 3, name: domain })).toBeInTheDocument();
    }
    for (const tech of TECH_NAMES) {
      expect(screen.getByText(tech)).toBeInTheDocument();
    }
  });

  it('binds the section landmark to its h2 and labels each tech button', () => {
    const { container } = renderTechStack();

    const section = container.querySelector('section');
    expect(section).not.toBeNull();
    const labelledBy = section!.getAttribute('aria-labelledby');
    expect(labelledBy).toBe('tech-stack-title');
    expect(container.querySelector(`#${labelledBy}`)?.tagName).toBe('H2');

    expect(screen.getAllByRole('button')).toHaveLength(15);
    for (const tech of TECH_NAMES) {
      expect(screen.getByRole('button', { name: tech })).toBeInTheDocument();
    }
  });

  it('renders every tech as a non-submitting button (type="button")', () => {
    const { container } = renderTechStack();

    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(15);
    for (const button of buttons) {
      expect(button).toHaveAttribute('type', 'button');
    }
  });
});