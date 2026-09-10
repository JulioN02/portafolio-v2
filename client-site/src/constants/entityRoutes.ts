/**
 * Per-type detail route prefixes for the 5 client entity types. The generic
 * EntityPreviewModal uses this map to build the "Ver Completo" destination:
 * `${ROUTE_MAP[type]}/${entity.slug}` — routes live in ONE place.
 */
export const ROUTE_MAP = {
  service: '/servicios',
  product: '/productos',
  tool: '/herramientas',
  successCase: '/casos-de-exito',
  project: '/proyectos',
} as const;

export type PreviewEntityType = keyof typeof ROUTE_MAP;

/** Absolute detail path for an entity of a given type. */
export function entityDetailPath(type: PreviewEntityType, slug: string): string {
  return `${ROUTE_MAP[type]}/${slug}`;
}