import { Link } from 'react-router-dom';
import { MetaTags } from '../components/seo/MetaTags';
import { RecruiterContactForm } from '../components/contact/RecruiterContactForm';

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

export function ContactPage() {
  return (
    <main
      style={{
        minHeight: '60vh',
        padding: 'var(--spacing-2xl) var(--spacing-md)',
      }}
    >
      <MetaTags
        title="Contacto | Julio Nieto"
        description="¿Listo para trabajar juntos? Contáctame para nuevas oportunidades laborales o proyectos."
      />
      <div
        style={{
          maxWidth: '720px',
          margin: '0 auto',
        }}
      >
        {/* ── Back Link ── */}
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-primary-600)',
              textDecoration: 'none',
            }}
          >
            ← Volver al inicio
          </Link>
        </div>

        {/* ── Header ── */}
        <h1
          style={{
            fontSize: 'var(--font-size-3xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-neutral-900)',
            marginBottom: 'var(--spacing-sm)',
          }}
        >
          Contacto
        </h1>

        <p
          style={{
            fontSize: 'var(--font-size-base)',
            color: 'var(--color-neutral-600)',
            lineHeight: 'var(--line-height-relaxed)',
            marginBottom: 'var(--spacing-xl)',
            maxWidth: '560px',
          }}
        >
          ¿Interesado en mis servicios? Complete el formulario y me pondré en
          contacto a la brevedad.
        </p>

        {/* ── Form ── */}
        <RecruiterContactForm />

        {/* ── Divider ── */}
        <hr
          style={{
            border: 'none',
            borderTop: '1px solid var(--color-neutral-200)',
            margin: 'var(--spacing-2xl) 0',
          }}
        />

        {/* ── Social Links ── */}
        <div style={{ textAlign: 'center' }}>
          <h2
            style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-neutral-800)',
              marginBottom: 'var(--spacing-md)',
            }}
          >
            También puedes contactarme por
          </h2>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'var(--spacing-lg)',
              flexWrap: 'wrap',
            }}
          >
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={
                  link.href.startsWith('mailto:') ? undefined : '_blank'
                }
                rel={
                  link.href.startsWith('mailto:')
                    ? undefined
                    : 'noopener noreferrer'
                }
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-xs)',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-primary-600)',
                  backgroundColor: 'var(--color-primary-50)',
                  borderRadius: 'var(--radius-full)',
                  textDecoration: 'none',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    'var(--color-primary-100)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    'var(--color-primary-50)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span style={{ fontSize: 'var(--font-size-base)' }}>
                  {link.icon}
                </span>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
