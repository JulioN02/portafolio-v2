import { describe, expect, it } from 'vitest';
import { buildSafeShareUrl } from './share';

describe('share URL', () => {
  it('accepts the current public URL and strips credentials', () => {
    expect(buildSafeShareUrl('https://example.com/proyectos/demo?token=secret')).toBe('https://example.com/proyectos/demo');
  });

  it('rejects non-http URLs', () => {
    expect(buildSafeShareUrl('javascript:alert(1)')).toBeNull();
  });
});
