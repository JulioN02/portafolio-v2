import { describe, expect, it } from 'vitest';
import { CONSENT_STORAGE_KEY, readConsent, saveConsent } from './consent';

describe('consent persistence', () => {
  it('uses a versioned key and safely persists rejection', () => {
    const storage = new Map<string, string>();
    const adapter = { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value) };
    saveConsent('rejected', adapter);
    expect(CONSENT_STORAGE_KEY).toContain('v1');
    expect(readConsent(adapter)).toBe('rejected');
  });

  it('falls back to unset when storage is unavailable', () => {
    const broken = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
    expect(readConsent(broken)).toBe('unset');
    expect(() => saveConsent('accepted', broken)).not.toThrow();
  });
});
