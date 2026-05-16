import { NavLink } from 'react-router-dom';
import { useState } from 'react';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: '📊' },
  { label: 'Services', path: '/services', icon: '🛠️' },
  { label: 'Products', path: '/products', icon: '📦' },
  { label: 'Tools', path: '/tools', icon: '🔧' },
  { label: 'Success Cases', path: '/success-cases', icon: '🏆' },
  { label: 'Blog Posts', path: '/blog-posts', icon: '📝' },
  { label: 'Contact Messages', path: '/contact-messages', icon: '📧' },
  { label: 'Pages', path: '/pages', icon: '📄' },
  { label: 'Settings', path: '/settings', icon: '⚙️' },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside style={{ 
      width: isCollapsed ? '60px' : '240px', 
      transition: 'width 0.3s',
      background: '#1a1a2e',
      minHeight: '100vh',
      padding: '1rem'
    }}>
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#fff', fontWeight: 'bold' }}>
          {isCollapsed ? 'JS' : 'Admin Panel'}
        </span>
        <button onClick={() => setIsCollapsed(!isCollapsed)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
          {isCollapsed ? '→' : '←'}
        </button>
      </div>
      <nav>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'block',
              padding: '0.75rem',
              color: isActive ? '#4ade80' : '#9ca3af',
              textDecoration: 'none',
              borderRadius: '4px',
              marginBottom: '0.25rem',
              background: isActive ? 'rgba(74, 222, 128, 0.1)' : 'transparent',
            })}
          >
            <span style={{ marginRight: '0.5rem' }}>{item.icon}</span>
            {!isCollapsed && item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}