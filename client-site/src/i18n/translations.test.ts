import { describe, it, expect } from 'vitest';
import { translations } from './translations';

// Unified blogPostContent keyset (design §6) — must exist in BOTH es and en
// in BOTH sites (shared components receive translated strings via props).
const REQUIRED_KEYS = [
  'blogPostContent.galleryTitle',
  'blogPostContent.carousel.pause',
  'blogPostContent.carousel.play',
  'blogPostContent.carousel.prev',
  'blogPostContent.carousel.next',
  'blogPostContent.lightbox.close',
  'blogPostContent.lightbox.prev',
  'blogPostContent.lightbox.next',
  'blogPostContent.lightbox.counter',
  'blogPostContent.lightbox.dialogLabel',
  'blogPostContent.media.expand',
  'blogPostContent.galleryImageAlt',
] as const;

describe('i18n blogPostContent keyset', () => {
  it('has all 12 keys in es and en', () => {
    for (const key of REQUIRED_KEYS) {
      expect(translations.es[key], `es:${key}`).toBeDefined();
      expect(translations.en[key], `en:${key}`).toBeDefined();
    }
  });

  it('uses translated values (not key fallbacks)', () => {
    expect(translations.es['blogPostContent.galleryTitle']).toBe('Galería');
    expect(translations.en['blogPostContent.galleryTitle']).toBe('Gallery');
    expect(translations.es['blogPostContent.carousel.pause']).toBe('Pausar');
    expect(translations.en['blogPostContent.lightbox.close']).toBe('Close');
  });
});