import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n/LanguageContext';
import { useContactForms } from '@/hooks/useContactForms';
import { ContactMessageList, type ContactMessage } from '@/components/contact-messages/ContactMessageList';
import inboxStyles from './Inbox.module.css';
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
    <div className={inboxStyles.inboxContainer}>
      {/* ── Header + Filter Bar ─────────────────────────────────── */}
      <div className={inboxStyles.headerSection}>
        <h1 className={inboxStyles.pageTitle}>
          {t('contactMessages.title')}
        </h1>

        {/* Search */}
        <div className={inboxStyles.searchContainer}>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('contactMessages.search')}
            className={inboxStyles.searchInput}
          />
        </div>

        {/* Filter chips */}
        <div className={inboxStyles.filterRow}>
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => handleFilterChange(f.key)}
              className={`${inboxStyles.filterChip} ${currentFilter === f.key ? inboxStyles.filterChipActive : ''}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Two-panel layout ────────────────────────────────────── */}
      <div className={inboxStyles.splitView}>
        {/* ══ Left panel: message list ════════════════════════════ */}
        <div
          className={`${inboxStyles.listPanel} ${isMobile && selectedMessage?.id ? inboxStyles.hideOnMobile : ''}`}
        >
          {/* Loading skeleton */}
          {isLoading ? (
            <div className={inboxStyles.loadingSkeleton}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={inboxStyles.skeletonItem}>
                  <div className={inboxStyles.skeletonLine} />
                  <div className={inboxStyles.skeletonLineSm} />
                  <div className={inboxStyles.skeletonLineLg} />
                </div>
              ))}
            </div>
          ) : error ? (
            /* Error state */
            <div className={inboxStyles.errorState}>
              <p className={inboxStyles.errorText}>
                {t('common.error')}
              </p>
              <button
                onClick={() => refetch()}
                className={inboxStyles.retryBtn}
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
            <div className={inboxStyles.pagination}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrev}
                className={inboxStyles.pageBtn}
              >
                {t('common.previous')}
              </button>
              <span className={inboxStyles.pageInfo}>
                {currentPage} / {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNext}
                className={inboxStyles.pageBtn}
              >
                {t('common.next')}
              </button>
            </div>
          )}
        </div>

        {/* ══ Right panel: detail (desktop only) ═══════════════════ */}
        {!isMobile && (
          <div className={`${inboxStyles.detailPanel} ${inboxStyles.detailPadding}`}>
            {!selectedId ? (
              /* ── Empty state ── */
              <div className={inboxStyles.noMessageSelected}>
                <p className={inboxStyles.noMessageText}>
                  {t('contactMessages.selectMessage')}
                </p>
              </div>
            ) : isDetailLoading ? (
              /* ── Loading skeleton ── */
              <div>
                <div
                  style={{
                    height: '20px',
                    background: 'var(--color-neutral-200)',
                    borderRadius: '4px',
                    width: '50%',
                    marginBottom: '1rem',
                  }}
                />
                <div
                  style={{
                    height: '14px',
                    background: 'var(--color-neutral-200)',
                    borderRadius: '4px',
                    width: '30%',
                    marginBottom: '0.5rem',
                  }}
                />
                <div
                  style={{
                    height: '14px',
                    background: 'var(--color-neutral-200)',
                    borderRadius: '4px',
                    width: '40%',
                    marginBottom: '2rem',
                  }}
                />
                <div
                  style={{
                    height: '200px',
                    background: 'var(--color-neutral-200)',
                    borderRadius: '8px',
                  }}
                />
              </div>
            ) : selectedMessage ? (
              /* ── Full Detail ── */
              <div>
                {/* ── Sender info header ── */}
                <div className={inboxStyles.detailSection}>
                  <div className={inboxStyles.detailHeader}>
                    <div className={inboxStyles.detailSenderInfo}>
                      <div className={inboxStyles.detailNameRow}>
                        <h2 className={inboxStyles.detailName}>
                          {selectedMessage.lastName
                            ? `${selectedMessage.firstName} ${selectedMessage.lastName}`
                            : selectedMessage.firstName}
                        </h2>
                        {!selectedMessage.readAt && (
                          <span className={`${inboxStyles.badge} ${inboxStyles.badgeUnread}`}>
                            New
                          </span>
                        )}
                      </div>
                      <div className={inboxStyles.detailEmail}>
                        {selectedMessage.email}
                      </div>
                      {selectedMessage.whatsapp && (
                        <div className={inboxStyles.detailEmail}>
                          WhatsApp: {selectedMessage.whatsapp}
                        </div>
                      )}
                      <div className={inboxStyles.messageMeta}>
                        {formatDetailDate(selectedMessage.createdAt)}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className={inboxStyles.detailActions}>
                      {/* Star toggle */}
                      <button
                        onClick={handleStarFromDetail}
                        disabled={toggleStar.isPending}
                        title={selectedMessage.starred ? t('contactMessages.unstar') : t('contactMessages.star')}
                        className={`${inboxStyles.starButton} ${selectedMessage.starred ? inboxStyles.starred : ''}`}
                      >
                        {selectedMessage.starred ? '★' : '☆'}
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={handleDeleteFromDetail}
                        className={`${inboxStyles.actionBtn} ${inboxStyles.actionBtnDanger}`}
                      >
                        🗑️
                      </button>

                      {/* Archive/Unarchive button */}
                      <button
                        onClick={handleArchiveFromDetail}
                        disabled={toggleArchive.isPending}
                        className={inboxStyles.actionBtn}
                      >
                        {selectedMessage.archived
                          ? t('contactMessages.unarchive')
                          : t('contactMessages.archive')}
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── Source & Origin Type ── */}
                <div className={inboxStyles.senderInfoRow}>
                  <div>
                    <div className={inboxStyles.detailLabel}>
                      Source
                    </div>
                    <div className={inboxStyles.sourceBadge}>
                      {selectedMessage.source && selectedMessage.source !== 'general'
                        ? formatSourceLabel(selectedMessage.source)
                        : 'General'}
                    </div>
                  </div>
                  <div>
                    <div className={inboxStyles.detailLabel}>
                      Origin Type
                    </div>
                    <span
                      className={`${inboxStyles.originBadge} ${selectedMessage.originType === 'CLIENT' ? inboxStyles.originBadgeClient : inboxStyles.originBadgeOther}`}
                    >
                      {selectedMessage.originType}
                    </span>
                  </div>
                </div>

                {/* ── Full message ── */}
                <div className={inboxStyles.detailBody}>
                  <div className={inboxStyles.detailLabelUppercase}>
                    {t('contactMessages.subject')}
                  </div>
                  <div className={inboxStyles.detailBodyContent}>
                    {selectedMessage.message}
                  </div>
                </div>

                {/* ── Labels ── */}
                <div>
                  <div
                    className={inboxStyles.detailLabelUppercase}
                    style={{ marginBottom: '0.5rem' }}
                  >
                    {t('contactMessages.labels')}
                  </div>

                  {/* Existing labels */}
                  <div className={inboxStyles.labelsRow}>
                    {(selectedMessage.labels ?? []).length === 0 ? (
                      <span className={inboxStyles.emptyLabels}>
                        —
                      </span>
                    ) : (
                      (selectedMessage.labels ?? []).map((label) => (
                        <span key={label} className={inboxStyles.labelBadge}>
                          {label}
                          <button
                            onClick={() => handleRemoveLabel(label)}
                            className={inboxStyles.labelRemoveBtn}
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Add label input */}
                  <div className={inboxStyles.addLabelRow}>
                    <input
                      type="text"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddLabel();
                      }}
                      placeholder={t('contactMessages.addLabel')}
                      className={inboxStyles.addLabelInput}
                    />
                    <button
                      onClick={handleAddLabel}
                      disabled={!newLabel.trim() || setLabels.isPending}
                      className={inboxStyles.addLabelBtn}
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
