import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { sanitizeHtml } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import { useProjects, useProjectTags } from '../../hooks/useProjects';
import { Loading } from '../../components/common/Loading';
import { PageHeader } from '../../components/common/PageHeader';
import { MetaTags } from '../../components/seo/MetaTags';
import styles from './Projects.module.css';

const FALLBACK_IMG = 'https://placehold.co/600x400/e5e7eb/9ca3af?text=Sin+imagen';

export function ProjectsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const tag = searchParams.get('tag') || undefined;
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useProjects({
    filter: {
      page,
      limit: 9,
      ...(tag && { tag }),
    },
  });
  const { data: tags = [] } = useProjectTags();

  const handleTagChange = (value: string) => {
    setPage(1);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set('tag', value);
      } else {
        next.delete('tag');
      }
      return next;
    }, { replace: true });
  };

  return (
    <div className={styles.page}>
      <MetaTags
        title={t('projects.meta.title')}
        description={t('projects.meta.description')}
      />
      <PageHeader
        title={t('projects.pageHeader.title')}
        subtitle={t('projects.pageHeader.subtitle')}
        backgroundImage="/images/proyectos.png"
      />
      <div className={styles.container}>

        {/* Tag filter chips */}
        {tags.length > 0 && (
          <div className={styles.tagFilters} role="group" aria-label={t('projects.filter.ariaLabel')}>
            <button
              className={`${styles.tagChip} ${!tag ? styles.tagChipActive : ''}`}
              onClick={() => handleTagChange('')}
            >
              {t('projects.filter.allTags')}
            </button>
            {tags.map((t) => (
              <button
                key={t}
                className={`${styles.tagChip} ${tag === t ? styles.tagChipActive : ''}`}
                onClick={() => handleTagChange(t)}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {isLoading && <Loading message={t('projects.loading')} />}

        {error && (
          <div className={styles.error}>
            <p>{t('projects.error')}</p>
          </div>
        )}

        {data && data.data.length > 0 && (
          <>
            <div className={styles.grid}>
              {data.data.map((project) => {
                const imageUrl = project.images && project.images.length > 0 ? project.images[0] : FALLBACK_IMG;
                return (
                  <article key={project.id} className={styles.card}>
                    <Link to={`/proyectos/${project.slug}`} className={styles.cardLink}>
                      <div className={styles.imageWrapper}>
                        <img
                          src={imageUrl}
                          alt={project.title}
                          className={styles.image}
                          loading="lazy"
                        />
                      </div>
                      <div className={styles.content}>
                        {project.tags && project.tags.length > 0 && (
                          <span className={styles.tag}>{project.tags[0]}</span>
                        )}
                        <h3 className={styles.title}>{project.title}</h3>
                        <p
                          className={styles.description}
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(project.shortDescription) }}
                        />
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <nav className={styles.pagination} aria-label={t('projects.pagination.aria')}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!data.pagination.hasPrev}
                  className={styles.pageButton}
                >
                  {t('projects.pagination.previous')}
                </button>

                <span className={styles.pageInfo}>
                  {t('projects.pagination.info', { page: data.pagination.page, total: data.pagination.totalPages })}
                </span>

                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!data.pagination.hasNext}
                  className={styles.pageButton}
                >
                  {t('projects.pagination.next')}
                </button>
              </nav>
            )}
          </>
        )}

        {data && data.data.length === 0 && (
          <div className={styles.empty}>
            <p>{t('projects.empty')}</p>
            {tag && (
              <button
                className={styles.emptyClear}
                onClick={() => handleTagChange('')}
              >
                {t('projects.filter.clear')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}