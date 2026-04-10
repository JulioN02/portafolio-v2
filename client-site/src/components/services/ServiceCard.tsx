import { Link } from 'react-router-dom';
import type { ServiceResponse } from '@jsoft/shared';
import styles from './ServiceCard.module.css';

interface ServiceCardProps {
  service: ServiceResponse;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const imageUrl = service.images[0] || 'https://placehold.co/400x300/e5e7eb/9ca3af?text=Sin+imagen';

  return (
    <article className={styles.card}>
      <Link to={`/servicios/${service.slug}`} className={styles.link}>
        <div className={styles.imageWrapper}>
          <img
            src={imageUrl}
            alt={service.title}
            className={styles.image}
            loading="lazy"
          />
          {service.featured && (
            <span className={styles.badge}>Destacado</span>
          )}
        </div>

        <div className={styles.content}>
          <span className={styles.classification}>{service.classification}</span>
          <h3 className={styles.title}>{service.title}</h3>
          <p className={styles.description}>{service.shortDescription}</p>
        </div>
      </Link>
    </article>
  );
}
