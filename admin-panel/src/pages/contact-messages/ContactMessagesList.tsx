import { useState } from 'react';
import { Button, Loading, ErrorMessage } from '@jsoft/shared';
import type { ContactFormResponse } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import { useContactForms } from '../../hooks/useContactForms';
import { ContactMessageList, type ContactMessage } from '../../components/contact-messages/ContactMessageList';

/**
 * Filter type for contact messages
 */
type MessageFilter = 'all' | 'unread' | 'read';

/**
 * Contact Messages List Page
 * Main page for viewing and managing received contact messages
 */
export function ContactMessagesListPage() {
  const { t } = useTranslation();
  const { useGetAll } = useContactForms();
  const { data, isLoading, error } = useGetAll();

  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<MessageFilter>('all');

  // Calculate stats from data
  const totalMessages = data?.pagination?.total || 0;
  const messagesList = data?.data || [];

  // Map API response to ContactMessage format
  // Use readAt field to determine if message is read
  const mapToContactMessage = (form: ContactFormResponse): ContactMessage => {
    const readAt = (form as unknown as { readAt?: string }).readAt;
    return {
      id: form.id,
      name: form.lastName ? `${form.firstName} ${form.lastName}` : form.firstName,
      email: form.email,
      subject: form.source, // Use source as subject
      message: form.message,
      createdAt: form.createdAt instanceof Date ? form.createdAt.toISOString() : String(form.createdAt),
      isRead: !!readAt,
    };
  };

  // Apply filter to messages
  const filteredMessages = messagesList
    .map(mapToContactMessage)
    .filter((msg) => {
      if (filter === 'unread') return !msg.isRead;
      if (filter === 'read') return msg.isRead;
      return true;
    });

  const unreadCount = messagesList.filter((form) => {
    const readAt = (form as unknown as { readAt?: string }).readAt;
    return !readAt;
  }).length;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage message={t('common.error')} />;
  }

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1>{t('contactMessages.title')}</h1>
          <p style={{ color: 'var(--color-neutral-500)', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
            {t('contactMessages.title')}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            background: '#fff',
            borderRadius: '8px',
            padding: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
            {t('contactMessages.title')}
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
            {totalMessages}
          </div>
        </div>
        <div
          style={{
            background: '#fff',
            borderRadius: '8px',
            padding: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
            Unread
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
            {unreadCount}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="admin-filter-bar" style={{ borderBottom: '1px solid var(--color-neutral-200)', paddingBottom: '0.5rem' }}>
        {(['all', 'unread', 'read'] as MessageFilter[]).map((filterOption) => (
          <Button
            key={filterOption}
            variant={filter === filterOption ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter(filterOption)}
          >
            {filterOption}
          </Button>
        ))}
      </div>

      {/* Messages List */}
      <ContactMessageList
        messages={filteredMessages}
      />

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            marginTop: '1.5rem',
          }}
        >
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!data.pagination.hasPrev}
          >
            {t('common.previous')}
          </Button>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0 1rem',
              color: '#6b7280',
            }}
          >
            Page {currentPage} of {data.pagination.totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!data.pagination.hasNext}
          >
            {t('common.next')}
          </Button>
        </div>
      )}
    </div>
  );
}
