import styles from './Footer.module.css';

const socialLinks = [
  {
    href: 'https://wa.me/573001234567',
    label: 'WhatsApp',
    viewBox: '0 0 24 24',
    path: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-1.096-1.048-1.838-2.305-2.052-2.693-.214-.388-.023-.598.161-.793.166-.175.371-.454.557-.681.186-.227.247-.388.371-.648.124-.26.062-.488-.031-.683-.093-.195-.671-1.618-.919-2.215-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.199 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z',
  },
  {
    href: 'https://linkedin.com/in/jsoftsolutions',
    label: 'LinkedIn',
    viewBox: '0 0 24 24',
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
  {
    href: 'https://github.com/jsoftsolutions',
    label: 'GitHub',
    viewBox: '0 0 24 24',
    path: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  },
  {
    href: 'mailto:info@jsoftsolutions.com',
    label: 'Email',
    viewBox: '0 0 24 24',
    path: 'M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z',
    path2: 'M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z',
  },
];

const logoIcon = (
  <img src="/uploads/LogoJSS.png" alt="J Soft Solutions" width="36" height="36" style={{ borderRadius: 'var(--radius-sm)' }} />
);

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <div className={styles.brandLogo}>
              {logoIcon}
              <h3 className={styles.title}>J Soft Solutions</h3>
            </div>
            <p className={styles.description}>
              Desarrollo de software a medida. Transformamos tus ideas en soluciones
              digitales escalables y de alto impacto.
            </p>
          </div>

          <div>
            <h4 className={styles.colTitle}>Enlaces</h4>
            <ul className={styles.links}>
              <li><a href="/proyectos">Proyectos</a></li>
              <li><a href="/blog">Blog</a></li>
              <li><a href="/contacto">Contacto</a></li>
            </ul>
          </div>

          <div>
            <h4 className={styles.colTitle}>Redes</h4>
            <div className={styles.socialLinks}>
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                  rel={link.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                  className={styles.socialLink}
                  aria-label={link.label}
                >
                  <svg viewBox={link.viewBox} xmlns="http://www.w3.org/2000/svg">
                    {link.path2 ? (
                      <>
                        <path d={link.path} />
                        <path d={link.path2} />
                      </>
                    ) : (
                      <path d={link.path} />
                    )}
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <hr className={styles.divider} />

      <div className={styles.container}>
        <div className={styles.bottom}>
          <div className={styles.bottomLeft}>
            <p className={styles.copyright}>&copy; {currentYear} J Soft Solutions. Todos los derechos reservados.</p>
            <p className={styles.madeIn}>Hecho con ❤️ en Colombia</p>
          </div>
          <div className={styles.legalLinks}>
            <a href="/privacidad">Privacidad</a>
            <a href="/terminos">Términos</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
