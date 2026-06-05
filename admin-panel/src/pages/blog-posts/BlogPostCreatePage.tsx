import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import { BlogPostForm } from '../../components/blog-posts/BlogPostForm';
import { useBlogPosts } from '../../hooks/useBlogPosts';
import { FormLayout } from '@/components/shared/FormLayout';
import { toast } from 'sonner';
import type { BlogPostInput } from '@jsoft/shared';

export function BlogPostCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { useCreate } = useBlogPosts();
  const createMutation = useCreate();

  const handleSubmit = (data: BlogPostInput) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Artículo creado exitosamente');
        navigate('/blog-posts');
      },
    });
  };

  return (
    <FormLayout title={t('blog.create')} subtitle="Create a new blog post" backTo="/blog-posts">
      <BlogPostForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
    </FormLayout>
  );
}
