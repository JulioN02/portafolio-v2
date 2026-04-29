import { Link } from 'react-router-dom';
import type { ToolResponse } from '@jsoft/shared';
import styles from './ToolCard.module.css';

interface ToolCardProps {
  tool: ToolResponse;
}

export function ToolCard({ tool }: ToolCardProps) {
  const imageUrl = tool.images[0] || 'https://placehold.co/400x300/e5e7eb/9ca3af?text=Sin+imagen';

  return (
    <article className={styles.card}>
      <Link to={`/herramientas/${tool.slug}`} className={styles.link}>
        <div className={styles.imageWrapper}>
          <img
            src={imageUrl}
            alt={tool.title}
            className={styles.image}
            loading="lazy"
          />
          {tool.featured && (
            <span className={styles.badge}>Destacado</span>
          )}
        </div>

        <div className={styles.content}>
          <span className={styles.classification}>{tool.classification}</span>
          <h3 className={styles.title}>{tool.title}</h3>
          <p className={styles.description}>{tool.shortDescription}</p>
        </div>
      </Link>
    </article>
  );
}