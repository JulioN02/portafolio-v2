import { MetaTags } from '../components/seo/MetaTags';
import { BlogGrid } from '../components/blog/BlogGrid';

export function BlogPage() {
  return (
    <main>
      <MetaTags
        title="Blog | Julio Nieto"
        description="Artículos sobre desarrollo web, tecnología y experiencia como desarrollador."
      />
      <BlogGrid />
    </main>
  );
}
