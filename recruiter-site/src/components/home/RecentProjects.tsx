import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { useRecentProjects } from '../../hooks/useProjects';
import { SectionTitle } from '../common/SectionTitle';
import styles from './RecentProjects.module.css';

export function RecentProjects() {
  const [emblaRef] = useEmblaCarousel({
    loop: true,
    align: 'start',
    skipSnaps: false,
  });

  const { data, isLoading, isError, error } = useRecentProjects();

  const projects = data?.data ?? [];

  if (isLoading) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <SectionTitle title="Proyectos Recientes" />
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Cargando proyectos...</p>
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <SectionTitle title="Proyectos Recientes" />
          <div className={styles.errorState}>
            <p>No se pudieron cargar los proyectos.</p>
            <p className={styles.errorDetail}>
              {error instanceof Error ? error.message : 'Error de conexión'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (projects.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <SectionTitle title="Proyectos Recientes" />
          <div className={styles.emptyState}>
            <p>Aún no hay proyectos publicados.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <SectionTitle
          title="Proyectos Recientes"
          subtitle="Conoce algunos de los proyectos en los que he trabajado"
        />

        <div className={styles.embla} ref={emblaRef}>
          <div className={styles.emblaContainer}>
            {projects.map((project) => (
              <div key={project.id} className={styles.emblaSlide}>
                <Link to="/proyectos" className={styles.card}>
                  <div className={styles.cardImageWrapper}>
                    {project.images && project.images.length > 0 ? (
                      <img
                        src={project.images[0]}
                        alt={project.title}
                        className={styles.cardImage}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.cardImagePlaceholder}>
                        <span>{project.title.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.cardBody}>
                    <span className={styles.cardClassification}>
                      {project.classification}
                    </span>
                    <h3 className={styles.cardTitle}>{project.title}</h3>
                    <p className={styles.cardDescription}>{project.description}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <Link to="/proyectos" className={styles.viewAll}>
            Ver todos los proyectos &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
