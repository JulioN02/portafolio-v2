import { describe, it, expect } from 'vitest';
import { buildTechnicalExcerpt } from './RecentProjects';

describe('buildTechnicalExcerpt (RHP-9)', () => {
  it('returns an empty string when technicalExplanation is absent', () => {
    expect(buildTechnicalExcerpt(undefined)).toBe('');
    expect(buildTechnicalExcerpt('')).toBe('');
  });

  it('returns plain text without HTML tags for short explanations', () => {
    const html = '<p>API REST con <strong>Node.js</strong> y PostgreSQL.</p>';
    expect(buildTechnicalExcerpt(html)).toBe('API REST con Node.js y PostgreSQL.');
  });

  it('keeps short plain text unchanged (no ellipsis)', () => {
    const text = 'Arquitectura en capas con patrones de dominio.';
    expect(buildTechnicalExcerpt(text)).toBe(text);
  });

  it('truncates long explanations to maxLength plus ellipsis', () => {
    const long = 'x'.repeat(200);
    const result = buildTechnicalExcerpt(`<p>${long}</p>`);
    expect(result.length).toBe(141); // 140 + ellipsis
    expect(result.endsWith('…')).toBe(true);
  });

  it('collapses whitespace from multi-line HTML', () => {
    const html = '<div>Línea uno\n\n   línea dos</div>';
    expect(buildTechnicalExcerpt(html)).toBe('Línea uno línea dos');
  });
});