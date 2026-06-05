import { useState, type SyntheticEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { useTranslation } from '../../i18n/LanguageContext';
import { useToolBySlug } from '../../hooks/useTools';
import { Loading } from '../../components/common/Loading';
import { MetaTags } from '../../components/seo/MetaTags';
import { Modal } from '@jsoft/shared';
import { ContactForm } from '../../components/forms/ContactForm';
import styles from './ToolDetail.module.css';

const FALLBACK_IMG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600" fill="%23e5e7eb"%3E%3Crect width="800" height="600"/%3E%3Ctext x="400" y="300" text-anchor="middle" dy=".3em" font-size="20" fill="%239ca3af"%3ESin imagen%3C/text%3E%3C/svg%3E';

export function ToolDetailPage() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { data: tool, isLoading, error } = useToolBySlug(slug || '');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  if (isLoading) return <Loading fullPage message={t('toolDetail.loading')} />;

  if (error || !tool) {
    return (
      <div className={styles.error}>
        <h2>{t('toolDetail.notFound.title')}</h2>
        <p>{t('toolDetail.notFound.message')}</p>
        <Link to="/herramientas" className={styles.backLink}>
          {t('toolDetail.backToTools')}
        </Link>
      </div>
    );
  }

  const images = tool.images.length > 0
    ? tool.images
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
        title={`${tool.title} | J Soft Solutions`}
        description={tool.shortDescription}
      />
      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link to="/herramientas">{t('toolDetail.breadcrumb.tools')}</Link>
          <span>/</span>
          <span>{tool.title}</span>
        </nav>

        <div className={styles.grid}>
          {/* Gallery Carousel */}
          <div className={styles.gallery}>
            <div className={styles.carousel}>
              <img
                src={images[currentImageIndex]}
                alt={t('toolDetail.imageAlt', { title: tool.title, number: currentImageIndex + 1 })}
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
                    aria-label={t('toolDetail.prevImage')}
                  >
                    ‹
                  </button>
                  <button
                    onClick={nextImage}
                    className={`${styles.carouselButton} ${styles.next}`}
                    aria-label={t('toolDetail.nextImage')}
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
                        aria-label={t('toolDetail.goToImage', { number: index + 1 })}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className={styles.content}>
            <span className={styles.classification}>{tool.classification}</span>
            <h1 className={styles.title}>{tool.title}</h1>
            <p className={styles.description}>{tool.shortDescription}</p>

            {/* Requires Install badge */}
            {tool.requiresInstall && (
              <div className={styles.installBadge}>
                {t('toolDetail.requiresInstall')}
              </div>
            )}

            <button
              onClick={() => setIsContactModalOpen(true)}
              className={styles.ctaButton}
            >
              {t('toolDetail.requestInfo')}
            </button>
          </div>
        </div>

        {/* Full Description */}
        {tool.fullDescription && (
          <div className={styles.fullDescription}>
            <h2>{t('toolDetail.fullDescription')}</h2>
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(tool.fullDescription) }} />
          </div>
        )}
      </div>

      {/* Contact Modal */}
      <Modal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        title={t('toolDetail.requestInfo')}
      >
        <ContactForm
          source={`tool:${tool.title}`}
          onSuccess={() => setIsContactModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
