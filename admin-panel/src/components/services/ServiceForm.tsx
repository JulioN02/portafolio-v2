import { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { Input, Textarea, Checkbox } from '@jsoft/shared';
import { Button } from '@jsoft/shared';
import { ServiceInput } from '@jsoft/shared';

interface ServiceFormProps {
  initialData?: Partial<ServiceInput>;
  onSubmit: (data: ServiceInput) => void;
  isLoading?: boolean;
}

// Helper to generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

export function ServiceForm({ initialData, onSubmit, isLoading }: ServiceFormProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [classification, setClassification] = useState(initialData?.classification || '');
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [fullDescription, setFullDescription] = useState(initialData?.fullDescription || '');
  const [order, setOrder] = useState(initialData?.order?.toString() || '0');
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
        includedItems: initialData?.includedItems || [],
        images: initialData?.images || [],
        order: parseInt(order, 10) || 0,
        featured,
        technicalExplanation: initialData?.technicalExplanation,
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
      <Input
        id="order"
        label="Order"
        type="number"
        value={order}
        onChange={(e) => setOrder(e.target.value)}
      />
      <Checkbox
        id="featured"
        label="Featured"
        checked={featured}
        onChange={(e) => setFeatured(e.target.checked)}
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? t('services.saving') : t('services.save')}
      </Button>
    </form>
  );
}