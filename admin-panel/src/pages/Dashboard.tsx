import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import { useServices } from '../hooks/useServices';
import { useProducts } from '../hooks/useProducts';
import { useTools } from '../hooks/useTools';
import { useBlogPosts } from '../hooks/useBlogPosts';
import { useContactForms } from '../hooks/useContactForms';
import { SummaryCard } from '../components/dashboard/SummaryCard';
import styles from './Dashboard.module.css';

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
  const { t } = useTranslation();
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
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>
        {t('dashboard.title')}
      </h1>

      <div className={styles.statsGrid}>
        <SummaryCard title={t('services.title')} value={stats.services} icon="🛠️" color="#3b82f6" />
        <SummaryCard title={t('products.title')} value={stats.products} icon="📦" color="#8b5cf6" />
        <SummaryCard title={t('tools.title')} value={stats.tools} icon="🔧" color="#f59e0b" />
        <SummaryCard title={t('blog.title')} value={stats.blogPosts} icon="📝" color="#10b981" />
        <SummaryCard title={t('contactMessages.title')} value={stats.contacts} icon="📧" color="#ef4444" />
      </div>

      {/* Quick Actions */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          {t('dashboard.quickActions')}
        </h2>
        <div className={styles.quickActions}>
          <Link
            to="/blog-posts/create"
            className={styles.quickActionLink}
          >
            <span className={styles.quickActionIcon}>📝</span>
            {t('dashboard.createBlogPost')}
          </Link>
          <Link
            to="/services/create"
            className={styles.quickActionLink}
          >
            <span className={styles.quickActionIcon}>🛠️</span>
            {t('dashboard.createService')}
          </Link>
          <Link
            to="/contact-messages"
            className={styles.quickActionLink}
          >
            <span className={styles.quickActionIcon}>📧</span>
            {t('dashboard.viewMessages')}
          </Link>
        </div>
      </div>

      {/* Recent Contact Messages */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          {t('dashboard.recentActivity')}
        </h2>
        <div className={styles.activityTable}>
          {recentMessages.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableHeader}>
                  <th className={styles.th}>
                    {t('contactMessages.name')}
                  </th>
                  <th className={styles.th}>
                    {t('contactMessages.email')}
                  </th>
                  <th className={styles.th}>
                    {t('contactMessages.subject')}
                  </th>
                  <th className={styles.th}>
                    {t('contactMessages.date')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentMessages.map((msg) => (
                  <tr
                    key={msg.id}
                    className={styles.tableRow}
                  >
                    <td className={styles.td}>
                      <Link
                        to={`/contact-messages/${msg.id}`}
                        className={styles.messageLink}
                      >
                        {msg.lastName ? `${msg.firstName} ${msg.lastName}` : msg.firstName}
                      </Link>
                    </td>
                    <td className={`${styles.td} ${styles.tdSecondary}`}>
                      {msg.email}
                    </td>
                    <td className={`${styles.td} ${styles.tdSecondary}`}>
                      {msg.source}
                    </td>
                    <td className={`${styles.td} ${styles.tdSecondary} ${styles.tdNowrap}`}>
                      {formatDate(msg.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={styles.emptyState}>
              {t('dashboard.noMessages')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
