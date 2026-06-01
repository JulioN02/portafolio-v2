import { useTranslation } from '@/i18n/LanguageContext';

/**
 * Contact message interface for the list display
 */
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  archived: boolean;
  labels: string[];
  source: string;
}

interface ContactMessageListProps {
  messages: ContactMessage[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onArchive?: (id: string) => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  }
  if (days === 1) return 'Ayer';
  if (days < 7) {
    return date.toLocaleDateString('es', { weekday: 'short' });
  }
  return date.toLocaleDateString('es', {
    day: 'numeric',
    month: 'short',
  });
};

const truncate = (text: string, max = 100) => {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + '…';
};

/**
 * Contact Message List Component — Gmail-like list
 * Each item: sender name, email, date, message preview, read/unread indicator, archive button, label badges
 */
export function ContactMessageList({ messages, selectedId, onSelect, onArchive }: ContactMessageListProps) {
  const { t } = useTranslation();

  if (messages.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
        <p>{t('contactMessages.empty')}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {messages.map((message) => {
        const isSelected = message.id === selectedId;
        return (
          <div
            key={message.id}
            onClick={() => onSelect?.(message.id)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              padding: '0.75rem 1rem',
              cursor: 'pointer',
              borderBottom: '1px solid #e5e7eb',
              borderLeft: message.isRead ? '3px solid transparent' : '3px solid #3b82f6',
              background: isSelected ? '#eff6ff' : message.isRead ? '#fff' : '#f9fafb',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.background = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.background = message.isRead ? '#fff' : '#f9fafb';
            }}
          >
            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Header row: name + date */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.125rem' }}>
                <span
                  style={{
                    fontWeight: message.isRead ? '500' : '700',
                    fontSize: '0.875rem',
                    color: '#111827',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    marginRight: '0.5rem',
                  }}
                >
                  {message.name}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {formatDate(message.createdAt)}
                </span>
              </div>

              {/* Email */}
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {message.email}
              </div>

              {/* Source (if not general/recruiter) */}
              {message.source && message.source !== 'general' && message.source !== 'recruiter' && (
                <div
                  style={{
                    fontSize: '0.6875rem',
                    color: '#2563eb',
                    background: '#eff6ff',
                    padding: '0.0625rem 0.375rem',
                    borderRadius: '4px',
                    marginBottom: '0.125rem',
                    display: 'inline-block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '100%',
                  }}
                >
                  {message.source
                    .replace(/^(service|product|tool|successCase):/, '')}
                </div>
              )}

              {/* Message preview */}
              <div
                style={{
                  fontSize: '0.8125rem',
                  color: '#4b5563',
                  lineHeight: '1.4',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: (message.labels ?? []).length > 0 ? '0.25rem' : 0,
                }}
              >
                {truncate(message.message, 80)}
              </div>

              {/* Label badges */}
              {(message.labels ?? []).length > 0 && (
                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                  {message.labels.map((label) => (
                    <span
                      key={label}
                      style={{
                        fontSize: '0.625rem',
                        padding: '0.0625rem 0.375rem',
                        borderRadius: '9999px',
                        background: '#dbeafe',
                        color: '#1e40af',
                        fontWeight: 500,
                      }}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Archive button */}
            {onArchive && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive(message.id);
                }}
                title={message.archived ? t('contactMessages.unarchive') : t('contactMessages.archive')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  marginLeft: '0.5rem',
                  flexShrink: 0,
                  color: '#9ca3af',
                  fontSize: '1rem',
                  lineHeight: 1,
                  borderRadius: '4px',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#e5e7eb'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
              >
                {message.archived ? '📂' : '📁'}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
