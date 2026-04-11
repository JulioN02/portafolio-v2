import { useRecentSuccessCases } from '../../hooks/useSuccessCases';
import { Loading } from '../common/Loading';
import styles from './SuccessCaseCarousel.module.css';

export function SuccessCaseCarousel() {
  const { data: cases, isLoading, error } = useRecentSuccessCases(3);

  if (isLoading) return <Loading message="Cargando casos de éxito..." />;
  if (error) return <p className={styles.error}>Error al cargar casos de éxito</p>;
  if (!cases?.length) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Casos de Éxito</h2>
          <p className={styles.subtitle}>
            Proyectos que han transformado negocios
          </p>
        </div>

        <div className={styles.grid}>
          {cases.map((successCase) => (
            <div key={successCase.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                {successCase.images[0] && (
                  <img 
                    src={successCase.images[0]} 
                    alt={successCase.title}
                    className={styles.image}
                    loading="lazy"
                  />
                )}
              </div>
              <div className={styles.content}>
                <h3 className={styles.cardTitle}>{successCase.title}</h3>
                <p className={styles.description}>
                  {successCase.description.length > 120 
                    ? `${successCase.description.substring(0, 120)}...` 
                    : successCase.description}
                </p>
                <div className={styles.links}>
                  {successCase.links?.map((link, i) => (
                    <a 
                      key={i} 
                      href={link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.link}
                    >
                      Ver proyecto
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
