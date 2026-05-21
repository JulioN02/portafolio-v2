import { Helmet } from 'react-helmet-async';

interface MetaTagsProps {
  title: string;
  description?: string;
  ogType?: string;
  canonicalUrl?: string;
  publishedTime?: string;
  noindex?: boolean;
}

export function MetaTags({ title, description, ogType = 'website', canonicalUrl, publishedTime, noindex }: MetaTagsProps) {
  const fullTitle = title;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={ogType} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      {noindex && <meta name="robots" content="noindex" />}
    </Helmet>
  );
}
