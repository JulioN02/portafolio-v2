import { describe, it, expect } from 'vitest';
import {
  clientContactSchema,
  recruiterContactSchema,
} from '../index';

const validClient = {
  firstName: 'Ana',
  lastName: 'García',
  whatsapp: '+573001112233',
  email: 'ana@example.com',
  message: 'Hola, me interesa un desarrollo web.',
  source: 'service:Desarrollo Web',
};

const validRecruiter = {
  firstName: 'Luis',
  email: 'luis@example.com',
  whatsapp: '+573001112233',
  message: 'Hola, tengo una oportunidad laboral.',
};

/**
 * Honeypot backstop (contact-anti-spam capability): the `website` field is a
 * hidden honeypot on both public contact forms. The schemas MUST reject any
 * non-empty value (defense-in-depth behind the middleware raw-body check) and
 * MUST accept the empty/absent case so legitimate submissions pass.
 */
describe('Contact schemas — website honeypot backstop', () => {
  describe('clientContactSchema', () => {
    it('rejects a non-empty website value', () => {
      const result = clientContactSchema.safeParse({
        ...validClient,
        website: 'http://spam.example.com',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.website).toBeDefined();
      }
    });

    it('accepts an empty website value and keeps it in the parsed data', () => {
      const result = clientContactSchema.safeParse({
        ...validClient,
        website: '',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.website).toBe('');
      }
    });

    it('accepts a submission without the website field (legit user)', () => {
      const result = clientContactSchema.safeParse(validClient);
      expect(result.success).toBe(true);
    });

    it('strips the transient turnstileToken field from the parsed payload', () => {
      const result = clientContactSchema.safeParse({
        ...validClient,
        website: '',
        turnstileToken: '0xAAAAAA',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).not.toHaveProperty('turnstileToken');
      }
    });
  });

  describe('clientContactSchema whatsapp — normalization', () => {
    it.each([
      ['300 372 7134', '3003727134'],
      ['+57 300-372-7134', '+573003727134'],
      ['(300) 372-7134', '3003727134'],
      ['300.372.7134', '3003727134'],
    ])('accepts %s and normalizes to %s', (input, expected) => {
      const result = clientContactSchema.safeParse({ ...validClient, whatsapp: input });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.whatsapp).toBe(expected);
      }
    });

    it('rejects non-numeric input', () => {
      const result = clientContactSchema.safeParse({ ...validClient, whatsapp: 'abc' });
      expect(result.success).toBe(false);
    });

    it('rejects a number with too few digits', () => {
      const result = clientContactSchema.safeParse({ ...validClient, whatsapp: '123' });
      expect(result.success).toBe(false);
    });
  });

  describe('recruiterContactSchema', () => {
    it('rejects a non-empty website value', () => {
      const result = recruiterContactSchema.safeParse({
        ...validRecruiter,
        website: 'https://spam.example.com',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.website).toBeDefined();
      }
    });

    it('accepts an empty website value and keeps it in the parsed data', () => {
      const result = recruiterContactSchema.safeParse({
        ...validRecruiter,
        website: '',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.website).toBe('');
      }
    });

    it('accepts a submission without the website field (legit user)', () => {
      const result = recruiterContactSchema.safeParse(validRecruiter);
      expect(result.success).toBe(true);
    });

    it('strips the transient turnstileToken field from the parsed payload', () => {
      const result = recruiterContactSchema.safeParse({
        ...validRecruiter,
        website: '',
        turnstileToken: '0xAAAAAA',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).not.toHaveProperty('turnstileToken');
      }
    });
  });

  describe('recruiterContactSchema whatsapp — normalization', () => {
    it.each([
      ['300 372 7134', '3003727134'],
      ['+57 300-372-7134', '+573003727134'],
      ['(300) 372-7134', '3003727134'],
    ])('accepts %s and normalizes to %s', (input, expected) => {
      const result = recruiterContactSchema.safeParse({ ...validRecruiter, whatsapp: input });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.whatsapp).toBe(expected);
      }
    });

    it('rejects non-numeric input', () => {
      const result = recruiterContactSchema.safeParse({ ...validRecruiter, whatsapp: 'abc' });
      expect(result.success).toBe(false);
    });

    it('rejects a number with too few digits', () => {
      const result = recruiterContactSchema.safeParse({ ...validRecruiter, whatsapp: '123' });
      expect(result.success).toBe(false);
    });
  });
});