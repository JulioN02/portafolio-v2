import { useParams, Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import { useContactForms } from '../../hooks/useContactForms';

/**
 * Contact Message Detail Page
 * Displays a single contact message in full detail (read-only)
 */
export function ContactMessageDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { useGetById } = useContactForms();
  const { data, isLoading, error } = useGetById(id || '');

  if (!id) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: '#ef4444' }}>Invalid message ID</p>
        <Link to="/contact-messages">
          <span style={{ color: '#3b82f6', textDecoration: 'underline', cursor: 'pointer' }}>{t('contactMessages.back')}</span>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: '#6b7280' }}>{t('common.loading')}</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>
        <p>{t('common.error')}</p>
        <Link to="/contact-messages">
          <span style={{ color: '#3b82f6', textDecoration: 'underline', cursor: 'pointer' }}>{t('contactMessages.back')}</span>
        </Link>
      </div>
    );
  }

  const message = data;
  const readAt = (message as unknown as { readAt?: string }).readAt;
  const isRead = !!readAt;

  const formatDate = (date: Date | string) => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      {/* Back Button */}
      <Link
        to="/contact-messages"
        style={{
          display: 'inline-block',
          color: '#3b82f6',
          textDecoration: 'none',
          marginBottom: '1rem',
          fontSize: '0.875rem',
        }}
      >
        ← {t('contactMessages.back')}
      </Link>

      {/* Header */}
      <div
        style={{
          background: '#fff',
          borderRadius: '8px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            {/* Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <h1
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  margin: 0,
                }}
              >
                {message.lastName ? `${message.firstName} ${message.lastName}` : message.firstName}
              </h1>
              {!isRead && (
                <span
                  style={{
                    background: '#3b82f6',
                    color: '#fff',
                    fontSize: '0.625rem',
                    fontWeight: '600',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '9999px',
                    textTransform: 'uppercase',
                  }}
                >
                  New
                </span>
              )}
            </div>

            {/* Email */}
            <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
              {message.email}
            </div>

            {/* WhatsApp */}
            {message.whatsapp && (
              <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                WhatsApp: {message.whatsapp}
              </div>
            )}

            {/* Date */}
            <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.5rem' }}>
              {t('contactMessages.date')}: {formatDate(message.createdAt)}
            </div>
          </div>

          {/* Actions - Read-only view */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
          </div>
        </div>
      </div>

      {/* Message Details */}
      <div
        style={{
          background: '#fff',
          borderRadius: '8px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        {/* Source / Subject */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
            Source
          </div>
          <div style={{ fontSize: '1rem', color: '#111827', fontWeight: '500' }}>
            {message.source}
          </div>
        </div>

        {/* Origin Type */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
            Origin Type
          </div>
          <div style={{ fontSize: '1rem', color: '#111827' }}>
            <span
              style={{
                background: message.originType === 'CLIENT' ? '#dbeafe' : '#fce7f3',
                color: message.originType === 'CLIENT' ? '#1e40af' : '#9d174d',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
            >
              {message.originType}
            </span>
          </div>
        </div>

        {/* Message */}
        <div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
            Message
          </div>
          <div
            style={{
              background: '#f9fafb',
              padding: '1rem',
              borderRadius: '8px',
              color: '#374151',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
            }}
          >
            {message.message}
          </div>
        </div>
      </div>
    </div>
  );
}