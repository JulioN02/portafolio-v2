/**
 * Client homepage default section order/visibility.
 *
 * Used when /api/site-sections fails or returns an empty list, so the
 * homepage never silently hides its dynamic sections.
 */
export const DEFAULT_SECTION_ORDER = [
  { key: 'services', label: 'Servicios', visible: true, order: 0 },
  { key: 'success-cases', label: 'Casos de éxito', visible: true, order: 1 },
  { key: 'products', label: 'Productos', visible: true, order: 2 },
  { key: 'tools', label: 'Herramientas', visible: true, order: 3 },
] as const;

export type DefaultSection = (typeof DEFAULT_SECTION_ORDER)[number];
export type HomeSectionKey = DefaultSection['key'];

export const DEFAULT_SECTION_KEYS: HomeSectionKey[] = [
  'services',
  'success-cases',
  'products',
  'tools',
];

/**
 * Returns a defensive copy of the default section order (always visible).
 */
export function resolveDefaultSectionOrder(): DefaultSection[] {
  return DEFAULT_SECTION_ORDER.map((section) => ({ ...section }));
}
