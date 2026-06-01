import { useState, type SyntheticEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { useServiceBySlug } from '../../hooks/useServices';
import { Loading } from '../../components/common/Loading';
import { Modal } from '@jsoft/shared';
import { ContactForm } from '../../components/forms/ContactForm';
import { MetaTags } from '../../components/seo/MetaTags';
import styles from './ServiceDetail.module.css';

const FALLBACK_IMG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600" fill="%23e5e7eb"%3E%3Crect width="800" height="600"/%3E%3Ctext x="400" y="300" text-anchor="middle" dy=".3em" font-size="20" fill="%239ca3af"%3ESin imagen%3C/text%3E%3C/svg%3E';

export function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: service, isLoading, error } = useServiceBySlug(slug || '');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  if (isLoading) return <Loading fullPage message="Cargando servicio..." />;

  if (error || !service) {
    return (
      <div className={styles.error}>
        <h2>Servicio no encontrado</h2>
        <p>El servicio que buscas no existe o ha sido eliminado.</p>
        <Link to="/servicios" className={styles.backLink}>
          ← Volver a servicios
        </Link>
      </div>
    );
  }

  const images = service.images.length > 0
    ? service.images
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
        title={`${service.title} | J Soft Solutions`}
        description={service.shortDescription}
      />
      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link to="/servicios">Servicios</Link>
          <span>/</span>
          <span>{service.title}</span>
        </nav>

        <div className={styles.grid}>
          {/* Gallery Carousel */}
          <div className={styles.gallery}>
            <div className={styles.carousel}>
              <img
                src={images[currentImageIndex]}
                alt={`${service.title} - Imagen ${currentImageIndex + 1}`}
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
                    aria-label="Imagen anterior"
                  >
                    ‹
                  </button>
                  <button
                    onClick={nextImage}
                    className={`${styles.carouselButton} ${styles.next}`}
                    aria-label="Siguiente imagen"
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
                        aria-label={`Ir a imagen ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className={styles.content}>
            <span className={styles.classification}>{service.classification}</span>
            <h1 className={styles.title}>{service.title}</h1>
            <p className={styles.description}>{service.shortDescription}</p>

            {/* Included Items */}
            {service.includedItems.length > 0 && (
              <div className={styles.included}>
                <h3 className={styles.includedTitle}>Incluye:</h3>
                <ul className={styles.includedList}>
                  {service.includedItems.map((item) => (
                    <li key={item} className={styles.includedItem}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => setIsContactModalOpen(true)}
              className={styles.ctaButton}
            >
              Solicitar información
            </button>
          </div>
        </div>

        {/* Full Description */}
        {service.fullDescription && (
          <div className={styles.fullDescription}>
            <h2>Descripción completa</h2>
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(service.fullDescription) }} />
          </div>
        )}
      </div>

      {/* Contact Modal */}
      <Modal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        title="Solicitar información"
      >
        <ContactForm
          source={`service:${service.title}`}
          onSuccess={() => setIsContactModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
