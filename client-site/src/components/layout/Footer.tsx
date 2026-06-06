import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import styles from './Footer.module.css';

const socialLinks = [
  {
    href: 'https://wa.me/573001234567',
    label: 'WhatsApp',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-1.096-1.08-1.837-2.313-2.052-2.705-.215-.392-.023-.603.163-.795.166-.172.366-.447.549-.67.184-.223.245-.373.367-.622.123-.249.062-.467-.03-.65-.092-.183-.67-1.616-.92-2.214-.242-.579-.487-.48-.67-.49-.173-.008-.373-.01-.573-.01-.2 0-.523.074-.797.374-.273.3-1.045 1.02-1.045 2.487 0 1.467 1.067 2.884 1.217 3.082.15.198 2.1 3.207 5.09 4.497.711.306 1.266.489 1.699.625.718.225 1.37.193 1.886.117.574-.085 1.758-.718 2.006-1.412.249-.694.249-1.288.174-1.412-.074-.124-.273-.198-.57-.347z" />
        <path d="M12 2C6.48 2 2 6.48 2 12c0 1.88.54 3.64 1.48 5.14L2 22l4.86-1.48C8.35 21.46 10.12 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.6 0-3.08-.48-4.33-1.3l-.31-.19-2.88.89.88-2.88-.2-.32A7.92 7.92 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z" />
      </svg>
    ),
  },
  {
    href: 'https://linkedin.com/in/julion',
    label: 'LinkedIn',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
      </svg>
    ),
  },
  {
    href: 'https://github.com/julion',
    label: 'GitHub',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    href: 'mailto:info@jsoftsolutions.com',
    label: 'Email',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
      </svg>
    ),
  },
];

const LEGAL_LINKS = [
  { to: '/privacidad', key: 'footer.privacy' },
  { to: '/terminos', key: 'footer.terms' },
];

const logoIcon = (
  <img src="/images/LogoJSS.png" alt="J Soft Solutions" width="36" height="36" style={{ borderRadius: 'var(--radius-sm)' }} />
);

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Brand */}
          <div className={styles.brand}>
            <div className={styles.brandLogo}>
              {logoIcon}
              <h3 className={styles.brandName}>J Soft Solutions</h3>
            </div>
            <p className={styles.brandTagline}>
              {t('footer.tagline')}
            </p>
            {/* Social Links */}
            <div className={styles.socialLinks}>
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className={styles.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                >
                  <span className={styles.socialIcon}>
                    {social.icon}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.links}>
            <h4 className={styles.linksTitle}>{t('footer.links')}</h4>
            <nav className={styles.linksNav}>
              <Link to="/">{t('nav.home')}</Link>
              <Link to="/servicios">{t('nav.services')}</Link>
              <Link to="/contacto">{t('nav.contact')}</Link>
            </nav>
          </div>

          {/* Contact */}
          <div className={styles.contact}>
            <h4 className={styles.contactTitle}>{t('footer.contact')}</h4>
            <address className={styles.contactInfo}>
              <a href="mailto:info@jsoftsolutions.com">info@jsoftsolutions.com</a>
              <a href="https://wa.me/573001234567">WhatsApp</a>
            </address>
          </div>
        </div>

        <hr className={styles.divider} />

        <div className={styles.bottom}>
          <div className={styles.bottomLeft}>
            <p className={styles.copyright}>
              {t('footer.copyright', { year: currentYear })}
            </p>
            <p className={styles.madeIn}>{t('footer.madeIn')}</p>
          </div>
          <nav className={styles.legalLinks}>
            {LEGAL_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className={styles.legalLink}>
                {t(link.key)}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
