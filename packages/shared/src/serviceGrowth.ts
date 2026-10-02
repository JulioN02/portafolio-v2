export const SERVICE_CLASSIFICATIONS = [
  'Desarrollo web',
  'Comercio electrónico',
  'Automatización',
  'Sistemas a la medida',
  'Soporte tecnológico',
] as const;

export type ServiceClassification = (typeof SERVICE_CLASSIFICATIONS)[number];

export const SERVICE_PROBLEM_ENTRIES = [
  { key: 'visibility', label: 'No aparezco en Internet', classification: 'Desarrollo web' },
  { key: 'catalog', label: 'Muestro mis productos solo por redes', classification: 'Comercio electrónico' },
  { key: 'orders', label: 'Pierdo reservas/pedidos', classification: 'Automatización' },
  { key: 'manual', label: 'Tengo procesos manuales', classification: 'Automatización' },
  { key: 'system', label: 'Necesito un sistema', classification: 'Sistemas a la medida' },
  { key: 'support', label: 'Necesito soporte tecnológico', classification: 'Soporte tecnológico' },
] as const;

export function resolveServiceClassification(classification: string): ServiceClassification | 'legacy' {
  const normalized = classification.trim().toLocaleLowerCase();
  const match = SERVICE_CLASSIFICATIONS.find((value) => value.toLocaleLowerCase() === normalized);
  return match ?? 'legacy';
}

export function serviceMatchesClassification(classification: string, selected: ServiceClassification): boolean {
  const normalized = classification.trim().toLocaleLowerCase();
  return normalized === selected.toLocaleLowerCase();
}

export function isSafeExternalDemo(value: string | null | undefined): value is `https://${string}` {
  if (!value) return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}
