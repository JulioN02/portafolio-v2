import { Hero } from './Hero';
import { FeaturedServices } from './FeaturedServices';
import { SuccessCaseCarousel } from '../../components/successCases/SuccessCaseCarousel';
import { ProductCarousel } from '../../components/products/ProductCarousel';
import { ToolCarousel } from '../../components/tools/ToolCarousel';
import { CTA } from './CTA';

export function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedServices />
      <SuccessCaseCarousel />
      <ProductCarousel />
      <ToolCarousel />
      <CTA />
    </>
  );
}
