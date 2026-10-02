export type PublicImageKind = 'decorative' | 'informative' | 'gallery' | 'rich-text' | 'fallback' | 'lazy';

export interface PublicImageSemantics {
  alt: string;
  loading?: 'lazy' | 'eager';
  editorialReviewRequired: boolean;
}

export function getPublicImageSemantics(
  kind: PublicImageKind,
  options: { alt?: string; title?: string; index?: number } = {},
): PublicImageSemantics {
  if (kind === 'decorative') return { alt: '', editorialReviewRequired: false };
  const authoredAlt = options.alt?.trim();
  if (authoredAlt) return { alt: authoredAlt, loading: kind === 'lazy' ? 'lazy' : undefined, editorialReviewRequired: false };
  const title = options.title?.trim() || 'Imagen de contenido';
  const index = (options.index ?? 0) + 1;
  return {
    alt: `${title} - imagen ${index}`,
    loading: kind === 'lazy' ? 'lazy' : undefined,
    editorialReviewRequired: kind === 'fallback' || kind === 'rich-text' || kind === 'gallery',
  };
}
