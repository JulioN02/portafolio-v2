import { useState } from 'react';
import { Button } from '@jsoft/shared';
import type { ContactFormResponse } from '@jsoft/shared';
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
  const { useGetAll, useMarkAsRead, useDelete } = useContactForms();
  const { data, isLoading, error } = useGetAll();
  const markAsReadMutation = useMarkAsRead();
  const deleteMutation = useDelete();

  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<MessageFilter>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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

  const handleMarkRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      deleteMutation.mutate(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: '#6b7280' }}>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>
        Error loading contact messages
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '0.5rem',
          }}
        >
          Contact Messages
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          View and manage messages received from your portfolio contact forms
        </p>
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
            Total Messages
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
            Unread Messages
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
            {unreadCount}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '0.5rem',
        }}
      >
        {(['all', 'unread', 'read'] as MessageFilter[]).map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            style={{
              padding: '0.5rem 1rem',
              background: filter === filterOption ? '#3b82f6' : 'transparent',
              color: filter === filterOption ? '#fff' : '#6b7280',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              textTransform: 'capitalize',
              transition: 'all 0.2s ease',
            }}
          >
            {filterOption}
          </button>
        ))}
      </div>

      {/* Messages List */}
      <ContactMessageList
        messages={filteredMessages}
        onMarkRead={handleMarkRead}
        onDelete={handleDelete}
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
            Previous
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
            Next
          </Button>
        </div>
      )}
    </div>
  );
}