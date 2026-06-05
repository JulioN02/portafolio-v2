import { useTranslation } from '@/i18n/LanguageContext';
import listStyles from '../../pages/contact-messages/Inbox.module.css';

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
  starred: boolean;
  labels: string[];
  source: string;
}

interface ContactMessageListProps {
  messages: ContactMessage[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onArchive?: (id: string) => void;
  onToggleStar?: (id: string) => void;
  onDelete?: (message: ContactMessage) => void;
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
export function ContactMessageList({ messages, selectedId, onSelect, onArchive, onToggleStar, onDelete }: ContactMessageListProps) {
  const { t } = useTranslation();

  if (messages.length === 0) {
    return (
      <div className={listStyles.emptyState}>
        <p>{t('contactMessages.empty')}</p>
      </div>
    );
  }

  return (
    <div className={listStyles.listContainer}>
      {messages.map((message) => {
        const isSelected = message.id === selectedId;
        return (
          <div
            key={message.id}
            onClick={() => onSelect?.(message.id)}
            className={`${listStyles.listItem} ${isSelected ? listStyles.listItemActive : ''} ${!message.isRead ? listStyles.listItemUnread : ''}`}
          >
            {/* Star button */}
            {onToggleStar && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStar(message.id);
                }}
                title={message.starred ? t('contactMessages.unstar') : t('contactMessages.star')}
                className={`${listStyles.listStarBtn} ${message.starred ? listStyles.listStarBtnStarred : ''}`}
              >
                {message.starred ? '★' : '☆'}
              </button>
            )}

            {/* Content */}
            <div className={listStyles.listContent}>
              {/* Header row: name + date */}
              <div className={listStyles.listHeader}>
                <span
                  className={`${listStyles.listName} ${!message.isRead ? listStyles.listNameUnread : ''}`}
                >
                  {message.name}
                </span>
                <span className={listStyles.listDate}>
                  {formatDate(message.createdAt)}
                </span>
              </div>

              {/* Email */}
              <div className={listStyles.listEmail}>
                {message.email}
              </div>

              {/* Source (if not general/recruiter) */}
              {message.source && message.source !== 'general' && message.source !== 'recruiter' && (
                <div className={listStyles.listSourceBadge}>
                  {message.source
                    .replace(/^(service|product|tool|successCase):/, '')}
                </div>
              )}

              {/* Message preview */}
              <div
                className={`${listStyles.listPreview} ${(message.labels ?? []).length > 0 ? listStyles.listPreviewWithLabels : ''}`}
              >
                {truncate(message.message, 80)}
              </div>

              {/* Label badges */}
              {(message.labels ?? []).length > 0 && (
                <div className={listStyles.listBadges}>
                  {message.labels.map((label) => (
                    <span key={label} className={listStyles.listBadge}>
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className={listStyles.listActions}>
              {/* Archive button */}
              {onArchive && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive(message.id);
                  }}
                  title={message.archived ? t('contactMessages.unarchive') : t('contactMessages.archive')}
                  className={listStyles.listActionBtn}
                >
                  {message.archived ? '📂' : '📁'}
                </button>
              )}

              {/* Delete button */}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(message);
                  }}
                  title={t('contactMessages.delete')}
                  className={`${listStyles.listActionBtn} ${listStyles.listActionBtnDanger}`}
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
