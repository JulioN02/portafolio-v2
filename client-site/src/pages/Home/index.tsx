import { MetaTags } from '../../components/seo/MetaTags';
import { Hero } from './Hero';
import { FeaturedServices } from './FeaturedServices';
import { SuccessCaseCarousel } from '../../components/successCases/SuccessCaseCarousel';
import { ProductCarousel } from '../../components/products/ProductCarousel';
import { ToolCarousel } from '../../components/tools/ToolCarousel';
import { CTA } from './CTA';
import { useVisibleSections } from '../../hooks/useSiteSections';

export function HomePage() {
  const { visible, isLoading, error } = useVisibleSections();

  // Mientras carga o si hay error, mostramos todo el contenido
  const showSection = (key: string) => isLoading || error || visible.has(key);

  return (
    <>
      <MetaTags
        title="J Soft Solutions | Desarrollo web profesional"
        description="Desarrollo web personalizado en Bogotá. Creamos sitios web, aplicaciones y soluciones digitales para tu negocio."
      />
      <Hero />
      {showSection('services') && <FeaturedServices />}
      {showSection('success-cases') && <SuccessCaseCarousel />}
      {showSection('products') && <ProductCarousel />}
      {showSection('tools') && <ToolCarousel />}
      <CTA />
    </>
  );
}
