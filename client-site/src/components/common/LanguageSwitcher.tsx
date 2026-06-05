import { useTranslation } from '../../i18n/LanguageContext';
import styles from './LanguageSwitcher.module.css';

export function LanguageSwitcher() {
  const { lang, toggleLang, t } = useTranslation();

  return (
    <button
      className={styles.switcher}
      onClick={toggleLang}
      aria-label={t('nav.toggleLang')}
      title={lang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
    >
      <span className={styles.label}>{lang === 'es' ? 'EN' : 'ES'}</span>
    </button>
  );
}
