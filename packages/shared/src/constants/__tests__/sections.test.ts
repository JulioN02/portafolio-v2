import { describe, it, expect } from 'vitest';
import { DEFAULT_SECTION_ORDER, DEFAULT_SECTION_KEYS, resolveDefaultSectionOrder } from '../sections';

describe('DEFAULT_SECTION_ORDER', () => {
  it('contains the four default homepage sections', () => {
    expect(DEFAULT_SECTION_ORDER).toHaveLength(4);
    expect(DEFAULT_SECTION_ORDER.map((section) => section.key)).toEqual([
      'services',
      'success-cases',
      'products',
      'tools',
    ]);
  });

  it('assigns ascending order 0..3', () => {
    expect(DEFAULT_SECTION_ORDER.map((section) => section.order)).toEqual([0, 1, 2, 3]);
  });

  it('marks every default section visible', () => {
    for (const section of DEFAULT_SECTION_ORDER) {
      expect(section.visible).toBe(true);
    }
  });

  it('DEFAULT_SECTION_KEYS matches the order entries in sequence', () => {
    expect(DEFAULT_SECTION_KEYS).toEqual(['services', 'success-cases', 'products', 'tools']);
  });
});

describe('resolveDefaultSectionOrder', () => {
  it('returns the default order unchanged', () => {
    const resolved = resolveDefaultSectionOrder();
    expect(resolved).toEqual(DEFAULT_SECTION_ORDER);
  });

  it('always returns visible=true for every entry', () => {
    const resolved = resolveDefaultSectionOrder();
    expect(resolved.every((section) => section.visible)).toBe(true);
  });

  it('returns a fresh array (defensive copy)', () => {
    const first = resolveDefaultSectionOrder();
    const second = resolveDefaultSectionOrder();
    expect(first).not.toBe(second);
    expect(first[0]).not.toBe(second[0]);
    expect(second[0].key).toBe('services');
  });
});
