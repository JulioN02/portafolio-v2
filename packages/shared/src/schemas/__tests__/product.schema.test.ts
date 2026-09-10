import { describe, it, expect } from 'vitest';
import { productSchema } from '../product.schema';

const VALID_PRODUCT = {
  title: 'Plataforma SaaS',
  slug: 'plataforma-saas',
  classification: 'Producto',
  shortDescription: 'Plataforma SaaS para gestión empresarial en la nube.',
  fullDescription:
    'Producto SaaS que permite a las empresas gestionar sus operaciones en la nube con módulos de facturación, inventario y reportes.',
  images: ['https://example.com/product.jpg'],
  status: 'DRAFT',
};

describe('productSchema', () => {
  it('passes a valid https URL for externalLink (regression)', () => {
    const result = productSchema.safeParse({ ...VALID_PRODUCT, externalLink: 'https://example.com' });
    expect(result.success).toBe(true);
  });

  it('passes when externalLink is absent (regression)', () => {
    const result = productSchema.safeParse(VALID_PRODUCT);
    expect(result.success).toBe(true);
  });

  it('passes plain text technicalExplanation <= 15000 rendered', () => {
    const tech = 'a'.repeat(15000);
    const result = productSchema.safeParse({ ...VALID_PRODUCT, technicalExplanation: tech });
    expect(result.success).toBe(true);
  });

  it('passes rich HTML technicalExplanation rendered <= 15000 and raw <= 20000', () => {
    const text = 'a'.repeat(14000);
    const raw = `<p>${text}</p>`;
    const result = productSchema.safeParse({ ...VALID_PRODUCT, technicalExplanation: raw });
    expect(result.success).toBe(true);
  });

  it('passes rich HTML where raw is between 15000 and 20000 but rendered <= 15000', () => {
    // raw 15007 chars (> old 15000 raw cap) but rendered text is exactly 15000
    const raw = `<p>${'a'.repeat(15000)}</p>`;
    const result = productSchema.safeParse({ ...VALID_PRODUCT, technicalExplanation: raw });
    expect(result.success).toBe(true);
  });

  it('rejects raw technicalExplanation > 20000', () => {
    const raw = `<p>${'a'.repeat(20001)}</p>`;
    const result = productSchema.safeParse({ ...VALID_PRODUCT, technicalExplanation: raw });
    expect(result.success).toBe(false);
  });

  it('rejects rendered technicalExplanation > 15000 when raw is within cap', () => {
    const raw = `<p>${'a'.repeat(15001)}</p>`;
    const result = productSchema.safeParse({ ...VALID_PRODUCT, technicalExplanation: raw });
    expect(result.success).toBe(false);
  });
});