import { describe, expect, it } from 'vitest';
import { readConsent, saveConsent } from './consent';
describe('recruiter consent', () => { it('persists rejection', () => { const values = new Map<string, string>(); const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) }; saveConsent('rejected', storage); expect(readConsent(storage)).toBe('rejected'); }); });
