import { useNavigate } from 'react-router-dom';
import { BlogPostForm } from '../../components/blog-posts/BlogPostForm';
import { useBlogPosts } from '../../hooks/useBlogPosts';
import { BlogPostInput } from '@jsoft/shared';

export function BlogPostCreatePage() {
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
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Create Blog Post</h1>
      <BlogPostForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
    </div>
  );
}