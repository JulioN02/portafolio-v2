import { Link } from 'react-router-dom';
import type { ProductResponse } from '@jsoft/shared';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: ProductResponse;
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images[0] || 'https://placehold.co/400x300/e5e7eb/9ca3af?text=Sin+imagen';

  return (
    <article className={styles.card}>
      <Link to={`/productos/${product.slug}`} className={styles.link}>
        <div className={styles.imageWrapper}>
          <img
            src={imageUrl}
            alt={product.title}
            className={styles.image}
            loading="lazy"
          />
          {product.featured && (
            <span className={styles.badge}>Destacado</span>
          )}
        </div>

        <div className={styles.content}>
          <span className={styles.classification}>{product.classification}</span>
          <h3 className={styles.title}>{product.title}</h3>
          <p className={styles.description}>{product.shortDescription}</p>
        </div>
      </Link>
    </article>
  );
}