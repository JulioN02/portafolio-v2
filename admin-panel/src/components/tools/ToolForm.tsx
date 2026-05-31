import { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { Input, Textarea, Checkbox } from '@jsoft/shared';
import { Button } from '@jsoft/shared';
import type { ToolInput } from '@jsoft/shared';

interface ToolFormProps {
  initialData?: Partial<ToolInput>;
  onSubmit: (data: ToolInput) => void;
  isLoading?: boolean;
}

export function ToolForm({ initialData, onSubmit, isLoading }: ToolFormProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [classification, setClassification] = useState(initialData?.classification || '');
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [fullDescription, setFullDescription] = useState(initialData?.fullDescription || '');
  const [requiresInstall, setRequiresInstall] = useState(initialData?.requiresInstall || false);
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [status, setStatus] = useState<string>(initialData?.status || 'DRAFT');
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
        featured,
        status: status as 'DRAFT' | 'PUBLISHED' | 'PRIVATE' | 'ARCHIVED',
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
      <Textarea
        id="shortDescription"
        label="Short Description"
        value={shortDescription}
        onChange={(e) => setShortDescription(e.target.value)}
        error={errors.shortDescription}
        required
      />
      <Textarea
        id="fullDescription"
        label="Full Description"
        value={fullDescription}
        onChange={(e) => setFullDescription(e.target.value)}
        error={errors.fullDescription}
        required
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>{t('blog.status')}</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #d1d5db',
            fontSize: '0.875rem',
          }}
        >
          <option value="DRAFT">{t('blog.draft')}</option>
          <option value="PUBLISHED">{t('blog.published')}</option>
          <option value="PRIVATE">{t('blog.private')}</option>
          <option value="ARCHIVED">{t('blog.archived')}</option>
        </select>
      </div>
      <Checkbox
        id="requiresInstall"
        label="Requires Install"
        checked={requiresInstall}
        onChange={(e) => setRequiresInstall(e.target.checked)}
      />
      <Checkbox
        id="featured"
        label={t('tools.featured')}
        checked={featured}
        onChange={(e) => setFeatured(e.target.checked)}
      />
      <Textarea
        id="technicalExplanation"
        label="Technical Explanation (optional)"
        value={technicalExplanation}
        onChange={(e) => setTechnicalExplanation(e.target.value)}
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? t('tools.saving') : t('tools.save')}
      </Button>
    </form>
  );
}
