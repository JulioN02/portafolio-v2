import { useTranslation } from '../../i18n/LanguageContext';
import { useFeaturedSuccessCases, useRecentSuccessCases } from '../../hooks/useSuccessCases';
import { Loading } from '../common/Loading';
import styles from './SuccessCaseCarousel.module.css';

export function SuccessCaseCarousel() {
  const { t } = useTranslation();
  const featured = useFeaturedSuccessCases(3);
  const recent = useRecentSuccessCases(3);

  const cases = featured.data && featured.data.length > 0 ? featured.data : recent.data;
  const isLoading = featured.isLoading || (recent.isLoading && !featured.data?.length);
  const isError = featured.isError && recent.isError;

  if (isLoading) return <Loading message={t('successCaseCarousel.loading')} />;
  if (isError) return <p className={styles.error}>{t('successCaseCarousel.error')}</p>;
  if (!cases?.length) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('successCaseCarousel.title')}</h2>
          <p className={styles.subtitle}>
            {t('successCaseCarousel.subtitle')}
          </p>
        </div>

        <div className={styles.grid}>
          {cases.map((successCase) => (
            <div key={successCase.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                {successCase.images[0] && (
                  <img 
                    src={successCase.images[0]} 
                    alt={successCase.title}
                    className={styles.image}
                    loading="lazy"
                  />
                )}
              </div>
              <div className={styles.content}>
                <h3 className={styles.cardTitle}>{successCase.title}</h3>
                <p className={styles.description}>
                  {successCase.description.length > 120 
                    ? `${successCase.description.substring(0, 120)}...` 
                    : successCase.description}
                </p>
                <div className={styles.links}>
                  {successCase.links?.map((link) => (
                    <a 
                      key={link} 
                      href={link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.link}
                    >
                      {t('successCaseCarousel.viewProject')}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
