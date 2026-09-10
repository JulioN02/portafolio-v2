import { describe, it, expect } from 'vitest';
import { serviceSchema } from '../service.schema';

const VALID_SERVICE = {
  title: 'Desarrollo Web',
  slug: 'desarrollo-web',
  classification: 'Web',
  shortDescription: 'Creamos aplicaciones web profesionales a medida.',
  fullDescription:
    'Servicio integral de desarrollo web que cubre desde el diseño de la arquitectura hasta el despliegue en producción, incluyendo mantenimiento continuo.',
  includedItems: ['Análisis de requisitos', 'Diseño UI/UX', 'Despliegue'],
  images: ['https://example.com/image.jpg'],
  status: 'DRAFT',
};

describe('serviceSchema', () => {
  it('passes a valid https URL for externalLink', () => {
    const result = serviceSchema.safeParse({ ...VALID_SERVICE, externalLink: 'https://example.com' });
    expect(result.success).toBe(true);
  });

  it('passes when externalLink is absent', () => {
    const result = serviceSchema.safeParse(VALID_SERVICE);
    expect(result.success).toBe(true);
  });

  it('passes when externalLink is an empty string', () => {
    const result = serviceSchema.safeParse({ ...VALID_SERVICE, externalLink: '' });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid not-a-url externalLink', () => {
    const result = serviceSchema.safeParse({ ...VALID_SERVICE, externalLink: 'not-a-url' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('externalLink');
    }
  });

  it('passes plain text technicalExplanation <= 15000 rendered', () => {
    const tech = 'a'.repeat(15000);
    const result = serviceSchema.safeParse({ ...VALID_SERVICE, technicalExplanation: tech });
    expect(result.success).toBe(true);
  });

  it('passes rich HTML technicalExplanation rendered <= 15000 and raw <= 20000', () => {
    const text = 'a'.repeat(14000);
    const raw = `<p>${text}</p>`;
    const result = serviceSchema.safeParse({ ...VALID_SERVICE, technicalExplanation: raw });
    expect(result.success).toBe(true);
  });

  it('passes rich HTML where raw is between 15000 and 20000 but rendered <= 15000', () => {
    const raw = `<p>${'a'.repeat(15000)}</p>`;
    const result = serviceSchema.safeParse({ ...VALID_SERVICE, technicalExplanation: raw });
    expect(result.success).toBe(true);
  });

  it('rejects raw technicalExplanation > 20000', () => {
    const raw = `<p>${'a'.repeat(20001)}</p>`;
    const result = serviceSchema.safeParse({ ...VALID_SERVICE, technicalExplanation: raw });
    expect(result.success).toBe(false);
  });

  it('rejects rendered technicalExplanation > 15000 when raw is within cap', () => {
    const raw = `<p>${'a'.repeat(15001)}</p>`;
    const result = serviceSchema.safeParse({ ...VALID_SERVICE, technicalExplanation: raw });
    expect(result.success).toBe(false);
  });
});