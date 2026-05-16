import { Link } from 'react-router-dom';
import { Button } from '@jsoft/shared';
import type { ServiceResponse } from '@jsoft/shared';

interface ServiceTableProps {
  services: ServiceResponse[];
  onDelete: (id: string) => void;
  onToggleFeatured: (id: string, featured: boolean) => void;
}

export function ServiceTable({ services, onDelete, onToggleFeatured }: ServiceTableProps) {
  if (services.length === 0) {
    return <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>No services found</p>;
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
          <th style={{ textAlign: 'left', padding: '0.75rem' }}>Title</th>
          <th style={{ textAlign: 'left', padding: '0.75rem' }}>Classification</th>
          <th style={{ textAlign: 'center', padding: '0.75rem' }}>Featured</th>
          <th style={{ textAlign: 'right', padding: '0.75rem' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {services.map((service) => (
          <tr key={service.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
            <td style={{ padding: '0.75rem' }}>{service.title}</td>
            <td style={{ padding: '0.75rem' }}>{service.classification}</td>
            <td style={{ textAlign: 'center', padding: '0.75rem' }}>
              <button
                onClick={() => onToggleFeatured(service.id, !service.featured)}
                style={{
                  padding: '0.25rem 0.5rem',
                  background: service.featured ? '#10b981' : '#6b7280',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
              >
                {service.featured ? 'Yes' : 'No'}
              </button>
            </td>
            <td style={{ textAlign: 'right', padding: '0.75rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <Link to={`/services/edit/${service.id}`}>
                <Button variant="secondary" size="sm">Edit</Button>
              </Link>
              <Button variant="danger" size="sm" onClick={() => onDelete(service.id)}>Delete</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}