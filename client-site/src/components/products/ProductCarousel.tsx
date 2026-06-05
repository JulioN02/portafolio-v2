import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import { useFeaturedProducts } from '../../hooks/useProducts';
import { Loading } from '../common/Loading';
import styles from './ProductCarousel.module.css';

export function ProductCarousel() {
  const { t } = useTranslation();
  const { data: products, isLoading, error } = useFeaturedProducts(5);

  if (isLoading) return <Loading message={t('productCarousel.loading')} />;
  if (error) return <p className={styles.error}>{t('productCarousel.error')}</p>;
  if (!products?.length) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('productCarousel.title')}</h2>
          <p className={styles.subtitle}>
            {t('productCarousel.subtitle')}
          </p>
        </div>

        <div className={styles.grid}>
          {products.map((product) => (
            <div key={product.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                {product.images[0] && (
                  <img 
                    src={product.images[0]} 
                    alt={product.title}
                    className={styles.image}
                    loading="lazy"
                  />
                )}
                {product.featured && (
                  <span className={styles.badge}>{t('productCarousel.featured')}</span>
                )}
              </div>
              <div className={styles.content}>
                <span className={styles.classification}>{product.classification}</span>
                <h3 className={styles.cardTitle}>{product.title}</h3>
                <p className={styles.description}>
                  {product.shortDescription.length > 100 
                    ? `${product.shortDescription.substring(0, 100)}...` 
                    : product.shortDescription}
                </p>
                <Link to={`/productos/${product.slug}`} className={styles.link}>
                  {t('productCarousel.viewMore')}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.cta}>
          <Link to="/productos" className={styles.viewAll}>
            {t('productCarousel.viewAll')}
          </Link>
        </div>
      </div>
    </section>
  );
}
