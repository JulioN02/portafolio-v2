import { useState } from 'react';
import { Loading, ErrorMessage } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import { useSimulators } from '../../hooks/useSimulators';
import { SIMULATOR_MAX_SIZE } from '../../api/simulators.api';
import { ConfirmDeleteModal } from '@/components/shared/ConfirmDeleteModal';
import { toast } from 'sonner';
import formStyles from '../../styles/form.module.css';
import listStyles from '../../components/shared/ListItem.module.css';

/** Formats bytes as a human-readable size (KB/MB). */
export function formatSimulatorSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function SimulatorsListPage() {
  const { t } = useTranslation();
  const { useGetAll, useUpload, useDelete } = useSimulators();
  const { data: simulators, isLoading, error } = useGetAll();
  const uploadMutation = useUpload();
  const deleteMutation = useDelete();

  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const handleFileChange = (selected?: File) => {
    setFile(selected ?? null);
    if (selected) {
      const validExt = selected.name.toLowerCase().endsWith('.html');
      const validSize = selected.size <= SIMULATOR_MAX_SIZE;
      setFileError(!validExt || !validSize ? t('simulators.fileInvalid') : null);
    } else {
      setFileError(null);
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFileError(t('simulators.titleRequired'));
      return;
    }
    if (!file || fileError) return;

    uploadMutation.mutate(
      { file, title: title.trim() },
      {
        onSuccess: () => {
          toast.success(t('simulators.uploadSuccess'));
          setTitle('');
          setFile(null);
        },
        onError: () => {
          toast.error(t('simulators.uploadError'));
        },
      },
    );
  };

  /** Row delete button → opens the shared confirmation modal (established UX). */
  const handleDelete = (simulator: { id: string; title: string }) => {
    setDeleteTarget({ id: simulator.id, title: simulator.title });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => toast.success(t('simulators.deleteSuccess')),
      onError: () => toast.error(t('simulators.deleteError')),
    });
    setDeleteTarget(null);
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={t('common.error')} />;

  return (
    <div className={formStyles.adminContainer}>
      <div className={formStyles.pageHeader}>
        <h1 className={formStyles.pageTitle}>{t('simulators.title')}</h1>
      </div>

      {/* Upload form */}
      <form onSubmit={handleUpload} className={formStyles.formSection}>
        <div className={formStyles.sectionTitle}>{t('simulators.uploadTitle')}</div>
        <div className={formStyles.fieldRow}>
          <div className={formStyles.formGroup}>
            <label className={formStyles.formLabel} htmlFor="simTitle">
              {t('simulators.titleLabel')}
            </label>
            <input
              id="simTitle"
              className={formStyles.formInput}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('simulators.titlePlaceholder')}
            />
          </div>
          <div className={formStyles.formGroup}>
            <label className={formStyles.formLabel} htmlFor="simFile">
              {t('simulators.fileLabel')}
            </label>
            <input
              id="simFile"
              type="file"
              accept=".html,text/html"
              className={formStyles.formInput}
              onChange={(e) => handleFileChange(e.target.files?.[0])}
            />
            {fileError && <span className={formStyles.formError}>{fileError}</span>}
          </div>
        </div>
        <div className={formStyles.buttonRow}>
          <button type="submit" className={formStyles.btnPrimary} disabled={uploadMutation.isPending}>
            {uploadMutation.isPending ? t('simulators.uploading') : t('simulators.upload')}
          </button>
        </div>
      </form>

      {/* List */}
      <div className={formStyles.tableWrapper}>
        {simulators && simulators.length > 0 ? (
          <ul className={listStyles.listItem}>
            {simulators.map((simulator) => (
              <li key={simulator.id} className={listStyles.listRow}>
                <div className={listStyles.content}>
                  <p className={listStyles.title}>{simulator.title}</p>
                  <p className={listStyles.description}>
                    {simulator.slug} · {formatSimulatorSize(simulator.size)} ·{' '}
                    {formatDate(simulator.uploadedAt)}
                  </p>
                </div>
                <div className={listStyles.actions}>
                  <button
                    type="button"
                    className={listStyles.actionBtnDanger}
                    disabled={deleteMutation.isPending}
                    onClick={() => handleDelete(simulator)}
                  >
                    {t('simulators.delete')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className={formStyles.emptyState}>
            <p>{t('simulators.empty')}</p>
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        title={deleteTarget?.title || ''}
        entityName={t('simulators.deleteConfirm')}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}