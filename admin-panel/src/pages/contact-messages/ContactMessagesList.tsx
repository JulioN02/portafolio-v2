import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n/LanguageContext';
import { useContactForms } from '@/hooks/useContactForms';
import { ContactMessageList, type ContactMessage } from '@/components/contact-messages/ContactMessageList';
import { ConfirmDeleteModal } from '@/components/shared/ConfirmDeleteModal';
import type { ContactFormFilterInput, ContactFormResponse } from '@jsoft/shared';

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

/**
 * Filter type for contact messages
 */
type MessageFilter = 'all' | 'unread' | 'read' | 'archived' | 'starred';

const ITEMS_PER_PAGE = 20;

/**
 * Format a date for display in the detail panel
 */
const formatDetailDate = (date: Date | string) => {
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
 * Contact Messages List Page — Gmail-like split view
 *
 * Desktop: two-panel split (list ~40%, detail ~60%)
 * Mobile: stacked (list full width, tapping navigates to standalone detail route)
 */
export function ContactMessagesListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { useGetAll, useGetById, useMarkRead, useToggleArchive, useToggleStar, useDelete, useSetLabels } = useContactForms();
  const markRead = useMarkRead();
  const toggleArchive = useToggleArchive();
  const toggleStar = useToggleStar();
  const deleteMutation = useDelete();
  const setLabels = useSetLabels();

  // ── URL search params ──────────────────────────────────────────
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSearch = searchParams.get('search') || '';
  const currentFilter = (searchParams.get('filter') as MessageFilter) || 'all';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // ── Local state ─────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Responsive check
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Debounce search input → URL (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (searchInput) {
            next.set('search', searchInput);
          } else {
            next.delete('search');
          }
          next.set('page', '1');
          return next;
        },
        { replace: true },
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, setSearchParams]);

  // ── Stabilised API filters ─────────────────────────────────────
  const apiFilters = useMemo((): ContactFormFilterInput => {
    const filters: ContactFormFilterInput = {
      search: currentSearch || undefined,
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    };

    if (currentFilter === 'unread') {
      filters.isRead = false;
    } else if (currentFilter === 'read') {
      filters.isRead = true;
    }

    if (currentFilter === 'starred') {
      filters.isStarred = true;
      // Show all starred messages regardless of archive status
    } else if (currentFilter === 'archived') {
      filters.isArchived = true;
    } else {
      filters.isArchived = false;
    }

    return filters;
  }, [currentSearch, currentPage, currentFilter]);

  // ── Queries ─────────────────────────────────────────────────────
  const { data, isLoading, error, refetch } = useGetAll(apiFilters);
  const { data: selectedMessage, isLoading: isDetailLoading } = useGetById(selectedId || '');

  const messages = data?.data || [];
  const pagination = data?.pagination;

  // Map ContactFormResponse → ContactMessage
  const mapToContactMessage = useCallback(
    (form: ContactFormResponse): ContactMessage => ({
      id: form.id,
      name: form.lastName ? `${form.firstName} ${form.lastName}` : form.firstName,
      email: form.email,
      message: form.message,
      createdAt:
        form.createdAt instanceof Date
          ? form.createdAt.toISOString()
          : String(form.createdAt),
      isRead: !!form.readAt,
      archived: form.archived,
      starred: form.starred,
      labels: form.labels,
      source: form.source,
    }),
    [],
  );

  const contactMessages = useMemo(
    () => messages.map(mapToContactMessage),
    [messages, mapToContactMessage],
  );

  // Auto mark-as-read when detail opens
  useEffect(() => {
    if (selectedMessage && !selectedMessage.readAt && selectedId) {
      markRead.mutate(selectedId);
    }
    // Only run when the selected message actually changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMessage?.id]);

  // ── Handlers ────────────────────────────────────────────────────
  const handleSelect = useCallback(
    (id: string) => {
      if (isMobile) {
        navigate(`/contact-messages/${id}`);
        return;
      }
      setSelectedId((prev) => (prev === id ? null : id));
    },
    [isMobile, navigate],
  );

  const handleFilterChange = useCallback(
    (newFilter: MessageFilter) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (newFilter === 'all') {
            next.delete('filter');
          } else {
            next.set('filter', newFilter);
          }
          next.set('page', '1');
          return next;
        },
        { replace: true },
      );
      setSelectedId(null);
    },
    [setSearchParams],
  );

  const handleArchiveToggle = useCallback(
    (id: string) => {
      toggleArchive.mutate(id);
      setSelectedId((prev) => (prev === id ? null : prev));
    },
    [toggleArchive],
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('page', String(newPage));
          return next;
        },
        { replace: true },
      );
      setSelectedId(null);
    },
    [setSearchParams],
  );

  const handleAddLabel = useCallback(() => {
    if (!newLabel.trim() || !selectedMessage) return;
    const updatedLabels = [...(selectedMessage.labels ?? []), newLabel.trim()];
    setLabels.mutate({ id: selectedMessage.id, labels: updatedLabels });
    setNewLabel('');
  }, [newLabel, selectedMessage, setLabels]);

  const handleRemoveLabel = useCallback(
    (label: string) => {
      if (!selectedMessage) return;
      const updatedLabels = (selectedMessage.labels ?? []).filter((l) => l !== label);
      setLabels.mutate({ id: selectedMessage.id, labels: updatedLabels });
    },
    [selectedMessage, setLabels],
  );

  const handleArchiveFromDetail = useCallback(() => {
    if (selectedMessage) {
      toggleArchive.mutate(selectedMessage.id);
    }
  }, [selectedMessage, toggleArchive]);

  const handleToggleStar = useCallback(
    (id: string) => {
      toggleStar.mutate(id);
    },
    [toggleStar],
  );

  const handleStarFromDetail = useCallback(() => {
    if (selectedMessage) {
      toggleStar.mutate(selectedMessage.id);
    }
  }, [selectedMessage, toggleStar]);

  const handleDeleteRequest = useCallback((message: ContactMessage) => {
    setDeleteTarget(message);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        setSelectedId((prev) => (prev === deleteTarget.id ? null : prev));
      },
      onError: () => {
        // Keep modal open on error for retry
      },
    });
  }, [deleteTarget, deleteMutation]);

  const handleDeleteFromDetail = useCallback(() => {
    if (selectedMessage) {
      setDeleteTarget({
        id: selectedMessage.id,
        name: selectedMessage.lastName
          ? `${selectedMessage.firstName} ${selectedMessage.lastName}`
          : selectedMessage.firstName,
        email: selectedMessage.email,
        message: selectedMessage.message,
        createdAt: selectedMessage.createdAt instanceof Date
          ? selectedMessage.createdAt.toISOString()
          : String(selectedMessage.createdAt),
        isRead: !!selectedMessage.readAt,
        archived: selectedMessage.archived,
        starred: selectedMessage.starred,
        labels: selectedMessage.labels ?? [],
        source: selectedMessage.source,
      });
    }
  }, [selectedMessage]);

  // ── Filter chip definitions ─────────────────────────────────────
  const filters: { key: MessageFilter; label: string }[] = [
    { key: 'all', label: t('contactMessages.all') },
    { key: 'unread', label: t('contactMessages.unread') },
    { key: 'read', label: t('contactMessages.read') },
    { key: 'starred', label: t('contactMessages.starred') },
    { key: 'archived', label: t('contactMessages.archived') },
  ];

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ── Header + Filter Bar ─────────────────────────────────── */}
      <div style={{ marginBottom: '1rem' }}>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#111827',
            margin: '0 0 0.75rem',
          }}
        >
          {t('contactMessages.title')}
        </h1>

        {/* Search */}
        <div style={{ marginBottom: '0.75rem' }}>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('contactMessages.search')}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '0.875rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => handleFilterChange(f.key)}
              style={{
                padding: '0.25rem 0.75rem',
                border: '1px solid',
                borderColor: currentFilter === f.key ? '#3b82f6' : '#d1d5db',
                borderRadius: '9999px',
                background: currentFilter === f.key ? '#eff6ff' : '#fff',
                color: currentFilter === f.key ? '#1e40af' : '#374151',
                fontSize: '0.8125rem',
                fontWeight: currentFilter === f.key ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Two-panel layout ────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          gap: '1rem',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* ══ Left panel: message list ════════════════════════════ */}
        <div
          style={{
            width: isMobile ? '100%' : '40%',
            minWidth: isMobile ? '100%' : '320px',
            background: '#fff',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Loading skeleton */}
          {isLoading ? (
            <div style={{ padding: '1rem' }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  <div
                    style={{
                      height: '14px',
                      background: '#e5e7eb',
                      borderRadius: '4px',
                      width: '60%',
                      marginBottom: '0.5rem',
                    }}
                  />
                  <div
                    style={{
                      height: '12px',
                      background: '#e5e7eb',
                      borderRadius: '4px',
                      width: '40%',
                      marginBottom: '0.375rem',
                    }}
                  />
                  <div
                    style={{
                      height: '12px',
                      background: '#e5e7eb',
                      borderRadius: '4px',
                      width: '80%',
                    }}
                  />
                </div>
              ))}
            </div>
          ) : error ? (
            /* Error state */
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ color: '#ef4444', marginBottom: '0.75rem' }}>
                {t('common.error')}
              </p>
              <button
                onClick={() => refetch()}
                style={{
                  padding: '0.375rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                }}
              >
                {t('common.retry')}
              </button>
            </div>
          ) : (
            <ContactMessageList
              messages={contactMessages}
              selectedId={selectedId}
              onSelect={handleSelect}
              onArchive={handleArchiveToggle}
              onToggleStar={handleToggleStar}
              onDelete={handleDeleteRequest}
            />
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                borderTop: '1px solid #e5e7eb',
                flexShrink: 0,
              }}
            >
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrev}
                style={{
                  padding: '0.25rem 0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  background: '#fff',
                  cursor: pagination.hasPrev ? 'pointer' : 'not-allowed',
                  fontSize: '0.75rem',
                  opacity: pagination.hasPrev ? 1 : 0.5,
                }}
              >
                {t('common.previous')}
              </button>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                {currentPage} / {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNext}
                style={{
                  padding: '0.25rem 0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  background: '#fff',
                  cursor: pagination.hasNext ? 'pointer' : 'not-allowed',
                  fontSize: '0.75rem',
                  opacity: pagination.hasNext ? 1 : 0.5,
                }}
              >
                {t('common.next')}
              </button>
            </div>
          )}
        </div>

        {/* ══ Right panel: detail (desktop only) ═══════════════════ */}
        {!isMobile && (
          <div
            style={{
              flex: 1,
              background: '#fff',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              overflow: 'auto',
              padding: '1.5rem',
            }}
          >
            {!selectedId ? (
              /* ── Empty state ── */
              <div
                style={{
                  textAlign: 'center',
                  padding: '3rem 1rem',
                  color: '#9ca3af',
                }}
              >
                <p style={{ fontSize: '0.9375rem' }}>
                  {t('contactMessages.selectMessage')}
                </p>
              </div>
            ) : isDetailLoading ? (
              /* ── Loading skeleton ── */
              <div>
                <div
                  style={{
                    height: '20px',
                    background: '#e5e7eb',
                    borderRadius: '4px',
                    width: '50%',
                    marginBottom: '1rem',
                  }}
                />
                <div
                  style={{
                    height: '14px',
                    background: '#e5e7eb',
                    borderRadius: '4px',
                    width: '30%',
                    marginBottom: '0.5rem',
                  }}
                />
                <div
                  style={{
                    height: '14px',
                    background: '#e5e7eb',
                    borderRadius: '4px',
                    width: '40%',
                    marginBottom: '2rem',
                  }}
                />
                <div
                  style={{
                    height: '200px',
                    background: '#e5e7eb',
                    borderRadius: '8px',
                  }}
                />
              </div>
            ) : selectedMessage ? (
              /* ── Full Detail ── */
              <div>
                {/* ── Sender info header ── */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.5rem',
                        }}
                      >
                        <h2
                          style={{
                            fontSize: '1.125rem',
                            fontWeight: 'bold',
                            color: '#111827',
                            margin: 0,
                          }}
                        >
                          {selectedMessage.lastName
                            ? `${selectedMessage.firstName} ${selectedMessage.lastName}`
                            : selectedMessage.firstName}
                        </h2>
                        {!selectedMessage.readAt && (
                          <span
                            style={{
                              background: '#3b82f6',
                              color: '#fff',
                              fontSize: '0.625rem',
                              fontWeight: 600,
                              padding: '0.125rem 0.5rem',
                              borderRadius: '9999px',
                            }}
                          >
                            New
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          color: '#6b7280',
                          fontSize: '0.875rem',
                          marginBottom: '0.25rem',
                        }}
                      >
                        {selectedMessage.email}
                      </div>
                      {selectedMessage.whatsapp && (
                        <div
                          style={{
                            color: '#6b7280',
                            fontSize: '0.875rem',
                            marginBottom: '0.25rem',
                          }}
                        >
                          WhatsApp: {selectedMessage.whatsapp}
                        </div>
                      )}
                      <div
                        style={{
                          color: '#9ca3af',
                          fontSize: '0.75rem',
                          marginTop: '0.25rem',
                        }}
                      >
                        {formatDetailDate(selectedMessage.createdAt)}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                      {/* Star toggle */}
                      <button
                        onClick={handleStarFromDetail}
                        disabled={toggleStar.isPending}
                        title={selectedMessage.starred ? t('contactMessages.unstar') : t('contactMessages.star')}
                        style={{
                          padding: '0.375rem 0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          background: selectedMessage.starred ? '#fffbeb' : '#fff',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          color: selectedMessage.starred ? '#f59e0b' : '#9ca3af',
                          lineHeight: 1,
                        }}
                      >
                        {selectedMessage.starred ? '★' : '☆'}
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={handleDeleteFromDetail}
                        style={{
                          padding: '0.375rem 0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          background: '#fff',
                          cursor: 'pointer',
                          fontSize: '0.8125rem',
                          color: '#ef4444',
                        }}
                      >
                        🗑️
                      </button>

                      {/* Archive/Unarchive button */}
                      <button
                        onClick={handleArchiveFromDetail}
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
                        {selectedMessage.archived
                          ? t('contactMessages.unarchive')
                          : t('contactMessages.archive')}
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── Source & Origin Type ── */}
                <div
                  style={{
                    marginBottom: '1.5rem',
                    display: 'flex',
                    gap: '1.5rem',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        marginBottom: '0.25rem',
                        fontWeight: 600,
                      }}
                    >
                      Source
                    </div>
                    <div
                      style={{
                        fontSize: '0.8125rem',
                        color: '#1e40af',
                        background: '#dbeafe',
                        padding: '0.1875rem 0.5rem',
                        borderRadius: '6px',
                        display: 'inline-block',
                      }}
                    >
                      {selectedMessage.source && selectedMessage.source !== 'general'
                        ? formatSourceLabel(selectedMessage.source)
                        : 'General'}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        marginBottom: '0.25rem',
                        fontWeight: 600,
                      }}
                    >
                      Origin Type
                    </div>
                    <span
                      style={{
                        display: 'inline-block',
                        background:
                          selectedMessage.originType === 'CLIENT'
                            ? '#dbeafe'
                            : '#fce7f3',
                        color:
                          selectedMessage.originType === 'CLIENT'
                            ? '#1e40af'
                            : '#9d174d',
                        padding: '0.1875rem 0.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                      }}
                    >
                      {selectedMessage.originType}
                    </span>
                  </div>
                </div>

                {/* ── Full message ── */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      marginBottom: '0.375rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}
                  >
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
                    {selectedMessage.message}
                  </div>
                </div>

                {/* ── Labels ── */}
                <div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      marginBottom: '0.5rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}
                  >
                    {t('contactMessages.labels')}
                  </div>

                  {/* Existing labels */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.375rem',
                      flexWrap: 'wrap',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {(selectedMessage.labels ?? []).length === 0 ? (
                      <span style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>
                        —
                      </span>
                    ) : (
                      (selectedMessage.labels ?? []).map((label) => (
                        <span
                          key={label}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.125rem 0.5rem',
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddLabel();
                      }}
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
                      +
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* ── Confirm Delete Modal ── */}
      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        title={deleteTarget?.name || ''}
        entityName={t('contactMessages.title')}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
