import { PROFILE } from '@jsoft/shared';

/**
 * Replaces every `{name}` token in an i18n meta-title template with the
 * canonical `PROFILE.fullName` (seo / public-pii-minimization).
 *
 * Translations stay as name-agnostic templates so no personal-name literal
 * lives outside the shared PROFILE constants.
 */
export function buildMetaTitle(template: string): string {
  return template.replace(/\{name\}/g, PROFILE.fullName);
}
