interface SummaryCardProps {
  title: string;
  value: number | string;
  icon: string;
  color?: string;
}

export function SummaryCard({ title, value, icon, color = '#4ade80' }: SummaryCardProps) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '8px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '8px',
          background: `${color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>{title}</p>
        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
          {value}
        </p>
      </div>
    </div>
  );
}