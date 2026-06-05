import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { useRecentProjects } from '../../hooks/useProjects';
import { SectionTitle } from '../common/SectionTitle';
import { useTranslation } from '../../i18n/LanguageContext';
import styles from './RecentProjects.module.css';

export function RecentProjects() {
  const { t } = useTranslation();
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
          <SectionTitle title={t('recentProjects.title')} />
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>{t('recentProjects.loading')}</p>
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <SectionTitle title={t('recentProjects.title')} />
          <div className={styles.errorState}>
            <p>{t('recentProjects.error')}</p>
            <p className={styles.errorDetail}>
              {error instanceof Error ? error.message : t('recentProjects.errorDetail')}
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
          <SectionTitle title={t('recentProjects.title')} />
          <div className={styles.emptyState}>
            <p>{t('recentProjects.empty')}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <SectionTitle
          title={t('recentProjects.title')}
          subtitle={t('recentProjects.subtitle')}
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
                    <p className={styles.cardDescription}>{project.shortDescription}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <Link to="/proyectos" className={styles.viewAll}>
            {t('recentProjects.viewAll')}
          </Link>
        </div>
      </div>
    </section>
  );
}
