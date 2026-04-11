import { Link } from 'react-router-dom';
import { useFeaturedTools } from '../../hooks/useTools';
import { Loading } from '../common/Loading';
import styles from './ToolCarousel.module.css';

export function ToolCarousel() {
  const { data: tools, isLoading, error } = useFeaturedTools(3);

  if (isLoading) return <Loading message="Cargando herramientas..." />;
  if (error) return <p className={styles.error}>Error al cargar herramientas</p>;
  if (!tools?.length) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Herramientas</h2>
          <p className={styles.subtitle}>
            Recursos que aceleran tu desarrollo
          </p>
        </div>

        <div className={styles.grid}>
          {tools.map((tool) => (
            <div key={tool.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                {tool.images[0] && (
                  <img 
                    src={tool.images[0]} 
                    alt={tool.title}
                    className={styles.image}
                    loading="lazy"
                  />
                )}
                {tool.requiresInstall && (
                  <span className={styles.badge}>Requiere instalación</span>
                )}
              </div>
              <div className={styles.content}>
                <span className={styles.classification}>{tool.classification}</span>
                <h3 className={styles.cardTitle}>{tool.title}</h3>
                <p className={styles.description}>
                  {tool.shortDescription.length > 100 
                    ? `${tool.shortDescription.substring(0, 100)}...` 
                    : tool.shortDescription}
                </p>
                <Link to={`/herramientas/${tool.slug}`} className={styles.link}>
                  Ver detalles →
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.cta}>
          <Link to="/herramientas" className={styles.viewAll}>
            Ver todas las herramientas →
          </Link>
        </div>
      </div>
    </section>
  );
}
