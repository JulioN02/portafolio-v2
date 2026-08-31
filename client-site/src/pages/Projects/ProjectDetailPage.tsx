import { useState, type SyntheticEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { sanitizeHtml } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import { useProjectBySlug } from '../../hooks/useProjects';
import { Loading } from '../../components/common/Loading';
import { MetaTags } from '../../components/seo/MetaTags';
import styles from './ProjectDetail.module.css';

const FALLBACK_IMG = 'https://placehold.co/800x600/e5e7eb/9ca3af?text=Sin+imagen';

export function ProjectDetailPage() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { data: project, isLoading, error } = useProjectBySlug(slug || '');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (isLoading) return <Loading fullPage message={t('projectDetail.loading')} />;

  if (error || !project) {
    return (
      <div className={styles.error}>
        <h2>{t('projectDetail.notFound.title')}</h2>
        <p>{t('projectDetail.notFound.message')}</p>
        <Link to="/proyectos" className={styles.backLink}>
          {t('projectDetail.backToProjects')}
        </Link>
      </div>
    );
  }

  const images = project.images && project.images.length > 0
    ? project.images
    : [FALLBACK_IMG];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className={styles.page}>
      <MetaTags
        title={`${project.title} | J Soft Solutions`}
        description={project.shortDescription}
      />
      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link to="/proyectos">{t('projectDetail.breadcrumb.projects')}</Link>
          <span>/</span>
          <span>{project.title}</span>
        </nav>

        <div className={styles.grid}>
          {/* Gallery Carousel */}
          <div className={styles.gallery}>
            <div className={styles.carousel}>
              <img
                src={images[currentImageIndex]}
                alt={t('projectDetail.imageAlt', { title: project.title, number: currentImageIndex + 1 })}
                className={styles.carouselImage}
                onError={(e: SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.src = FALLBACK_IMG;
                }}
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className={`${styles.carouselButton} ${styles.prev}`}
                    aria-label={t('projectDetail.prevImage')}
                  >
                    ‹
                  </button>
                  <button
                    onClick={nextImage}
                    className={`${styles.carouselButton} ${styles.next}`}
                    aria-label={t('projectDetail.nextImage')}
                  >
                    ›
                  </button>

                  <div className={styles.carouselDots}>
                    {images.map((_, index) => (
                      <button
                        key={`dot-${index}`}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`${styles.dot} ${
                          index === currentImageIndex ? styles.active : ''
                        }`}
                        aria-label={t('projectDetail.goToImage', { number: index + 1 })}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className={styles.content}>
            {project.tags && project.tags.length > 0 && (
              <div className={styles.tags}>
                {project.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <h1 className={styles.title}>{project.title}</h1>
            <p className={styles.description}>{project.shortDescription}</p>

            {project.repositoryUrl && (
              <a
                href={project.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.repoLink}
              >
                {t('projectDetail.repository')} →
              </a>
            )}
          </div>
        </div>

        {/* Rich body (sanitized with media allowlist) */}
        {project.body && (
          <div className={styles.body}>
            <h2>{t('projectDetail.body')}</h2>
            <div
              className={styles.bodyContent}
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(project.body, { allowMedia: true }),
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}