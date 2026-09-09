import { describe, it, expect } from 'vitest';
import { translations } from './translations';

// New keysets introduced by home-redesign (RHP-1..RHP-5, RHP-7, RHP-8).
const REQUIRED_KEYS = [
  // backend-first hero (RHP-1)
  'hero.title',
  'hero.summary',
  // truthful profile copy (RHP-2)
  'profileToggle.professionalText',
  'profileToggle.technicalText',
  // timeline (RHP-3, RHP-4)
  'timeline.experienceTitle',
  'timeline.educationTitle',
  'timeline.languagesTitle',
  'timeline.exp.0.role',
  'timeline.exp.0.org',
  'timeline.exp.0.period',
  'timeline.exp.1.role',
  'timeline.exp.1.org',
  'timeline.exp.1.period',
  'timeline.exp.1.metric',
  'timeline.exp.2.role',
  'timeline.exp.2.org',
  'timeline.exp.3.role',
  'timeline.exp.3.org',
  'timeline.edu.0.role',
  'timeline.edu.0.org',
  'timeline.edu.0.period',
  'timeline.edu.1.role',
  'timeline.edu.1.org',
  'timeline.edu.1.period',
  'timeline.edu.2.role',
  'timeline.edu.2.org',
  'timeline.edu.2.period',
  'timeline.languages',
  // statsStrip (RHP-5)
  'statsStrip.title',
  'statsStrip.availability',
  'statsStrip.logisticsYears',
  'statsStrip.techCount',
  'statsStrip.englishLevel',
  // contactStrip (RHP-7, RHP-8)
  'contactStrip.title',
  'contactStrip.email',
  'contactStrip.phone',
  'contactStrip.whatsapp',
  'contactStrip.linkedin',
  'contactStrip.cv',
  'contactStrip.cvAria',
  // project detail modal preview (tools-ux-improvements, preview-to-detail-page)
  'projectDetailModal.expand',
  'projectDetailModal.close',
  'projectDetailModal.loading',
  'projectDetailModal.error',
  'projectDetailModal.errorConnection',
  'projectDetailModal.fullDescription',
  'projectDetailModal.technicalExplanation',
  'projectDetailModal.technicalImages',
  'projectDetailModal.viewRepository',
  'projectDetailModal.type.service',
  'projectDetailModal.type.product',
  'projectDetailModal.type.tool',
  'projectDetailModal.type.successCase',
  'projectDetailModal.type.project',
  'projectDetailModal.type.laboratorio',
  // entity detail page (preview-to-detail-page)
  'projectDetailPage.backToProjects',
  'projectDetailPage.notFound.title',
  'projectDetailPage.notFound.message',
] as const;

const BANNED_CLAIMS = [
  /5\s*\+/,
  /m[aá]s de 5 a[ñn]os/,
  /more than 5/i,
  /over 5 years/i,
  /liderado equipos/i,
  /startups?/i,
  /enterprise/i,
] as const;

describe('i18n translations (home-redesign RHP-1..RHP-5, RHP-7, RHP-8)', () => {
  it('has identical key sets in es and en (full parity)', () => {
    const esKeys = Object.keys(translations.es).sort();
    const enKeys = Object.keys(translations.en).sort();
    expect(esKeys).toEqual(enKeys);
  });

  it('has all required new keys defined in both languages', () => {
    for (const key of REQUIRED_KEYS) {
      expect(translations.es[key], `es:${key}`).toBeDefined();
      expect(translations.en[key], `en:${key}`).toBeDefined();
    }
  });

  it('uses backend-first hero titles, not Full Stack (RHP-1)', () => {
    expect(translations.es['hero.title']).toBe('Ingeniero de Sistemas | Desarrollador Backend');
    expect(translations.en['hero.title']).toBe('Systems Engineer | Backend Developer');
  });

  it('contains no "Full Stack" strings anywhere (RHP-1 removed requirement)', () => {
    for (const lang of ['es', 'en'] as const) {
      for (const [key, value] of Object.entries(translations[lang])) {
        expect(value, `${lang}:${key}`).not.toMatch(/full\s*stack/i);
      }
    }
  });

  it('contains no removed claims (RHP-2)', () => {
    for (const lang of ['es', 'en'] as const) {
      for (const [key, value] of Object.entries(translations[lang])) {
        for (const banned of BANNED_CLAIMS) {
          expect(value, `${lang}:${key} matches ${banned}`).not.toMatch(banned);
        }
      }
    }
  });

  it('describes the truthful trajectory in profileToggle (RHP-2)', () => {
    const es = translations.es['profileToggle.professionalText'];
    const en = translations.en['profileToggle.professionalText'];
    expect(es).toMatch(/Ene 2025/);
    expect(es).toMatch(/Coordinador Logístico Nacional/);
    expect(es).toMatch(/2018/);
    expect(en).toMatch(/January 2025|Jan 2025/i);
    expect(en).toMatch(/National Logistics Coordinator/i);
    expect(en).toMatch(/2018/);
  });

  it('carries the 100% metric on the coordinator timeline entry (RHP-3)', () => {
    expect(translations.es['timeline.exp.1.metric']).toContain('100%');
    expect(translations.es['timeline.exp.1.metric']).toMatch(/disponibilidad/i);
    expect(translations.es['timeline.exp.1.metric']).toMatch(/trazabilidad/i);
    expect(translations.en['timeline.exp.1.metric']).toContain('100%');
    expect(translations.en['timeline.exp.1.metric']).toMatch(/availability/i);
    expect(translations.en['timeline.exp.1.metric']).toMatch(/traceability/i);
  });

  it('has education entries and languages in the timeline keyset (RHP-4)', () => {
    expect(translations.es['timeline.edu.0.org']).toBe('UNAD');
    expect(translations.es['timeline.edu.1.org']).toBe('PLATZI');
    expect(translations.es['timeline.edu.2.org']).toBe('TodoCode');
    expect(translations.es['timeline.languages']).toMatch(/Inglés \(A2\)/i);
    expect(translations.en['timeline.languages']).toMatch(/English \(A2\)/i);
  });

  it('has the statsStrip availability label (RHP-5)', () => {
    expect(translations.es['statsStrip.availability']).toMatch(/disponibilidad/i);
    expect(translations.es['statsStrip.availability']).toMatch(/trazabilidad/i);
    expect(translations.en['statsStrip.availability']).toMatch(/availability/i);
    expect(translations.en['statsStrip.availability']).toMatch(/traceability/i);
  });

  it('has the projectDetailModal preview labels and the entity detail page labels in both languages', () => {
    expect(translations.es['projectDetailModal.expand']).toBe('Ver completo');
    expect(translations.en['projectDetailModal.expand']).toBe('View full details');
    expect(translations.es['projectDetailModal.viewRepository']).toBe('Ver repositorio →');
    expect(translations.en['projectDetailModal.viewRepository']).toBe('View repository →');
    expect(translations.es['projectDetailModal.type.project']).toBe('Proyecto');
    expect(translations.en['projectDetailModal.type.project']).toBe('Project');
    expect(translations.es['projectDetailPage.backToProjects']).toBe('← Volver a proyectos');
    expect(translations.en['projectDetailPage.backToProjects']).toBe('← Back to projects');
    expect(translations.es['projectDetailPage.notFound.title']).toBe('Detalle no encontrado');
    expect(translations.en['projectDetailPage.notFound.title']).toBe('Detail not found');
    expect(translations.es['projectDetailPage.notFound.message']).toMatch(/no existe|ha sido eliminado/i);
    expect(translations.en['projectDetailPage.notFound.message']).toMatch(/does not exist|has been removed/i);
  });
});