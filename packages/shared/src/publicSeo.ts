export interface PublicMetadata {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
}

export function buildPublicMetadata(input: PublicMetadata): PublicMetadata {
  const title = input.title.trim();
  const description = input.description.trim();
  const canonical = new URL(input.canonical).toString();
  return {
    ...input,
    title,
    description,
    canonical,
    ogTitle: input.ogTitle?.trim() || title,
    ogDescription: input.ogDescription?.trim() || description,
    ogType: input.ogType ?? 'website',
  };
}

export function h1DiffersFromTitle(h1: string, title: string): boolean {
  return h1.trim().length > 0 && title.trim().length > 0 && h1.trim() !== title.trim();
}
