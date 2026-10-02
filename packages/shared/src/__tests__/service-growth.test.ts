import { describe, expect, it } from 'vitest';
import {
  SERVICE_CLASSIFICATIONS,
  SERVICE_PROBLEM_ENTRIES,
  resolveServiceClassification,
  serviceMatchesClassification,
  isSafeExternalDemo,
} from '../serviceGrowth.js';

describe('service growth taxonomy', () => {
  it('maps each approved problem to a controlled classification', () => {
    expect(SERVICE_PROBLEM_ENTRIES).toHaveLength(6);
    expect(SERVICE_PROBLEM_ENTRIES.map((entry) => entry.classification)).toEqual([
      'Desarrollo web', 'Comercio electrónico', 'Automatización',
      'Automatización', 'Sistemas a la medida', 'Soporte tecnológico',
    ]);
  });

  it('keeps unknown legacy classifications readable through a fallback', () => {
    expect(resolveServiceClassification('Web')).toBe('legacy');
    expect(resolveServiceClassification(' desarrollo web ')).toBe('Desarrollo web');
    expect(SERVICE_CLASSIFICATIONS).toContain('Soporte tecnológico');
  });

  it('matches only the selected canonical classification', () => {
    expect(serviceMatchesClassification('Automatización', 'Automatización')).toBe(true);
    expect(serviceMatchesClassification('Sistemas', 'Sistemas a la medida')).toBe(false);
  });

  it('allows only HTTPS demos for public rendering', () => {
    expect(isSafeExternalDemo('https://demo.example')).toBe(true);
    expect(isSafeExternalDemo('http://demo.example')).toBe(false);
    expect(isSafeExternalDemo('javascript:alert(1)')).toBe(false);
  });
});
