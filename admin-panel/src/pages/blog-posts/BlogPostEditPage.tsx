import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import { BlogPostForm } from '../../components/blog-posts/BlogPostForm';
import { useBlogPosts } from '../../hooks/useBlogPosts';
import { BackButton } from '@/components/shared/BackButton';
import { BlogPostInput } from '@jsoft/shared';

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
          navigate('/blog-posts');
        },
      }
    );
  };

  if (isLoading) return <div style={{ textAlign: 'center', padding: '2rem' }}>{t('common.loading')}</div>;
  if (!post) return <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>Post not found</div>;

  return (
    <div>
      <BackButton to="/blog-posts" />
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>{t('blog.edit')} Blog Post</h1>
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
    </div>
  );
}