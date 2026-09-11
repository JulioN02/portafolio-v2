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

// toolDetail keyset — expand doubles as the preview modal's "Ver Completo"
// label; collapse and modalAria are dead after the preview→detail refactor.
const TOOL_DETAIL_KEYS = [
  'toolDetail.expand',
  'toolDetail.technicalExplanation',
  'toolDetail.technicalImages',
  'toolDetail.viewWebsite',
] as const;

describe('i18n toolDetail keyset', () => {
  it('has all 4 keys in es and en', () => {
    for (const key of TOOL_DETAIL_KEYS) {
      expect(translations.es[key], `es:${key}`).toBeDefined();
      expect(translations.en[key], `en:${key}`).toBeDefined();
    }
  });

  it('uses translated values (not key fallbacks)', () => {
    expect(translations.es['toolDetail.expand']).toBe('Ver completo');
    expect(translations.en['toolDetail.expand']).toBe('View full details');
    expect(translations.es['toolDetail.technicalExplanation']).toBe('Detalles técnicos');
    expect(translations.en['toolDetail.technicalExplanation']).toBe('Technical details');
    expect(translations.es['toolDetail.technicalImages']).toBe('Imágenes técnicas');
    expect(translations.en['toolDetail.technicalImages']).toBe('Technical images');
    expect(translations.es['toolDetail.viewWebsite']).toBe('Ver sitio web →');
    expect(translations.en['toolDetail.viewWebsite']).toBe('View website →');
  });
});

// preview-to-detail-page keyset: technical sections on service/product detail pages.
const SERVICE_DETAIL_TECH_KEYS = [
  'serviceDetail.technicalExplanation',
  'serviceDetail.technicalImages',
  'serviceDetail.viewWebsite',
] as const;

const PRODUCT_DETAIL_TECH_KEYS = [
  'productDetail.technicalExplanation',
  'productDetail.technicalImages',
] as const;

describe('i18n serviceDetail/productDetail technical keyset (preview-to-detail-page)', () => {
  it('has every new key in es and en', () => {
    for (const key of [...SERVICE_DETAIL_TECH_KEYS, ...PRODUCT_DETAIL_TECH_KEYS]) {
      expect(translations.es[key], `es:${key}`).toBeDefined();
      expect(translations.en[key], `en:${key}`).toBeDefined();
    }
  });

  it('uses translated values (not key fallbacks)', () => {
    expect(translations.es['serviceDetail.technicalExplanation']).toBe('Detalles técnicos');
    expect(translations.en['serviceDetail.technicalExplanation']).toBe('Technical details');
    expect(translations.es['serviceDetail.technicalImages']).toBe('Imágenes técnicas');
    expect(translations.en['serviceDetail.technicalImages']).toBe('Technical images');
    expect(translations.es['productDetail.technicalExplanation']).toBe('Detalles técnicos');
    expect(translations.en['productDetail.technicalExplanation']).toBe('Technical details');
    expect(translations.es['productDetail.technicalImages']).toBe('Imágenes técnicas');
    expect(translations.en['productDetail.technicalImages']).toBe('Technical images');
    expect(translations.es['serviceDetail.viewWebsite']).toBe('Ver sitio web →');
    expect(translations.en['serviceDetail.viewWebsite']).toBe('View website →');
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

// techStack keyset (TS-1.3): 21 keys — title, subtitle, 4 domains, 15 tech names.
// Must exist in BOTH es and en with real translated values (not key fallbacks).
const TECH_STACK_KEYS = [
  'techStack.title',
  'techStack.subtitle',
  'techStack.domain.backend',
  'techStack.domain.data',
  'techStack.domain.infrastructure',
  'techStack.domain.frontend',
  'techStack.item.nodejs',
  'techStack.item.typescript',
  'techStack.item.express',
  'techStack.item.nestjs',
  'techStack.item.postgresql',
  'techStack.item.mysql',
  'techStack.item.prisma',
  'techStack.item.docker',
  'techStack.item.linux',
  'techStack.item.cicd',
  'techStack.item.git',
  'techStack.item.react',
  'techStack.item.vite',
  'techStack.item.vanilla',
  'techStack.item.htmlcss',
] as const;

describe('i18n techStack keyset (parity es/en)', () => {
  it('has all 21 keys in es and en with non-empty values', () => {
    for (const key of TECH_STACK_KEYS) {
      expect(translations.es[key], `es:${key}`).toBeDefined();
      expect(translations.en[key], `en:${key}`).toBeDefined();
      expect(translations.es[key], `es:${key}`).not.toBe('');
      expect(translations.en[key], `en:${key}`).not.toBe('');
      expect(translations.es[key], `es:${key}`).not.toBe(key);
      expect(translations.en[key], `en:${key}`).not.toBe(key);
    }
  });

  it('uses translated values (not key fallbacks)', () => {
    expect(translations.es['techStack.title']).toBe('Tech Stack');
    expect(translations.en['techStack.title']).toBe('Tech Stack');
    expect(translations.es['techStack.subtitle']).toContain('capas del sistema');
    expect(translations.en['techStack.subtitle']).toContain('system layer');
    expect(translations.es['techStack.domain.backend']).toBe('Backend & Core');
    expect(translations.en['techStack.domain.backend']).toBe('Backend & Core');
    expect(translations.es['techStack.domain.data']).toBe('Datos & Persistencia');
    expect(translations.en['techStack.domain.data']).toBe('Data & Persistence');
    expect(translations.es['techStack.domain.infrastructure']).toBe('Infraestructura');
    expect(translations.en['techStack.domain.infrastructure']).toBe('Infrastructure');
    expect(translations.es['techStack.item.nodejs']).toBe('Node.js');
    expect(translations.en['techStack.item.nodejs']).toBe('Node.js');
    expect(translations.en['techStack.item.prisma']).toBe('Prisma ORM');
    expect(translations.es['techStack.item.vanilla']).toBe('Vanilla JS');
    expect(translations.en['techStack.item.htmlcss']).toBe('HTML & CSS');
  });
});