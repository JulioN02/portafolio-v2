import { useState } from 'react';
import { Input } from '@jsoft/shared';
import { Button } from '@jsoft/shared';
import { ToolInput } from '@jsoft/shared';

interface ToolFormProps {
  initialData?: Partial<ToolInput>;
  onSubmit: (data: ToolInput) => void;
  isLoading?: boolean;
}

export function ToolForm({ initialData, onSubmit, isLoading }: ToolFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [classification, setClassification] = useState(initialData?.classification || '');
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [fullDescription, setFullDescription] = useState(initialData?.fullDescription || '');
  const [requiresInstall, setRequiresInstall] = useState(initialData?.requiresInstall || false);
  const [order, setOrder] = useState(initialData?.order?.toString() || '0');
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [technicalExplanation, setTechnicalExplanation] = useState(initialData?.technicalExplanation || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper to generate slug from title
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    // Auto-generate slug if user hasn't manually edited it
    if (!initialData?.slug || slug === generateSlug(initialData.title || '')) {
      setSlug(generateSlug(newTitle));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title || title.length < 3) newErrors.title = 'Title must be at least 3 characters';
    if (!slug || slug.length < 3) newErrors.slug = 'Slug must be at least 3 characters';
    if (!classification || classification.length < 2) newErrors.classification = 'Classification must be at least 2 characters';
    if (!shortDescription || shortDescription.length < 10) newErrors.shortDescription = 'Short description must be at least 10 characters';
    if (!fullDescription || fullDescription.length < 50) newErrors.fullDescription = 'Full description must be at least 50 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        title,
        slug,
        classification,
        shortDescription,
        fullDescription,
        images: initialData?.images || [],
        requiresInstall,
        order: parseInt(order, 10) || 0,
        featured,
        technicalExplanation: technicalExplanation || undefined,
        technicalImages: initialData?.technicalImages,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Input
        id="title"
        label="Title"
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        error={errors.title}
        required
      />
      <Input
        id="slug"
        label="Slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        error={errors.slug}
        required
      />
      <Input
        id="classification"
        label="Classification"
        value={classification}
        onChange={(e) => setClassification(e.target.value)}
        error={errors.classification}
        required
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <label htmlFor="shortDescription" style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Short Description</label>
        <textarea
          id="shortDescription"
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <label htmlFor="fullDescription" style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Full Description</label>
        <textarea
          id="fullDescription"
          value={fullDescription}
          onChange={(e) => setFullDescription(e.target.value)}
          style={{
            padding: '0.5rem',
            border: errors.fullDescription ? '1px solid #ef4444' : '1px solid #d1d5db',
            borderRadius: '4px',
            minHeight: '120px',
            fontSize: '1rem'
          }}
        />
        {errors.fullDescription && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.fullDescription}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input
          type="checkbox"
          checked={requiresInstall}
          onChange={(e) => setRequiresInstall(e.target.checked)}
          id="requiresInstall"
        />
        <label htmlFor="requiresInstall" style={{ fontSize: '0.875rem' }}>Requires Install</label>
      </div>
      <Input
        id="order"
        label="Order"
        type="number"
        value={order}
        onChange={(e) => setOrder(e.target.value)}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          id="featured"
        />
        <label htmlFor="featured" style={{ fontSize: '0.875rem' }}>Featured</label>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <label htmlFor="technicalExplanation" style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Technical Explanation (optional)</label>
        <textarea
          id="technicalExplanation"
          value={technicalExplanation}
          onChange={(e) => setTechnicalExplanation(e.target.value)}
          style={{
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            minHeight: '120px',
            fontSize: '1rem'
          }}
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save'}
      </Button>
    </form>
  );
}