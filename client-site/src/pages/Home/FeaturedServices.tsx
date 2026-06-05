import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import { useFeaturedServices } from '../../hooks/useServices';
import { ServiceCard } from '../../components/services/ServiceCard';
import { Loading } from '../../components/common/Loading';
import styles from './FeaturedServices.module.css';

export function FeaturedServices() {
  const { t } = useTranslation();
  const { data: services, isLoading, error } = useFeaturedServices(3);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('featuredServices.title')}</h2>
          <p className={styles.subtitle}>
            {t('featuredServices.subtitle')}
          </p>
        </div>

        {isLoading && <Loading message={t('featuredServices.loading')} />}

        {error && (
          <p className={styles.error}>
            {t('featuredServices.error')}
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
            {t('featuredServices.empty')}
          </p>
        )}

        <div className={styles.cta}>
          <Link to="/servicios" className={styles.link}>
            {t('featuredServices.viewAll')}
          </Link>
        </div>
      </div>
    </section>
  );
}
