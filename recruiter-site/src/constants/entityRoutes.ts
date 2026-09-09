/**
 * Recruiter entity-detail route helpers. All 5 entity types share ONE dynamic
 * route — /proyectos/:tipo/:slug — so the "Ver Completo" navigation and the
 * detail page resolve the type the same way.
 */

/** Normalizes API type values (lowercase or legacy UPPERCASE) to canonical keys. */
export const NORMALIZED_TYPE_MAP: Record<string, string> = {
  service: 'service',
  product: 'product',
  tool: 'tool',
  successCase: 'successCase',
  project: 'project',
  laboratorio: 'laboratorio',
  SERVICE: 'service',
  PRODUCT: 'product',
  TOOL: 'tool',
  SUCCESS_CASE: 'successCase',
} as const;

/** Canonical type for an API value (identity fallback for unknown values). */
export function normalizeEntityType(type: string): string {
  return NORMALIZED_TYPE_MAP[type] ?? type;
}

/** Detail route for an entity: /proyectos/:tipo/:slug (normalized tipo). */
export function entityDetailPath(type: string, slug: string): string {
  return `/proyectos/${normalizeEntityType(type)}/${slug}`;
}