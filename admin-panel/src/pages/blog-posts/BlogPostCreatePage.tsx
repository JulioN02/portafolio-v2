import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import { BlogPostForm } from '../../components/blog-posts/BlogPostForm';
import { useBlogPosts } from '../../hooks/useBlogPosts';
import { BlogPostInput } from '@jsoft/shared';

export function BlogPostCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { useCreate } = useBlogPosts();
  const createMutation = useCreate();

  const handleSubmit = (data: BlogPostInput) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        navigate('/blog-posts');
      },
    });
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>{t('blog.create')}</h1>
      <BlogPostForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
    </div>
  );
}