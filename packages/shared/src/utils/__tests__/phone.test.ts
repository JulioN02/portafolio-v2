import { describe, it, expect } from 'vitest';
import { normalizePhone, PHONE_REGEX } from '../phone';

describe('normalizePhone', () => {
  it('strips spaces, dashes, parentheses and dots', () => {
    expect(normalizePhone('+57 300 372-7134')).toBe('+573003727134');
    expect(normalizePhone('300-372-7134')).toBe('3003727134');
    expect(normalizePhone('(300) 372.7134')).toBe('3003727134');
    expect(normalizePhone('+57 (300) 372-7134')).toBe('+573003727134');
  });

  it('keeps a leading + but drops one elsewhere', () => {
    expect(normalizePhone('+573001112233')).toBe('+573001112233');
    expect(normalizePhone('300+111+2233')).toBe('3001112233');
  });

  it('returns digits only for already-canonical input', () => {
    expect(normalizePhone('3003727134')).toBe('3003727134');
    expect(normalizePhone('+573003727134')).toBe('+573003727134');
  });

  it('returns an empty string when there are no digits', () => {
    expect(normalizePhone('abc')).toBe('');
    expect(normalizePhone('')).toBe('');
    expect(normalizePhone('+')).toBe('+');
  });
});

describe('PHONE_REGEX', () => {
  it('accepts canonical 10–15 digit numbers with optional leading +', () => {
    expect(PHONE_REGEX.test('3003727134')).toBe(true);
    expect(PHONE_REGEX.test('+573003727134')).toBe(true);
  });

  it('rejects non-digit characters and out-of-range lengths', () => {
    expect(PHONE_REGEX.test('300 372 7134')).toBe(false);
    expect(PHONE_REGEX.test('123')).toBe(false);
    expect(PHONE_REGEX.test('1234567890123456')).toBe(false);
    expect(PHONE_REGEX.test('abc')).toBe(false);
  });
});
