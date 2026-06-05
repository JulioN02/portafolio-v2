import { useState, type SyntheticEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import { useSuccessCaseBySlug } from '../../hooks/useSuccessCases';
import { Loading } from '../../components/common/Loading';
import { MetaTags } from '../../components/seo/MetaTags';
import styles from './SuccessCaseDetail.module.css';

const FALLBACK_IMG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600" fill="%23e5e7eb"%3E%3Crect width="800" height="600"/%3E%3Ctext x="400" y="300" text-anchor="middle" dy=".3em" font-size="20" fill="%239ca3af"%3ESin imagen%3C/text%3E%3C/svg%3E';

export function SuccessCaseDetailPage() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { data: successCase, isLoading, error } = useSuccessCaseBySlug(slug || '');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (isLoading) return <Loading fullPage message={t('successCaseDetail.loading')} />;

  if (error || !successCase) {
    return (
      <div className={styles.error}>
        <h2>{t('successCaseDetail.notFound.title')}</h2>
        <p>{t('successCaseDetail.notFound.message')}</p>
        <Link to="/casos-de-exito" className={styles.backLink}>
          {t('successCaseDetail.backToCases')}
        </Link>
      </div>
    );
  }

  const images = successCase.images.length > 0
    ? successCase.images
    : ['https://placehold.co/800x600/e5e7eb/9ca3af?text=Sin+imagen'];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className={styles.page}>
      <MetaTags
        title={`${successCase.title} | J Soft Solutions`}
        description={successCase.description}
      />
      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link to="/casos-de-exito">{t('successCaseDetail.breadcrumb.cases')}</Link>
          <span>/</span>
          <span>{successCase.title}</span>
        </nav>

        <div className={styles.grid}>
          {/* Gallery Carousel */}
          <div className={styles.gallery}>
            <div className={styles.carousel}>
              <img
                src={images[currentImageIndex]}
                alt={t('successCaseDetail.imageAlt', { title: successCase.title, number: currentImageIndex + 1 })}
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
                    aria-label={t('successCaseDetail.prevImage')}
                  >
                    ‹
                  </button>
                  <button
                    onClick={nextImage}
                    className={`${styles.carouselButton} ${styles.next}`}
                    aria-label={t('successCaseDetail.nextImage')}
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
                        aria-label={t('successCaseDetail.goToImage', { number: index + 1 })}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className={styles.content}>
            <h1 className={styles.title}>{successCase.title}</h1>
            <p className={styles.description}>{successCase.description}</p>

            {/* Links */}
            {successCase.links && successCase.links.length > 0 && (
              <div className={styles.linksSection}>
                <h3 className={styles.linksTitle}>{t('successCaseDetail.relatedLinks')}</h3>
                <ul className={styles.linksList}>
                  {successCase.links.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.linkItem}
                      >
                        🔗 {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        </div>

        {/* Videos Section */}
        {successCase.videos && successCase.videos.length > 0 && (
          <div className={styles.videosSection}>
            <h2>{t('successCaseDetail.videos')}</h2>
            <div className={styles.videosGrid}>
              {successCase.videos.map((video, index) => (
                <div key={index} className={styles.videoWrapper}>
                  <video
                    controls
                    className={styles.video}
                    src={video}
                  >
                    {t('successCaseDetail.videoNotSupported')}
                  </video>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
