import { Helmet } from 'react-helmet-async';

export interface MetaTagsProps {
  title: string;
  description?: string;
  ogType?: string;
  canonicalUrl?: string;
  publishedTime?: string;
  noindex?: boolean;
  ogImage?: string;
}

export function MetaTags({ title, description, ogType = 'website', canonicalUrl, publishedTime, noindex, ogImage }: MetaTagsProps) {
  const fullTitle = title;
  const canonical = canonicalUrl ?? (typeof window !== 'undefined' ? window.location.href : undefined);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={ogType} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {canonical && <link rel="canonical" href={canonical} />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      {noindex && <meta name="robots" content="noindex" />}
    </Helmet>
  );
}
