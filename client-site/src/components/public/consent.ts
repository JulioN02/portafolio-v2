export type ConsentChoice = 'accepted' | 'rejected' | 'unset';
export const CONSENT_STORAGE_KEY = 'jsoft-consent-v1';
export interface StorageLike { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem?(key: string): void; }

export function readConsent(storage: StorageLike | undefined = typeof window !== 'undefined' ? window.localStorage : undefined): ConsentChoice {
  try {
    const value = storage?.getItem(CONSENT_STORAGE_KEY);
    return value === 'accepted' || value === 'rejected' ? value : 'unset';
  } catch { return 'unset'; }
}

export function saveConsent(choice: Exclude<ConsentChoice, 'unset'>, storage: StorageLike | undefined = typeof window !== 'undefined' ? window.localStorage : undefined): void {
  try { storage?.setItem(CONSENT_STORAGE_KEY, choice); } catch { /* blocked storage is non-fatal */ }
}

export function reopenConsent(storage: StorageLike | undefined = typeof window !== 'undefined' ? window.localStorage : undefined): void {
  try { storage?.removeItem?.(CONSENT_STORAGE_KEY); } catch { /* blocked storage is non-fatal */ }
}
