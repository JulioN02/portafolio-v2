/**
 * Canonical phone-number validation shared by the contact schemas (API) and
 * the public contact forms (client-site / recruiter-site). Single source of
 * truth so the frontends and the API never disagree on an acceptable format.
 */
export const PHONE_REGEX = /^\+?[0-9]{10,15}$/;

/**
 * Normalizes a human-entered phone number to canonical digits (with an
 * optional leading `+`). Strips spaces, dashes, parentheses, and dots.
 *
 * Examples:
 *   '+57 300 372-7134'  → '+573003727134'
 *   '300-372-7134'      → '3003727134'
 *   '(300) 372.7134'    → '3003727134'
 *
 * A leading `+` is preserved only when it appears at the very start of the
 * input; any other non-digit character is dropped.
 */
export function normalizePhone(input: string): string {
  const plus = input.startsWith('+') ? '+' : '';
  const digits = input.replace(/\D/g, '');
  return plus + digits;
}
