import { useTranslation } from '../../i18n/LanguageContext';

/**
 * Contact message interface matching user specification
 */
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

interface ContactMessageListProps {
  messages: ContactMessage[];
}

/**
 * Contact Message List Component
 * Displays received contact messages with read/unread visual states
 * Read-only: no edit/delete actions (per spec)
 */
export function ContactMessageList({ messages }: ContactMessageListProps) {
  const { t } = useTranslation();
  if (messages.length === 0) {
    return (
      <div className="admin-empty">
        <div className="admin-empty-icon">✉️</div>
        <div className="admin-empty-text">{t('contactMessages.empty')}</div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="admin-card" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              background: message.isRead ? '#fff' : '#eff6ff',
              border: message.isRead ? '1px solid #e5e7eb' : '1px solid #bfdbfe',
              borderRadius: '8px',
              padding: '1rem',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                {/* Header: Name + Unread Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span
                    style={{
                      fontWeight: message.isRead ? '500' : '700',
                      fontSize: '1rem',
                      color: '#111827',
                    }}
                  >
                    {message.name}
                  </span>
                  {!message.isRead && (
                    <span
                      style={{
                        background: '#3b82f6',
                        color: '#fff',
                        fontSize: '0.625rem',
                        fontWeight: '600',
                        padding: '0.125rem 0.375rem',
                        borderRadius: '9999px',
                        textTransform: 'uppercase',
                      }}
                    >
                      New
                    </span>
                  )}
                </div>
                {/* Email */}
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  {message.email}
                </div>
              </div>
              {/* Date */}
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                {formatDate(message.createdAt)}
              </div>
            </div>

            {/* Subject */}
            <div
              style={{
                fontWeight: message.isRead ? '400' : '600',
                fontSize: '0.875rem',
                color: '#374151',
                marginBottom: '0.5rem',
              }}
            >
              {message.subject}
            </div>

            {/* Message */}
            <div
              style={{
                fontSize: '0.875rem',
                color: '#4b5563',
                lineHeight: '1.5',
                marginBottom: '1rem',
                background: '#f9fafb',
                padding: '0.75rem',
                borderRadius: '6px',
              }}
            >
              {message.message}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <a
                href={`/contact-messages/${message.id}`}
                style={{
                  padding: '0.375rem 0.75rem',
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                }}
              >
                View Details
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
