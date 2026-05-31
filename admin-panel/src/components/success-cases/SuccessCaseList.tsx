import type { SuccessCaseResponse } from '@jsoft/shared';
import { Button } from '@jsoft/shared';
import { useTranslation } from '../../i18n/LanguageContext';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { StatusSelect } from '@/components/shared/StatusSelect';

interface SuccessCaseListProps {
  successCases: SuccessCaseResponse[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
}

// Extended interface with additional fields that may come from the API
interface ExtendedSuccessCase extends SuccessCaseResponse {
  clientName?: string;
  classification?: string;
  link?: string;
}

export function SuccessCaseList({ successCases, onEdit, onDelete, onStatusChange }: SuccessCaseListProps) {
  const { t } = useTranslation();

  // Cast to extended type to access additional fields
  const cases = successCases as ExtendedSuccessCase[];

  if (successCases.length === 0) {
    return (
      <div className="admin-empty">
        <div className="admin-empty-icon">📋</div>
        <div className="admin-empty-text">{t('successCases.empty')}</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {cases.map((successCase) => (
        <div
          key={successCase.id}
          style={{
            background: '#fff',
            borderRadius: '8px',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            border: '1px solid #e5e7eb',
          }}
        >
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: '500', margin: 0 }}>{successCase.title}</p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
              {successCase.clientName || 'No client name'}
              {successCase.classification && ` • ${successCase.classification}`}
            </p>
          </div>
          {onStatusChange && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <StatusBadge status={successCase.status} />
              <StatusSelect value={successCase.status} onChange={(newStatus) => onStatusChange(successCase.id, newStatus)} />
            </div>
          )}
          {successCase.link && (
            <a 
              href={successCase.link} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ fontSize: '0.75rem', color: '#3b82f6', textDecoration: 'none' }}
            >
              Link ↗
            </a>
          )}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="secondary" size="sm" onClick={() => onEdit(successCase.id)}>{t('successCases.edit')}</Button>
            <Button variant="danger" size="sm" onClick={() => onDelete(successCase.id)}>{t('successCases.delete')}</Button>
          </div>
        </div>
      ))}
    </div>
  );
}
