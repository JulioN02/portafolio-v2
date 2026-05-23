import { useState } from 'react';
import { useSiteSections, type SectionOrder } from '../../hooks/useSiteSections';

export function PagesList() {
  const { sections, toggleSection, moveSection, saveSections, isLoaded } = useSiteSections();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSectionId, setNewSectionId] = useState('');
  const [newSectionLabel, setNewSectionLabel] = useState('');
  const [addError, setAddError] = useState('');

  if (!isLoaded) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
        Loading...
      </div>
    );
  }

  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');

    const id = newSectionId.trim();
    const label = newSectionLabel.trim();

    if (!id || !label) {
      setAddError('Both Section ID and Section Label are required.');
      return;
    }

    if (sections.some((s) => s.id === id)) {
      setAddError(`A section with ID "${id}" already exists.`);
      return;
    }

    const newSection: SectionOrder = {
      id,
      label,
      enabled: true,
    };

    saveSections([...sections, newSection]);
    setNewSectionId('');
    setNewSectionLabel('');
    setShowAddForm(false);
  };

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

      {/* Info Banner */}
      <div
        style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.5rem',
          color: '#1e40af',
          fontSize: '0.875rem',
          lineHeight: '1.5',
        }}
      >
        <span style={{ fontSize: '1rem', flexShrink: 0 }}>ℹ️</span>
        <span>
          This manages the order and visibility of sections on your public portfolio site.
          Changes are saved locally. API integration coming soon.
        </span>
      </div>

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

      {/* Add Section */}
      <div style={{ marginTop: '1rem' }}>
        {!showAddForm ? (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              background: '#fff',
              color: '#3b82f6',
              fontWeight: '500',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            + Add Section
          </button>
        ) : (
          <form
            onSubmit={handleAddSection}
            style={{
              background: '#fff',
              borderRadius: '8px',
              padding: '1rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', minWidth: '180px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    marginBottom: '0.25rem',
                    fontWeight: '500',
                  }}
                >
                  Section ID
                </label>
                <input
                  type="text"
                  value={newSectionId}
                  onChange={(e) => setNewSectionId(e.target.value)}
                  placeholder="e.g. testimonials"
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    background: '#fff',
                    color: '#111827',
                    fontSize: '0.875rem',
                  }}
                />
              </div>
              <div style={{ flex: '1', minWidth: '180px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    marginBottom: '0.25rem',
                    fontWeight: '500',
                  }}
                >
                  Section Label
                </label>
                <input
                  type="text"
                  value={newSectionLabel}
                  onChange={(e) => setNewSectionLabel(e.target.value)}
                  placeholder="e.g. Testimonials"
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    background: '#fff',
                    color: '#111827',
                    fontSize: '0.875rem',
                  }}
                />
              </div>
            </div>

            {addError && (
              <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: 0 }}>
                {addError}
              </p>
            )}

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="submit"
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#3b82f6',
                  color: '#fff',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                Add Section
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setAddError('');
                  setNewSectionId('');
                  setNewSectionLabel('');
                }}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  background: '#fff',
                  color: '#6b7280',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
