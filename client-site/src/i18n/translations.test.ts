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

// home-redesign keysets (CHC-1 hero.stats, CHC-3 processSection, CHC-5 blogTeaser, CHC-6 cta)
const HOME_REDESIGN_KEYS = [
  // hero trust stats (CHC-1/2)
  'hero.stats.availability',
  'hero.stats.response',
  'hero.stats.projects',
  // process / why-me (CHC-3)
  'processSection.title',
  'processSection.step1',
  'processSection.step2',
  'processSection.step3',
  'processSection.step4',
  'processSection.whyMe.title',
  'processSection.whyMe.1',
  'processSection.whyMe.2',
  'processSection.whyMe.3',
  // blog teaser (CHC-5)
  'blogTeaser.title',
  'blogTeaser.viewAll',
  'blogTeaser.loading',
  // CTA channels (CHC-6)
  'cta.phone',
  'cta.whatsapp',
  'cta.form',
] as const;

describe('i18n home-redesign keysets (parity es/en)', () => {
  it('has every new key in es and en', () => {
    for (const key of HOME_REDESIGN_KEYS) {
      expect(translations.es[key], `es:${key}`).toBeDefined();
      expect(translations.en[key], `en:${key}`).toBeDefined();
    }
  });

  it('uses translated values (not key fallbacks)', () => {
    expect(translations.es['hero.stats.availability']).toBe('disponibilidad');
    expect(translations.en['hero.stats.availability']).toBe('availability');
    expect(translations.en['hero.stats.response']).toBe('Response < 24h');
    expect(translations.es['hero.stats.projects']).toBe('Proyectos entregados');
    expect(translations.es['processSection.title']).toBe('Cómo trabajamos');
    expect(translations.en['processSection.whyMe.title']).toBe('Why work with me?');
    expect(translations.es['blogTeaser.title']).toBe('Últimos artículos');
    expect(translations.en['blogTeaser.viewAll']).toContain('View all');
    expect(translations.es['cta.phone']).toBe('Llámanos');
    expect(translations.en['cta.form']).toBe('Send a message via the form');
  });
});