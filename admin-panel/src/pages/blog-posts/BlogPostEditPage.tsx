import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import { BlogPostForm } from '../../components/blog-posts/BlogPostForm';
import { useBlogPosts } from '../../hooks/useBlogPosts';
import { FormLayout } from '@/components/shared/FormLayout';
import { toast } from 'sonner';
import type { BlogPostInput } from '@jsoft/shared';

export function BlogPostEditPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useGetById, useUpdate } = useBlogPosts();
  const { data: post, isLoading } = useGetById(id!);
  const updateMutation = useUpdate();

  const handleSubmit = (data: BlogPostInput) => {
    updateMutation.mutate(
      { id: id!, data },
      {
        onSuccess: () => {
          toast.success('Artículo actualizado exitosamente');
          navigate('/blog-posts');
        },
      }
    );
  };

  if (isLoading) return <div style={{ textAlign: 'center', padding: '2rem' }}>{t('common.loading')}</div>;
  if (!post) return <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>Post not found</div>;

  return (
    <FormLayout title={t('blog.edit')} subtitle="Edit blog post details" backTo="/blog-posts">
      <BlogPostForm
        initialData={{
          title: post.title,
          slug: post.slug,
          shortDescription: post.shortDescription,
          body: post.body,
          status: post.status,
          coverImage: post.coverImage,
          category: post.category,
          externalLink: post.externalLink,
          lessonsLearned: post.lessonsLearned,
        }}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
      />
    </FormLayout>
  );
}
