import { useTranslation } from '../../i18n/LanguageContext';
import { MetaTags } from '../../components/seo/MetaTags';
import { Hero } from './Hero';
import { FeaturedServices } from './FeaturedServices';
import { SuccessCaseCarousel } from '../../components/successCases/SuccessCaseCarousel';
import { ProductCarousel } from '../../components/products/ProductCarousel';
import { ToolCarousel } from '../../components/tools/ToolCarousel';
import { CTA } from './CTA';
import { useVisibleSections } from '../../hooks/useSiteSections';

/** Map section key → component */
const SECTION_COMPONENTS: Record<string, React.FC> = {
  services: FeaturedServices,
  'success-cases': SuccessCaseCarousel,
  products: ProductCarousel,
  tools: ToolCarousel,
};

export function HomePage() {
  const { t } = useTranslation();
  const { sections, isLoading, error } = useVisibleSections();

  // Mientras carga o si hay error, mostramos todo en el orden por defecto
  const showAll = isLoading || error;

  const orderedKeys = showAll
    ? ['services', 'success-cases', 'products', 'tools']
    : sections.map((s) => s.key);

  return (
    <>
      <MetaTags
        title={t('home.meta.title')}
        description={t('home.meta.description')}
      />
      <Hero />
      {orderedKeys.map((key) => {
        const Component = SECTION_COMPONENTS[key];
        return Component ? <Component key={key} /> : null;
      })}
      <CTA />
    </>
  );
}
