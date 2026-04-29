import { Link } from 'react-router-dom';
import type { SuccessCaseResponse } from '@jsoft/shared';
import styles from './SuccessCaseCard.module.css';

interface SuccessCaseCardProps {
  successCase: SuccessCaseResponse;
}

export function SuccessCaseCard({ successCase }: SuccessCaseCardProps) {
  const imageUrl = successCase.images[0] || 'https://placehold.co/400x300/e5e7eb/9ca3af?text=Sin+imagen';

  return (
    <article className={styles.card}>
      <Link to={`/casos-de-exito/${successCase.slug}`} className={styles.link}>
        <div className={styles.imageWrapper}>
          <img
            src={imageUrl}
            alt={successCase.title}
            className={styles.image}
            loading="lazy"
          />
        </div>

        <div className={styles.content}>
          <h3 className={styles.title}>{successCase.title}</h3>
          <p className={styles.description}>{successCase.description.substring(0, 150)}...</p>
        </div>
      </Link>
    </article>
  );
}