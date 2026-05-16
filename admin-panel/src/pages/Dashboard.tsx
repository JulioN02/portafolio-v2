import { useServices } from '../hooks/useServices';
import { useProducts } from '../hooks/useProducts';
import { useTools } from '../hooks/useTools';
import { useBlogPosts } from '../hooks/useBlogPosts';
import { useContactForms } from '../hooks/useContactForms';
import { SummaryCard } from '../components/dashboard/SummaryCard';

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
  const { data: contactFormsData } = useContactFormsAll();

  const stats = {
    services: servicesData?.pagination?.total || 0,
    products: productsData?.pagination?.total || 0,
    tools: toolsData?.pagination?.total || 0,
    blogPosts: blogPostsData?.pagination?.total || 0,
    contacts: contactFormsData?.pagination?.total || 0,
  };

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
            padding: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
            No recent activity
          </p>
        </div>
      </div>
    </div>
  );
}