import { useEffect, useState, useCallback } from 'react';
import { Modal } from '../ui/Modal/index.js';

/** Maximum simulator file size (matches the API: 1MB). */
export const SIMULATOR_PICKER_MAX_SIZE = 1 * 1024 * 1024;

/** Minimal simulator metadata shown in the picker. */
export interface SimulatorOption {
  id: string;
  title: string;
  slug: string;
  size: number;
}

/**
 * Data source for the editor's "Insertar simulador" picker. The consumer
 * (admin-panel) supplies an adapter over its authenticated API client.
 */
export interface SimulatorPickerApi {
  /** List existing simulators (newest first). */
  list: () => Promise<SimulatorOption[]>;
  /** Upload a new simulator file (`.html`, ≤ 1MB) and return its metadata. */
  upload: (file: File, title: string) => Promise<SimulatorOption>;
}

export interface SimulatorPickerLabels {
  title: string;
  listTitle: string;
  empty: string;
  loading: string;
  error: string;
  uploadTitle: string;
  titleLabel: string;
  titlePlaceholder: string;
  fileLabel: string;
  invalidFile: string;
  insert: string;
  upload: string;
  uploading: string;
}

interface SimulatorPickerProps {
  isOpen: boolean;
  onClose: () => void;
  api: SimulatorPickerApi;
  labels: SimulatorPickerLabels;
  /** Called with the chosen simulator id — the editor inserts the placeholder node. */
  onSelect: (id: string) => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

/**
 * Modal picker for the SimulatorPlaceholder node: list existing simulators
 * (click to insert) or upload a new one (`.html`, ≤ 1MB) which is inserted
 * immediately after a successful upload.
 */
export function SimulatorPicker({ isOpen, onClose, api, labels, onSelect }: SimulatorPickerProps) {
  const [simulators, setSimulators] = useState<SimulatorOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSimulators(await api.list());
    } catch {
      setError(labels.error);
    } finally {
      setLoading(false);
    }
  }, [api, labels.error]);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setFile(null);
      setFileError(null);
      load();
    }
  }, [isOpen, load]);

  const handleFileChange = (selected?: File) => {
    setFile(selected ?? null);
    if (selected) {
      const validExt = selected.name.toLowerCase().endsWith('.html');
      const validSize = selected.size <= SIMULATOR_PICKER_MAX_SIZE;
      setFileError(!validExt || !validSize ? labels.invalidFile : null);
    } else {
      setFileError(null);
    }
  };

  const handleUpload = async () => {
    if (!file || fileError || uploading) return;
    setUploading(true);
    try {
      const created = await api.upload(file, title.trim() || file.name);
      onSelect(created.id);
      onClose();
    } catch {
      setError(labels.error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={labels.title} className="rte-simulator-picker-modal">
      <div className="rte-simulator-picker">
        <h4 className="rte-simulator-picker-heading">{labels.listTitle}</h4>
        {loading && <p className="rte-simulator-picker-note">{labels.loading}</p>}
        {error && <p className="rte-simulator-picker-error">{error}</p>}
        {!loading && !error && simulators.length === 0 && (
          <p className="rte-simulator-picker-note">{labels.empty}</p>
        )}
        <ul className="rte-simulator-picker-list">
          {simulators.map((simulator) => (
            <li key={simulator.id} className="rte-simulator-picker-item">
              <span className="rte-simulator-picker-meta">
                <strong>{simulator.title}</strong>
                <small>
                  {simulator.slug} · {formatSize(simulator.size)}
                </small>
              </span>
              <button
                type="button"
                className="rte-simulator-picker-insert"
                onClick={() => {
                  onSelect(simulator.id);
                  onClose();
                }}
              >
                {labels.insert}
              </button>
            </li>
          ))}
        </ul>

        <h4 className="rte-simulator-picker-heading">{labels.uploadTitle}</h4>
        <div className="rte-simulator-picker-upload">
          <label className="rte-simulator-picker-field">
            <span>{labels.titleLabel}</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={labels.titlePlaceholder}
            />
          </label>
          <label className="rte-simulator-picker-field">
            <span>{labels.fileLabel}</span>
            <input
              type="file"
              accept=".html,text/html"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
            />
          </label>
          {fileError && <p className="rte-simulator-picker-error">{fileError}</p>}
          <button
            type="button"
            className="rte-simulator-picker-upload-btn"
            disabled={!file || !!fileError || uploading}
            onClick={handleUpload}
          >
            {uploading ? labels.uploading : labels.upload}
          </button>
        </div>
      </div>
    </Modal>
  );
}