import { Link } from 'react-router-dom';
import { sanitizeHtml } from '@jsoft/shared';
import type { ServiceResponse } from '@jsoft/shared';
import styles from './ServiceCard.module.css';

interface ServiceCardProps {
  service: ServiceResponse;
  /**
   * Fired when the card is activated (opens the service preview modal).
   * When omitted the card keeps direct Link navigation (home featured teaser
   * — preview modal is out of scope there).
   */
  onSelect?: (service: ServiceResponse) => void;
}

export function ServiceCard({ service, onSelect }: ServiceCardProps) {
  const imageUrl = service.images[0] || 'https://placehold.co/400x300/e5e7eb/9ca3af?text=Sin+imagen';

  const content = (
    <>
      <div className={styles.imageWrapper}>
        <img
          src={imageUrl}
          alt={service.title}
          className={styles.image}
          loading="lazy"
        />
      </div>

      <div className={styles.content}>
        <span className={styles.classification}>{service.classification}</span>
        <h3 className={styles.title}>{service.title}</h3>
        <p
          className={styles.description}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(service.shortDescription) }}
        />
      </div>
    </>
  );

  if (!onSelect) {
    return (
      <article className={styles.card}>
        <Link to={`/servicios/${service.slug}`} className={styles.link}>
          {content}
        </Link>
      </article>
    );
  }

  return (
    <article className={styles.card}>
      <button type="button" className={styles.link} onClick={() => onSelect(service)}>
        {content}
      </button>
    </article>
  );
}