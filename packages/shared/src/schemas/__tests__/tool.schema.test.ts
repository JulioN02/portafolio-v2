import { describe, it, expect } from 'vitest';
import { toolSchema } from '../tool.schema';

const VALID_TOOL = {
  title: 'Editor de Código',
  slug: 'editor-codigo',
  classification: 'Herramientas',
  shortDescription: 'Herramienta de desarrollo para edición de código eficiente.',
  fullDescription:
    'Editor de código moderno con soporte para múltiples lenguajes, extensiones y terminal integrada, orientado a equipos de desarrollo.',
  images: ['https://example.com/tool.jpg'],
  status: 'DRAFT',
};

describe('toolSchema', () => {
  it('passes a valid https URL for externalLink', () => {
    const result = toolSchema.safeParse({ ...VALID_TOOL, externalLink: 'https://example.com' });
    expect(result.success).toBe(true);
  });

  it('passes when externalLink is absent', () => {
    const result = toolSchema.safeParse(VALID_TOOL);
    expect(result.success).toBe(true);
  });

  it('passes when externalLink is an empty string', () => {
    const result = toolSchema.safeParse({ ...VALID_TOOL, externalLink: '' });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid not-a-url externalLink', () => {
    const result = toolSchema.safeParse({ ...VALID_TOOL, externalLink: 'not-a-url' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('externalLink');
    }
  });

  it('passes plain text technicalExplanation <= 15000 rendered', () => {
    const tech = 'a'.repeat(15000);
    const result = toolSchema.safeParse({ ...VALID_TOOL, technicalExplanation: tech });
    expect(result.success).toBe(true);
  });

  it('passes rich HTML technicalExplanation rendered <= 15000 and raw <= 20000', () => {
    const text = 'a'.repeat(14000);
    const raw = `<p>${text}</p>`;
    const result = toolSchema.safeParse({ ...VALID_TOOL, technicalExplanation: raw });
    expect(result.success).toBe(true);
  });

  it('passes rich HTML where raw is between 15000 and 20000 but rendered <= 15000', () => {
    const raw = `<p>${'a'.repeat(15000)}</p>`;
    const result = toolSchema.safeParse({ ...VALID_TOOL, technicalExplanation: raw });
    expect(result.success).toBe(true);
  });

  it('rejects raw technicalExplanation > 20000', () => {
    const raw = `<p>${'a'.repeat(20001)}</p>`;
    const result = toolSchema.safeParse({ ...VALID_TOOL, technicalExplanation: raw });
    expect(result.success).toBe(false);
  });

  it('rejects rendered technicalExplanation > 15000 when raw is within cap', () => {
    const raw = `<p>${'a'.repeat(15001)}</p>`;
    const result = toolSchema.safeParse({ ...VALID_TOOL, technicalExplanation: raw });
    expect(result.success).toBe(false);
  });
});