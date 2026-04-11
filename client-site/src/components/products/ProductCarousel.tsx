import { Link } from 'react-router-dom';
import { useFeaturedProducts } from '../../hooks/useProducts';
import { Loading } from '../common/Loading';
import styles from './ProductCarousel.module.css';

export function ProductCarousel() {
  const { data: products, isLoading, error } = useFeaturedProducts(5);

  if (isLoading) return <Loading message="Cargando productos..." />;
  if (error) return <p className={styles.error}>Error al cargar productos</p>;
  if (!products?.length) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Productos</h2>
          <p className={styles.subtitle}>
            Soluciones digitales listas para implementar
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
                  <span className={styles.badge}>Destacado</span>
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
                  Ver más →
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.cta}>
          <Link to="/productos" className={styles.viewAll}>
            Ver todos los productos →
          </Link>
        </div>
      </div>
    </section>
  );
}
