import styles from './Footer.module.css';

const socialLinks = [
  {
    href: 'https://wa.me/573001234567',
    label: 'WhatsApp',
    icon: '📱',
  },
  {
    href: 'https://linkedin.com/in/jsoftsolutions',
    label: 'LinkedIn',
    icon: '💼',
  },
  {
    href: 'https://github.com/jsoftsolutions',
    label: 'GitHub',
    icon: '🐙',
  },
  {
    href: 'mailto:info@jsoftsolutions.com',
    label: 'Email',
    icon: '✉️',
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.social}>
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith('mailto:') ? undefined : '_blank'}
              rel={link.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
              aria-label={link.label}
            >
              <span className={styles.socialIcon}>{link.icon}</span>
              {link.label}
            </a>
          ))}
        </div>
        <div className={styles.bottom}>
          <p>&copy; {currentYear} J Soft Solutions. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
