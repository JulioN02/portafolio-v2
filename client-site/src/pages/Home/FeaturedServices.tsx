import { Link } from 'react-router-dom';
import { useFeaturedServices } from '../../hooks/useServices';
import { ServiceCard } from '../../components/services/ServiceCard';
import { Loading } from '../../components/common/Loading';
import styles from './FeaturedServices.module.css';

export function FeaturedServices() {
  const { data: services, isLoading, error } = useFeaturedServices(3);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Servicios Destacados</h2>
          <p className={styles.subtitle}>
            Soluciones personalizadas para cada necesidad
          </p>
        </div>

        {isLoading && <Loading message="Cargando servicios..." />}

        {error && (
          <p className={styles.error}>
            Error al cargar los servicios. Por favor, intenta de nuevo.
          </p>
        )}

        {services && services.length > 0 && (
          <div className={styles.grid}>
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}

        {services && services.length === 0 && (
          <p className={styles.empty}>
            No hay servicios destacados en este momento.
          </p>
        )}

        <div className={styles.cta}>
          <Link to="/servicios" className={styles.link}>
            Ver todos los servicios →
          </Link>
        </div>
      </div>
    </section>
  );
}
