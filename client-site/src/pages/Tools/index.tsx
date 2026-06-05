import { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useTools, useClassifications } from '../../hooks/useTools';
import { ToolCard } from '../../components/tools/ToolCard';
import { Pagination } from '../../components/common/Pagination';
import { Loading } from '../../components/common/Loading';
import { MetaTags } from '../../components/seo/MetaTags';
import { Select } from '@jsoft/shared';
import { PageHeader } from '../../components/common/PageHeader';
import styles from './Tools.module.css';

export function ToolsPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [classification, setClassification] = useState<string>('');

  const { data, isLoading, error } = useTools({
    filter: {
      page,
      limit: 9,
      ...(classification && { classification }),
    },
  });

  const { data: classifications } = useClassifications();

  const handleClassificationChange = (value: string) => {
    setClassification(value);
    setPage(1);
  };

  return (
    <div className={styles.page}>
      <MetaTags
        title={t('tools.meta.title')}
        description={t('tools.meta.description')}
      />
      <PageHeader
        title={t('tools.pageHeader.title')}
        subtitle={t('tools.pageHeader.subtitle')}
      />
      <div className={styles.container}>
        {/* Filters */}
        <div className={styles.filters}>
          <Select
            id="classification"
            value={classification}
            onChange={(e) => handleClassificationChange(e.target.value)}
            label={t('tools.filter.label')}
            options={[
              { value: '', label: t('tools.filter.allCategories') },
              ...(classifications?.map((cat) => ({ value: cat, label: cat })) ?? []),
            ]}
          />
        </div>

        {/* Content */}
        {isLoading && <Loading message={t('tools.loading')} />}

        {error && (
          <div className={styles.error}>
            <p>{t('tools.error')}</p>
          </div>
        )}

        {data && data.data.length > 0 && (
          <>
            <div className={styles.grid}>
              {data.data.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
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
            <p>{t('tools.empty')}</p>
          </div>
        )}
      </div>
    </div>
  );
}