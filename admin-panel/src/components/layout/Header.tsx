import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../i18n/LanguageContext';
import styles from './Header.module.css';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export function Header({ onToggleSidebar, isSidebarOpen }: HeaderProps) {
  const { t } = useTranslation();
  const { getUser, logout } = useAuth();
  const user = getUser();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={styles.header}>
      <button
        className={styles.hamburger}
        onClick={onToggleSidebar}
        aria-label={isSidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={isSidebarOpen}
      >
        <span className={styles.hamburgerLine} />
        <span className={styles.hamburgerLine} />
        <span className={styles.hamburgerLine} />
      </button>
      <div className={styles.dropdownWrapper} ref={dropdownRef}>
        <button
          className={styles.userToggle}
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <img
            src="/uploads/LogoJSS.png"
            alt="J Soft Solutions"
            className={styles.logoAvatar}
          />
          <span className={styles.username}>
            {user?.username || 'Admin'}
          </span>
          <svg
            className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6,9 12,15 18,9" />
          </svg>
        </button>

        {isOpen && (
          <div className={styles.dropdown}>
            <div className={styles.dropdownHeader}>
              <img
                src="/uploads/LogoJSS.png"
                alt="J Soft Solutions"
                className={styles.dropdownLogo}
              />
              <div>
                <span className={styles.dropdownName}>
                  {user?.username || 'Admin'}
                </span>
                <span className={styles.dropdownRole}>Administrador</span>
              </div>
            </div>
            <div className={styles.dropdownDivider} />
            <button
              className={styles.logoutOption}
              onClick={logout}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16,17 21,12 16,7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              {t('nav.logout')}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
