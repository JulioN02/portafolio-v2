import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from '@/i18n/LanguageContext';
import { useContactForms } from '@/hooks/useContactForms';

/** Formats source string for display, e.g. "service:Desarrollo Web" → "Servicio: Desarrollo Web" */
const formatSourceLabel = (source: string): string => {
  const [type, ...rest] = source.split(':');
  const title = rest.join(':');
  const typeLabels: Record<string, string> = {
    service: 'Servicio',
    product: 'Producto',
    tool: 'Herramienta',
    successCase: 'Caso de Éxito',
    recruiter: 'Reclutador',
    general: 'General',
  };
  const label = typeLabels[type] || type;
  return title ? `${label}: ${title}` : label;
};

const formatDate = (date: Date | string) => {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('es', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Contact Message Detail Page (standalone route)
 * Used for direct/bookmarkable access and mobile navigation
 */
export function ContactMessageDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { useGetById, useMarkRead, useToggleArchive, useSetLabels } = useContactForms();
  const { data, isLoading, error } = useGetById(id || '');
  const markRead = useMarkRead();
  const toggleArchive = useToggleArchive();
  const setLabels = useSetLabels();

  const [newLabel, setNewLabel] = useState('');

  // Auto mark as read when detail opens
  useEffect(() => {
    if (data && !data.readAt && id) {
      markRead.mutate(id);
    }
  }, [data?.id]);

  const handleAddLabel = () => {
    if (!newLabel.trim() || !data) return;
    const updatedLabels = [...(data.labels ?? []), newLabel.trim()];
    setLabels.mutate({ id: data.id, labels: updatedLabels });
    setNewLabel('');
  };

  const handleRemoveLabel = (label: string) => {
    if (!data) return;
    const updatedLabels = (data.labels ?? []).filter((l) => l !== label);
    setLabels.mutate({ id: data.id, labels: updatedLabels });
  };

  const handleToggleArchive = () => {
    if (data) {
      toggleArchive.mutate(data.id);
    }
  };

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ height: '24px', background: '#e5e7eb', borderRadius: '4px', width: '40%' }} />
          <div style={{ height: '16px', background: '#e5e7eb', borderRadius: '4px', width: '60%' }} />
          <div style={{ height: '200px', background: '#e5e7eb', borderRadius: '8px', marginTop: '1rem' }} />
        </div>
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
  const isRead = !!message.readAt;

  return (
    <div>
      {/* Back Button */}
      <Link
        to="/contact-messages"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          color: '#3b82f6',
          textDecoration: 'none',
          marginBottom: '1rem',
          fontSize: '0.875rem',
        }}
      >
        ← {t('contactMessages.back')}
      </Link>

      {/* Header Card */}
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
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                {message.lastName ? `${message.firstName} ${message.lastName}` : message.firstName}
              </h1>
              {!isRead && (
                <span style={{
                  background: '#3b82f6', color: '#fff', fontSize: '0.625rem',
                  fontWeight: 600, padding: '0.125rem 0.5rem', borderRadius: '9999px',
                }}>
                  New
                </span>
              )}
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{message.email}</div>
            {message.whatsapp && (
              <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                WhatsApp: {message.whatsapp}
              </div>
            )}
            <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.5rem' }}>
              {formatDate(message.createdAt)}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            <button
              onClick={handleToggleArchive}
              disabled={toggleArchive.isPending}
              style={{
                padding: '0.375rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                background: '#fff',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                color: '#374151',
              }}
            >
              {message.archived ? t('contactMessages.unarchive') : t('contactMessages.archive')}
            </button>
          </div>
        </div>
      </div>

      {/* Details Card */}
      <div
        style={{
          background: '#fff',
          borderRadius: '8px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '1rem',
        }}
      >
        {/* Source */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 600 }}>
            Source
          </div>
          <div
            style={{
              fontSize: '0.8125rem',
              color: '#1e40af',
              background: '#dbeafe',
              padding: '0.25rem 0.75rem',
              borderRadius: '6px',
              display: 'inline-block',
              fontWeight: 500,
            }}
          >
            {message.source && message.source !== 'general'
              ? formatSourceLabel(message.source)
              : 'General'}
          </div>
        </div>

        {/* Origin Type */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 600 }}>
            Origin Type
          </div>
          <span
            style={{
              display: 'inline-block',
              background: message.originType === 'CLIENT' ? '#dbeafe' : '#fce7f3',
              color: message.originType === 'CLIENT' ? '#1e40af' : '#9d174d',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.8125rem',
              fontWeight: 500,
            }}
          >
            {message.originType}
          </span>
        </div>

        {/* Message */}
        <div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 600 }}>
            {t('contactMessages.subject')}
          </div>
          <div
            style={{
              background: '#f9fafb',
              padding: '1rem',
              borderRadius: '8px',
              color: '#374151',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              fontSize: '0.9375rem',
            }}
          >
            {message.message}
          </div>
        </div>
      </div>

      {/* Labels Card */}
      <div
        style={{
          background: '#fff',
          borderRadius: '8px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>
          {t('contactMessages.labels')}
        </div>

        {/* Existing labels */}
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {(message.labels ?? []).length === 0 ? (
            <span style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>—</span>
          ) : (
            (message.labels ?? []).map((label) => (
              <span
                key={label}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.1875rem 0.5rem',
                  borderRadius: '9999px',
                  background: '#dbeafe',
                  color: '#1e40af',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              >
                {label}
                <button
                  onClick={() => handleRemoveLabel(label)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: '0.875rem',
                    lineHeight: 1,
                    color: '#1e40af',
                    opacity: 0.6,
                  }}
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>

        {/* Add label input */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddLabel(); }}
            placeholder={t('contactMessages.addLabel')}
            style={{
              flex: 1,
              padding: '0.375rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              outline: 'none',
            }}
          />
          <button
            onClick={handleAddLabel}
            disabled={!newLabel.trim() || setLabels.isPending}
            style={{
              padding: '0.375rem 0.75rem',
              border: '1px solid #3b82f6',
              borderRadius: '6px',
              background: '#3b82f6',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.8125rem',
            }}
          >
            {t('common.add') || '+'}
          </button>
        </div>
      </div>
    </div>
  );
}