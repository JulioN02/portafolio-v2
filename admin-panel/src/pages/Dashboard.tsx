import { Link } from 'react-router-dom';
import { useServices } from '../hooks/useServices';
import { useProducts } from '../hooks/useProducts';
import { useTools } from '../hooks/useTools';
import { useBlogPosts } from '../hooks/useBlogPosts';
import { useContactForms } from '../hooks/useContactForms';
import { SummaryCard } from '../components/dashboard/SummaryCard';

function formatDate(date: Date | string): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function DashboardPage() {
  const { useGetAll: useServicesAll } = useServices();
  const { useGetAll: useProductsAll } = useProducts();
  const { useGetAll: useToolsAll } = useTools();
  const { useGetAll: useBlogPostsAll } = useBlogPosts();
  const { useGetAll: useContactFormsAll } = useContactForms();

  const { data: servicesData } = useServicesAll();
  const { data: productsData } = useProductsAll();
  const { data: toolsData } = useToolsAll();
  const { data: blogPostsData } = useBlogPostsAll();
  const { data: contactFormsData } = useContactFormsAll({ page: 1, limit: 5 });

  const stats = {
    services: servicesData?.pagination?.total || 0,
    products: productsData?.pagination?.total || 0,
    tools: toolsData?.pagination?.total || 0,
    blogPosts: blogPostsData?.pagination?.total || 0,
    contacts: contactFormsData?.pagination?.total || 0,
  };

  const recentMessages = contactFormsData?.data || [];

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
        Dashboard
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
        }}
      >
        <SummaryCard title="Services" value={stats.services} icon="🛠️" color="#3b82f6" />
        <SummaryCard title="Products" value={stats.products} icon="📦" color="#8b5cf6" />
        <SummaryCard title="Tools" value={stats.tools} icon="🔧" color="#f59e0b" />
        <SummaryCard title="Blog Posts" value={stats.blogPosts} icon="📝" color="#10b981" />
        <SummaryCard title="Contact Forms" value={stats.contacts} icon="📧" color="#ef4444" />
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: '2rem' }}>
        <h2
          style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#111827',
          }}
        >
          Quick Actions
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
          }}
        >
          <Link
            to="/blog-posts/create"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#fff',
              borderRadius: '8px',
              padding: '1rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textDecoration: 'none',
              color: '#111827',
              fontWeight: '500',
              fontSize: '0.875rem',
              transition: 'box-shadow 0.2s',
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>📝</span>
            Create Blog Post
          </Link>
          <Link
            to="/services/create"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#fff',
              borderRadius: '8px',
              padding: '1rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textDecoration: 'none',
              color: '#111827',
              fontWeight: '500',
              fontSize: '0.875rem',
              transition: 'box-shadow 0.2s',
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>🛠️</span>
            Create Service
          </Link>
          <Link
            to="/contact-messages"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#fff',
              borderRadius: '8px',
              padding: '1rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textDecoration: 'none',
              color: '#111827',
              fontWeight: '500',
              fontSize: '0.875rem',
              transition: 'box-shadow 0.2s',
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>📧</span>
            View Contact Messages
          </Link>
        </div>
      </div>

      {/* Recent Contact Messages */}
      <div style={{ marginTop: '2rem' }}>
        <h2
          style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#111827',
          }}
        >
          Recent Activity
        </h2>
        <div
          style={{
            background: '#fff',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          }}
        >
          {recentMessages.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                    Name
                  </th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                    Email
                  </th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                    Subject
                  </th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentMessages.map((msg) => (
                  <tr
                    key={msg.id}
                    style={{ borderBottom: '1px solid #e5e7eb', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
                  >
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <Link
                        to={`/contact-messages/${msg.id}`}
                        style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}
                      >
                        {msg.lastName ? `${msg.firstName} ${msg.lastName}` : msg.firstName}
                      </Link>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                      {msg.email}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                      {msg.source}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#6b7280', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                      {formatDate(msg.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
              No contact messages yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
