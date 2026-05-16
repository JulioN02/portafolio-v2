import { useState } from 'react';
import { Input } from '@jsoft/shared';
import { Button } from '@jsoft/shared';
import { BlogPostInput, PostStatus } from '@jsoft/shared';

interface BlogPostFormProps {
  initialData?: Partial<BlogPostInput>;
  onSubmit: (data: BlogPostInput) => void;
  isLoading?: boolean;
}

export function BlogPostForm({ initialData, onSubmit, isLoading }: BlogPostFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [body, setBody] = useState(initialData?.body || '');
  const [status, setStatus] = useState<PostStatus>(initialData?.status || 'DRAFT');
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [externalLink, setExternalLink] = useState(initialData?.externalLink || '');
  const [lessonsLearned, setLessonsLearned] = useState(initialData?.lessonsLearned || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title || title.length < 3) newErrors.title = 'Title must be at least 3 characters';
    if (!slug || slug.length < 3) newErrors.slug = 'Slug must be at least 3 characters';
    if (!category || category.length < 2) newErrors.category = 'Category must be at least 2 characters';
    if (!shortDescription || shortDescription.length < 10) newErrors.shortDescription = 'Short description must be at least 10 characters';
    if (!coverImage) newErrors.coverImage = 'Cover image URL is required';
    if (!body || body.length < 100) newErrors.body = 'Body must be at least 100 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateSlug = () => {
    const slugified = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setSlug(slugified);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        title,
        slug,
        shortDescription,
        body,
        status,
        coverImage,
        category,
        externalLink: externalLink || undefined,
        lessonsLearned: lessonsLearned || undefined,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
        <div style={{ flex: 1 }}>
          <Input
            id="title"
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
            required
          />
        </div>
        <Button 
          type="button" 
          onClick={generateSlug}
          style={{ marginBottom: '0.25rem', background: '#6b7280' }}
        >
          Generate Slug
        </Button>
      </div>

      <Input
        id="slug"
        label="Slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        error={errors.slug}
        required
      />

      <Input
        id="category"
        label="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        error={errors.category}
        required
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Short Description</label>
        <textarea
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          style={{
            padding: '0.5rem',
            border: errors.shortDescription ? '1px solid #ef4444' : '1px solid #d1d5db',
            borderRadius: '4px',
            minHeight: '80px',
            fontSize: '1rem'
          }}
        />
        {errors.shortDescription && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.shortDescription}</span>}
      </div>

      <Input
        id="coverImage"
        label="Cover Image URL"
        type="url"
        value={coverImage}
        onChange={(e) => setCoverImage(e.target.value)}
        error={errors.coverImage}
        required
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Body Content</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          style={{
            padding: '0.5rem',
            border: errors.body ? '1px solid #ef4444' : '1px solid #d1d5db',
            borderRadius: '4px',
            minHeight: '300px',
            fontSize: '1rem'
          }}
        />
        {errors.body && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.body}</span>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as PostStatus)}
          style={{
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '1rem'
          }}
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="PRIVATE">Private</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      <Input
        id="externalLink"
        label="External Link (optional)"
        type="url"
        value={externalLink}
        onChange={(e) => setExternalLink(e.target.value)}
        placeholder="https://..."
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Lessons Learned (optional)</label>
        <textarea
          value={lessonsLearned}
          onChange={(e) => setLessonsLearned(e.target.value)}
          style={{
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            minHeight: '100px',
            fontSize: '1rem'
          }}
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Post'}
      </Button>
    </form>
  );
}