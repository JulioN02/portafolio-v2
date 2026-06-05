import { Outlet, NavLink } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import styles from './SettingsLayout.module.css';

export function SettingsLayout() {
  const { t } = useTranslation();

  const sidebarLinks = [
    { to: '/settings/profile', label: t('settings.profile'), end: true },
    { to: '/settings/preferences', label: t('settings.preferences') },
    { to: '/settings/security', label: t('settings.security') },
  ];

  return (
    <div>
      <h1 className={styles.pageTitle}>
        {t('settings.title')}
      </h1>

      <div className={styles.layout}>
        {/* Sidebar */}
        <div className={styles.sidebarCard}>
          <nav className={styles.nav}>
            {sidebarLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  isActive
                    ? `${styles.navLink} ${styles.navLinkActive}`
                    : styles.navLink
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className={styles.contentCard}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}