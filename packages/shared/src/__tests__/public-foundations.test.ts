import { describe, expect, it } from 'vitest';
import { buildPublicMetadata, getPublicImageSemantics, h1DiffersFromTitle } from '../index';

describe('public foundations', () => {
  it('normalizes metadata and keeps canonical URLs absolute', () => {
    const metadata = buildPublicMetadata({ title: 'Servicios', description: ' Soluciones ', canonical: 'https://example.com/servicios' });
    expect(metadata.description).toBe('Soluciones');
    expect(metadata.canonical).toBe('https://example.com/servicios');
    expect(metadata.ogTitle).toBe('Servicios');
  });

  it('requires a meaningful H1 distinct from the meta title', () => {
    expect(h1DiffersFromTitle('Soluciones para tu negocio', 'Servicios | J Soft Solutions')).toBe(true);
    expect(h1DiffersFromTitle('Servicios', 'Servicios')).toBe(false);
  });

  it('uses empty alt for decoration and deterministic reviewed fallback text', () => {
    expect(getPublicImageSemantics('decorative')).toEqual({ alt: '', editorialReviewRequired: false });
    expect(getPublicImageSemantics('fallback', { title: 'CRM', index: 1 })).toMatchObject({ alt: 'CRM - imagen 2', editorialReviewRequired: true });
  });
});
