import { describe, expect, it } from 'vitest';
import { CONSENT_STORAGE_KEY, reopenConsent } from './consent';

describe('consent preferences', () => {
  it('clears a saved choice so the banner can be intentionally reopened', () => {
    const values = new Map<string, string>();
    reopenConsent({ getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) });
    expect(values.has(CONSENT_STORAGE_KEY)).toBe(false);
  });
});
