import { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useServices } from '../../hooks/useServices';
import { ServiceCard } from '../../components/services/ServiceCard';
import { Loading } from '../../components/common/Loading';
import { PageHeader } from '../../components/common/PageHeader';
import { MetaTags } from '../../components/seo/MetaTags';
import { Select } from '@jsoft/shared';
import styles from './Services.module.css';

export function ServicesPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [classification, setClassification] = useState<string>('');

  const { data, isLoading, error } = useServices({
    filter: {
      page,
      limit: 9,
      ...(classification && { classification }),
    },
  });

  const handleClassificationChange = (value: string) => {
    setClassification(value);
    setPage(1);
  };

  return (
    <div className={styles.page}>
      <MetaTags
        title={t('services.meta.title')}
        description={t('services.meta.description')}
      />
      <PageHeader
        title={t('services.pageHeader.title')}
        subtitle={t('services.pageHeader.subtitle')}
        backgroundImage="/images/servicios.png"
      />
      <div className={styles.container}>

        {/* Filters */}
        <div className={styles.filters}>
          <Select
            id="classification"
            value={classification}
            onChange={(e) => handleClassificationChange(e.target.value)}
            label={t('services.filter.label')}
            options={[
              { value: '', label: t('services.filter.allCategories') },
              { value: 'Desarrollo', label: t('services.filter.development') },
              { value: 'Diseño', label: t('services.filter.design') },
              { value: 'Consultoría', label: t('services.filter.consulting') },
            ]}
          />
        </div>

        {/* Content */}
        {isLoading && <Loading message={t('services.loading')} />}

        {error && (
          <div className={styles.error}>
            <p>{t('services.error')}</p>
          </div>
        )}

        {data && data.data.length > 0 && (
          <>
            <div className={styles.grid}>
              {data.data.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <nav className={styles.pagination} aria-label={t('services.pagination.aria')}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!data.pagination.hasPrev}
                  className={styles.pageButton}
                >
                  {t('services.pagination.previous')}
                </button>

                <span className={styles.pageInfo}>
                  {t('services.pagination.info', { page: data.pagination.page, total: data.pagination.totalPages })}
                </span>

                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!data.pagination.hasNext}
                  className={styles.pageButton}
                >
                  {t('services.pagination.next')}
                </button>
              </nav>
            )}
          </>
        )}

        {data && data.data.length === 0 && (
          <div className={styles.empty}>
            <p>{t('services.empty')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
