import { Outlet, NavLink } from 'react-router-dom';

const sidebarLinks = [
  { to: '/settings/profile', label: 'Profile', end: true },
  { to: '/settings/preferences', label: 'Preferences' },
  { to: '/settings/security', label: 'Security' },
];

export function SettingsLayout() {
  return (
    <div>
      <h1
        style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          color: '#111827',
        }}
      >
        Settings
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1.5rem' }}>
        {/* Sidebar */}
        <div
          style={{
            background: '#fff',
            borderRadius: '8px',
            padding: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            height: 'fit-content',
          }}
        >
          <nav style={{ display: 'grid', gap: '0.25rem' }}>
            {sidebarLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                style={({ isActive }) => ({
                  display: 'block',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  color: isActive ? '#3b82f6' : '#6b7280',
                  background: isActive ? '#eff6ff' : 'transparent',
                  fontWeight: isActive ? '500' : '400',
                  textDecoration: 'none',
                })}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div
          style={{
            background: '#fff',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}