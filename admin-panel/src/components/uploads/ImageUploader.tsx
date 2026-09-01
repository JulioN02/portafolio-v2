import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from '../../i18n/LanguageContext';
import { uploadApi } from '../../api/upload.api';
import styles from './ImageUploader.module.css';

// Aligned with the server's allowed extensions (upload-hardening spec):
// SVG is NOT advertised because the server rejects it for XSS safety.
const DEFAULT_ACCEPT = 'image/jpeg,image/png,image/gif,image/webp';

interface UploadTask {
  key: string;
  name: string;
  progress: number;
}

interface ImageUploaderProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  accept?: string;
  label?: string;
  bucket?: string;
  maxSizeMB?: number;
  error?: string;
  id?: string;
}

function toUrlArray(value: string | string[]): string[] {
  return Array.isArray(value) ? value : value ? [value] : [];
}

function getServerError(error: unknown): string | undefined {
  if (error && typeof error === 'object' && 'response' in error) {
    const data = (error as { response?: { data?: { message?: string; error?: string } } }).response?.data;
    return data?.message ?? data?.error;
  }
  return undefined;
}

export function ImageUploader({
  value,
  onChange,
  multiple = false,
  accept = DEFAULT_ACCEPT,
  label,
  bucket,
  maxSizeMB = 5,
  error,
  id,
}: ImageUploaderProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef(value);
  const [isDragging, setIsDragging] = useState(false);
  const [tasks, setTasks] = useState<UploadTask[]>([]);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const urls = toUrlArray(value);

  const pushUrl = (newUrl: string) => {
    if (multiple) {
      const current = toUrlArray(valueRef.current);
      if (!current.includes(newUrl)) onChange([...current, newUrl]);
    } else {
      onChange(newUrl);
    }
  };

  const removeUrl = (target: string) => {
    if (multiple) {
      const current = toUrlArray(valueRef.current);
      onChange(current.filter((url) => url !== target));
    } else {
      onChange('');
    }
  };

  const uploadFile = async (file: File) => {
    if (!file.type || !file.type.startsWith('image/')) {
      toast.error(t('upload.unsupportedType').replace('{name}', file.name));
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(t('upload.fileTooLarge').replace('{name}', file.name));
      return;
    }

    const key = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setTasks((prev) => [...prev, { key, name: file.name, progress: 0 }]);

    try {
      const result = await uploadApi.uploadImage(file, bucket, (percent) => {
        setTasks((prev) =>
          prev.map((task) => (task.key === key ? { ...task, progress: percent } : task)),
        );
      });
      pushUrl(result.url);
    } catch (uploadError) {
      toast.error(getServerError(uploadError) ?? t('upload.failed').replace('{name}', file.name));
    } finally {
      setTasks((prev) => prev.filter((task) => task.key !== key));
    }
  };

  const handleFiles = (fileList: FileList | File[]) => {
    for (const file of Array.from(fileList)) {
      void uploadFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    if (!event.dataTransfer.files || event.dataTransfer.files.length === 0) return;
    handleFiles(event.dataTransfer.files);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    handleFiles(event.target.files);
    event.target.value = '';
  };

  const openPicker = () => {
    inputRef.current?.click();
  };

  return (
    <div className={styles.wrapper}>
      {label && (
        <span className={styles.label}>
          {label}
          {multiple && <span className={styles.optional}>{t('common.optional')}</span>}
        </span>
      )}

      <div
        className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''} ${error ? styles.dropzoneError : ''}`}
        onClick={openPicker}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label={label}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openPicker();
          }
        }}
      >
        <svg
          className={styles.dropzoneIcon}
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span className={styles.dropzoneText}>
          {isDragging ? t('upload.dropActive') : t('upload.dragDrop')}
        </span>
        <span className={styles.dropzoneHint}>
          {t('upload.hint')} · {t('upload.maxSize').replace('{size}', String(maxSizeMB))}
        </span>
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          multiple={multiple}
          hidden
          onChange={handleInputChange}
        />
      </div>

      {error && <span className={styles.error}>{error}</span>}

      {tasks.length > 0 && (
        <ul className={styles.taskList}>
          {tasks.map((task) => (
            <li key={task.key} className={styles.taskItem}>
              <span className={styles.spinner} aria-hidden="true" />
              <span className={styles.taskName}>{task.name}</span>
              <span className={styles.taskProgress}>{task.progress}%</span>
              <div className={styles.progressTrack}>
                <div className={styles.progressBar} style={{ width: `${task.progress}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {urls.length > 0 && (
        <div className={styles.gallery}>
          {urls.map((url) => (
            <div key={url} className={`${styles.thumb} ${multiple ? '' : styles.singleThumb}`}>
              <img src={url} alt={label ?? ''} loading="lazy" />
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => removeUrl(url)}
                title={t('form.remove')}
                aria-label={t('form.remove')}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}