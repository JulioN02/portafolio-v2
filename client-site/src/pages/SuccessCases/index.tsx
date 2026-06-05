import { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useSuccessCases } from '../../hooks/useSuccessCases';
import { SuccessCaseCard } from '../../components/successCases/SuccessCaseCard';
import { Pagination } from '../../components/common/Pagination';
import { Loading } from '../../components/common/Loading';
import { MetaTags } from '../../components/seo/MetaTags';
import { PageHeader } from '../../components/common/PageHeader';
import styles from './SuccessCases.module.css';

export function SuccessCasesPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [industry, setIndustry] = useState<string>('');

  const { data, isLoading, error } = useSuccessCases({
    filter: {
      page,
      limit: 9,
      ...(industry && { industry }),
    },
  });

  const handleIndustryChange = (value: string) => {
    setIndustry(value);
    setPage(1);
  };

  return (
    <div className={styles.page}>
      <MetaTags
        title={t('successCases.meta.title')}
        description={t('successCases.meta.description')}
      />
      <PageHeader
        title={t('successCases.pageHeader.title')}
        subtitle={t('successCases.pageHeader.subtitle')}
      />
      <div className={styles.container}>
        {/* Filters */}
        <div className={styles.filters}>
          <label htmlFor="industry" className={styles.filterLabel}>
            {t('successCases.filter.label')}
          </label>
          <select
            id="industry"
            value={industry}
            onChange={(e) => handleIndustryChange(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">{t('successCases.filter.allIndustries')}</option>
            <option value="Tecnología">{t('successCases.filter.technology')}</option>
            <option value="Finanzas">{t('successCases.filter.finance')}</option>
            <option value="Salud">{t('successCases.filter.health')}</option>
            <option value="Educación">{t('successCases.filter.education')}</option>
            <option value="Comercio">{t('successCases.filter.commerce')}</option>
          </select>
        </div>

        {/* Content */}
        {isLoading && <Loading message={t('successCases.loading')} />}

        {error && (
          <div className={styles.error}>
            <p>{t('successCases.error')}</p>
          </div>
        )}

        {data && data.data.length > 0 && (
          <>
            <div className={styles.grid}>
              {data.data.map((successCase) => (
                <SuccessCaseCard key={successCase.id} successCase={successCase} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
            />
          </>
        )}

        {data && data.data.length === 0 && (
          <div className={styles.empty}>
            <p>{t('successCases.empty')}</p>
          </div>
        )}
      </div>
    </div>
  );
}