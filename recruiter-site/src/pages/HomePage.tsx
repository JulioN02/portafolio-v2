import { Link } from 'react-router-dom';
import { MetaTags } from '../components/seo/MetaTags';
import { Hero } from '../components/home/Hero';
import { ProfileToggle } from '../components/home/ProfileToggle';
import { TechStack } from '../components/home/TechStack';
import { RecentProjects } from '../components/home/RecentProjects';
import { useTranslation } from '../i18n/LanguageContext';
import styles from './HomePage.module.css';

export function HomePage() {
  const { t } = useTranslation();

  return (
    <div className={styles.page}>
      <MetaTags
        title={t('home.meta.title')}
        description={t('home.meta.description')}
      />
      {/* Hero Section */}
      <Hero avatarUrl="/images/sobremi.png" />

      {/* Profile Toggle Section */}
      <ProfileToggle />

      {/* Tech Stack Section */}
      <TechStack />

      {/* Recent Projects Section */}
      <RecentProjects />

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
          <h2 className={styles.ctaTitle}>{t('home.cta.title')}</h2>
          <p className={styles.ctaText}>{t('home.cta.text')}</p>
          <Link to="/contacto" className={styles.ctaButton}>
            {t('home.cta.button')}
          </Link>
        </div>
      </section>
    </div>
  );
}
