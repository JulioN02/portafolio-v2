import { useAuth } from '../../hooks/useAuth';

export function Header() {
  const { getUser, logout } = useAuth();
  const user = getUser();

  return (
    <header style={{
      height: '60px',
      background: '#fff',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 2rem',
      gap: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.875rem', color: '#374151' }}>
          {user?.username || 'Admin'}
        </span>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: '#4ade80',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '0.875rem'
        }}>
          {user?.username?.[0]?.toUpperCase() || 'A'}
        </div>
      </div>
      <button
        onClick={logout}
        style={{
          padding: '0.5rem 1rem',
          background: '#ef4444',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.875rem'
        }}
      >
        Logout
      </button>
    </header>
  );
}