import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { ProcessSection } from './ProcessSection';

const STEP_TEXTS_ES = [
  'Descubrimiento y análisis de necesidades',
  'Propuesta y planificación',
  'Desarrollo iterativo con entregas parciales',
  'Entrega, pruebas y soporte',
];

const WHY_TEXTS_ES = [
  'Experiencia en desarrollo backend robusto',
  'Calidad garantizada con TDD, SDD y DDD',
  'Desarrollo asistido por IA para entregar más rápido',
];

describe('ProcessSection (CHC-3)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the section title, 4 engagement steps in an <ol>, and 3 differentiators in a <ul> (es)', () => {
    const { container } = render(
      <LanguageProvider>
        <ProcessSection />
      </LanguageProvider>,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Cómo trabajamos' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: '¿Por qué trabajar conmigo?' })).toBeInTheDocument();

    for (const step of STEP_TEXTS_ES) {
      expect(screen.getByText(step)).toBeInTheDocument();
    }
    for (const why of WHY_TEXTS_ES) {
      expect(screen.getByText(why)).toBeInTheDocument();
    }

    // Semantic structure: steps inside <ol>, differentiators inside <ul>.
    const ol = container.querySelector('ol');
    const ul = container.querySelector('ul');
    expect(ol).not.toBeNull();
    expect(ul).not.toBeNull();
    expect(ol!.children.length).toBe(4);
    expect(ul!.children.length).toBe(3);
  });

  it('renders the English copy when the language is en', () => {
    localStorage.setItem('site_language', 'en');
    render(
      <LanguageProvider>
        <ProcessSection />
      </LanguageProvider>,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'How we work' })).toBeInTheDocument();
    expect(screen.getByText('Discovery and needs analysis')).toBeInTheDocument();
    expect(screen.getByText('Quality guaranteed with TDD, SDD, and DDD')).toBeInTheDocument();
  });
});