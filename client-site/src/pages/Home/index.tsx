import { MetaTags } from '../../components/seo/MetaTags';
import { Hero } from './Hero';
import { FeaturedServices } from './FeaturedServices';
import { SuccessCaseCarousel } from '../../components/successCases/SuccessCaseCarousel';
import { ProductCarousel } from '../../components/products/ProductCarousel';
import { ToolCarousel } from '../../components/tools/ToolCarousel';
import { CTA } from './CTA';

export function HomePage() {
  return (
    <>
      <MetaTags
        title="J Soft Solutions | Desarrollo web profesional"
        description="Desarrollo web personalizado en Bogotá. Creamos sitios web, aplicaciones y soluciones digitales para tu negocio."
      />
      <Hero />
      <FeaturedServices />
      <SuccessCaseCarousel />
      <ProductCarousel />
      <ToolCarousel />
      <CTA />
    </>
  );
}
