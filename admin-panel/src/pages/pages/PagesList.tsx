import { useSiteSections } from '../../hooks/useSiteSections';

export function PagesList() {
  const { sections, toggleSection, moveSection, isLoaded } = useSiteSections();

  if (!isLoaded) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
        Loading...
      </div>
    );
  }

  return (
    <div>
      <h1
        style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '0.5rem',
          color: '#111827',
        }}
      >
        Site Sections
      </h1>
      <p
        style={{
          color: '#6b7280',
          marginBottom: '1.5rem',
        }}
      >
        Manage the order and visibility of portfolio sections on your public site.
      </p>

      <div
        style={{
          background: '#fff',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th
                style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                }}
              >
                Order
              </th>
              <th
                style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                }}
              >
                Section
              </th>
              <th
                style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                }}
              >
                Visible
              </th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section, index) => (
              <tr
                key={section.id}
                style={{ borderBottom: '1px solid #e5e7eb' }}
              >
                <td
                  style={{
                    padding: '0.75rem 1rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      type="button"
                      onClick={() => moveSection(section.id, 'up')}
                      disabled={index === 0}
                      title="Move up"
                      style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #d1d5db',
                        background: index === 0 ? '#f3f4f6' : '#fff',
                        color: index === 0 ? '#d1d5db' : '#6b7280',
                        cursor: index === 0 ? 'not-allowed' : 'pointer',
                        fontSize: '0.75rem',
                      }}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(section.id, 'down')}
                      disabled={index === sections.length - 1}
                      title="Move down"
                      style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #d1d5db',
                        background:
                          index === sections.length - 1 ? '#f3f4f6' : '#fff',
                        color:
                          index === sections.length - 1 ? '#d1d5db' : '#6b7280',
                        cursor:
                          index === sections.length - 1
                            ? 'not-allowed'
                            : 'pointer',
                        fontSize: '0.75rem',
                      }}
                    >
                      ↓
                    </button>
                  </div>
                </td>
                <td
                  style={{
                    padding: '0.75rem 1rem',
                    fontWeight: '500',
                    color: '#111827',
                  }}
                >
                  {section.label}
                </td>
                <td
                  style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'center',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    style={{
                      width: '40px',
                      height: '24px',
                      borderRadius: '12px',
                      border: 'none',
                      background: section.enabled ? '#10b981' : '#d1d5db',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'background 0.2s',
                    }}
                    title={section.enabled ? 'Hide' : 'Show'}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: '2px',
                        left: section.enabled ? '18px' : '2px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: '#fff',
                        transition: 'left 0.2s',
                      }}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}