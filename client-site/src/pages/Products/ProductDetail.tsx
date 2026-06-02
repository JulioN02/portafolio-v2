import { useState, type SyntheticEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { useProductBySlug } from '../../hooks/useProducts';
import { Loading } from '../../components/common/Loading';
import { MetaTags } from '../../components/seo/MetaTags';
import { Modal } from '@jsoft/shared';
import { ContactForm } from '../../components/forms/ContactForm';
import styles from './ProductDetail.module.css';

const FALLBACK_IMG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600" fill="%23e5e7eb"%3E%3Crect width="800" height="600"/%3E%3Ctext x="400" y="300" text-anchor="middle" dy=".3em" font-size="20" fill="%239ca3af"%3ESin imagen%3C/text%3E%3C/svg%3E';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = useProductBySlug(slug || '');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  if (isLoading) return <Loading fullPage message="Cargando producto..." />;

  if (error || !product) {
    return (
      <div className={styles.error}>
        <h2>Producto no encontrado</h2>
        <p>El producto que buscas no existe o ha sido eliminado.</p>
        <Link to="/productos" className={styles.backLink}>
          ← Volver a productos
        </Link>
      </div>
    );
  }

  const images = product.images.length > 0
    ? product.images
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
        title={`${product.title} | J Soft Solutions`}
        description={product.shortDescription}
      />
      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link to="/productos">Productos</Link>
          <span>/</span>
          <span>{product.title}</span>
        </nav>

        <div className={styles.grid}>
          {/* Gallery Carousel */}
          <div className={styles.gallery}>
            <div className={styles.carousel}>
              <img
                src={images[currentImageIndex]}
                alt={`${product.title} - Imagen ${currentImageIndex + 1}`}
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
            <span className={styles.classification}>{product.classification}</span>
            <h1 className={styles.title}>{product.title}</h1>
            <p className={styles.description}>{product.shortDescription}</p>

            {/* External Link */}
            {product.externalLink && (
              <a
                href={product.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.externalLink}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                </svg>
                Ver sitio web del producto
              </a>
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
        {product.fullDescription && (
          <div className={styles.fullDescription}>
            <h2>Descripción completa</h2>
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.fullDescription) }} />
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
          source={`product:${product.title}`}
          onSuccess={() => setIsContactModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
