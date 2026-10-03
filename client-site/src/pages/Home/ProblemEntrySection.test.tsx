import { describe, expect, it } from 'vitest';
import { SERVICE_PROBLEM_ENTRIES } from '@jsoft/shared';
import { getEvidenceSummary } from '../../components/services/serviceEvidence';

describe('problem entry and service evidence behavior', () => {
  it('exposes keyboard-safe labels for every approved problem', () => {
    expect(SERVICE_PROBLEM_ENTRIES.map((entry) => entry.label)).toEqual([
      'No aparezco en Internet', 'Muestro mis productos solo por redes',
      'Pierdo reservas/pedidos', 'Tengo procesos manuales',
      'Necesito un sistema', 'Necesito soporte tecnológico',
    ]);
  });

  it('summarizes only evidence that exists and provides a useful empty fallback', () => {
    expect(getEvidenceSummary({ images: ['cover', 'gallery'], technicalImages: ['technical'], includedItems: ['Entrega'], externalLink: 'https://demo.example' })).toEqual({ gallery: 1, technical: 1, included: 1, hasDemo: true });
    expect(getEvidenceSummary({ images: [], technicalImages: [], includedItems: [], externalLink: undefined })).toEqual({ gallery: 0, technical: 0, included: 0, hasDemo: false });
  });
});
