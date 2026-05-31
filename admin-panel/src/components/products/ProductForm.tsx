import { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { Button } from '@jsoft/shared';
import type { ProductInput } from '@jsoft/shared';
import formStyles from '../../styles/form.module.css';

// Helper to generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

interface ProductFormProps {
  initialData?: Partial<ProductInput>;
  onSubmit: (data: ProductInput) => void;
  isLoading?: boolean;
}

export function ProductForm({ initialData, onSubmit, isLoading }: ProductFormProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [classification, setClassification] = useState(initialData?.classification || '');
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [fullDescription, setFullDescription] = useState(initialData?.fullDescription || '');
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [externalLink, setExternalLink] = useState(initialData?.externalLink || '');
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [status, setStatus] = useState<string>(initialData?.status || 'DRAFT');
  const [technicalExplanation, setTechnicalExplanation] = useState(initialData?.technicalExplanation || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    // Auto-generate slug if user hasn't manually edited it
    if (!initialData?.slug || slug === generateSlug(initialData.title || '')) {
      setSlug(generateSlug(newTitle));
    }
  };

  const handleAddImage = () => {
    if (newImageUrl && newImageUrl.startsWith('http')) {
      setImages([...images, newImageUrl]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title || title.length < 3) newErrors.title = 'Title must be at least 3 characters';
    if (!slug || slug.length < 3) newErrors.slug = 'Slug must be at least 3 characters';
    if (!classification || classification.length < 2) newErrors.classification = 'Classification must be at least 2 characters';
    if (!shortDescription || shortDescription.length < 10) newErrors.shortDescription = 'Short description must be at least 10 characters';
    if (!fullDescription || fullDescription.length < 50) newErrors.fullDescription = 'Full description must be at least 50 characters';
    if (images.length === 0) newErrors.images = 'At least one image is required';
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
        images,
        status: status as 'DRAFT' | 'PUBLISHED' | 'PRIVATE' | 'ARCHIVED',
        externalLink: externalLink || undefined,
        featured,
        technicalExplanation: technicalExplanation || undefined,
        technicalImages: initialData?.technicalImages,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Basic Info Section */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>Basic Information</legend>
        <div className={formStyles.gridTwoCols}>
          <div className={formStyles.formGroup}>
            <label className={formStyles.formLabel} htmlFor="title">Title</label>
            <input
              id="title"
              className={`${formStyles.formInput} ${errors.title ? formStyles.inputError : ''}`}
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />
            {errors.title && <span className={formStyles.formError}>{errors.title}</span>}
          </div>
          <div className={formStyles.formGroup}>
            <label className={formStyles.formLabel} htmlFor="slug">Slug</label>
            <input
              id="slug"
              className={`${formStyles.formInput} ${errors.slug ? formStyles.inputError : ''}`}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
            {errors.slug && <span className={formStyles.formError}>{errors.slug}</span>}
          </div>
        </div>
        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel} htmlFor="classification">Classification</label>
          <input
            id="classification"
            className={`${formStyles.formInput} ${errors.classification ? formStyles.inputError : ''}`}
            value={classification}
            onChange={(e) => setClassification(e.target.value)}
            required
          />
          {errors.classification && <span className={formStyles.formError}>{errors.classification}</span>}
        </div>
      </fieldset>

      {/* Description Section */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>Description</legend>
        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel} htmlFor="shortDescription">Short Description</label>
          <textarea
            id="shortDescription"
            className={`${formStyles.formInput} ${formStyles.formTextarea} ${errors.shortDescription ? formStyles.inputError : ''}`}
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            required
          />
          {errors.shortDescription && <span className={formStyles.formError}>{errors.shortDescription}</span>}
        </div>
        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel} htmlFor="fullDescription">Full Description</label>
          <textarea
            id="fullDescription"
            className={`${formStyles.formInput} ${formStyles.formTextarea} ${errors.fullDescription ? formStyles.inputError : ''}`}
            value={fullDescription}
            onChange={(e) => setFullDescription(e.target.value)}
            required
            style={{ minHeight: '200px' }}
          />
          {errors.fullDescription && <span className={formStyles.formError}>{errors.fullDescription}</span>}
        </div>
      </fieldset>

      {/* Images Section */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>Images</legend>
        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel}>{t('products.images')} <span className={formStyles.optional}>(at least one required)</span></label>
          <div className={formStyles.inputActionGroup}>
            <input
              id="newImageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className={`${formStyles.formInput} ${errors.images ? formStyles.inputError : ''}`}
            />
            <Button type="button" className={formStyles.btnAction} onClick={handleAddImage}>Add</Button>
          </div>
          {errors.images && <span className={formStyles.formError}>{errors.images}</span>}
          {images.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0 0 0' }}>
              {images.map((url, index) => (
                <li key={url} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0' }}>
                  <img src={url} alt={`Image ${index + 1}`} loading="lazy" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }} />
                  <span style={{ flex: 1, fontSize: '0.75rem', wordBreak: 'break-all' }}>{url}</span>
                  <Button type="button" className={formStyles.btnAction} onClick={() => handleRemoveImage(index)}>Remove</Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </fieldset>

      {/* Settings Section */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>Settings</legend>
        <div className={formStyles.gridTwoCols}>
          <div className={formStyles.formGroup}>
            <label className={formStyles.formLabel}>{t('blog.status')}</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={formStyles.formInput}
            >
              <option value="DRAFT">{t('blog.draft')}</option>
              <option value="PUBLISHED">{t('blog.published')}</option>
              <option value="PRIVATE">{t('blog.private')}</option>
              <option value="ARCHIVED">{t('blog.archived')}</option>
            </select>
          </div>
          <div className={formStyles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" id="featured" checked={featured} onChange={(e) => setFeatured(e.target.checked)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
            <label className={formStyles.formLabel} htmlFor="featured" style={{ margin: 0, cursor: 'pointer' }}>Featured</label>
          </div>
        </div>
        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel} htmlFor="externalLink">External Link (optional)</label>
          <input
            id="externalLink"
            type="url"
            className={formStyles.formInput}
            value={externalLink}
            onChange={(e) => setExternalLink(e.target.value)}
          />
        </div>
        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel} htmlFor="technicalExplanation">Technical Explanation (optional)</label>
          <textarea
            id="technicalExplanation"
            className={`${formStyles.formInput} ${formStyles.formTextarea}`}
            value={technicalExplanation}
            onChange={(e) => setTechnicalExplanation(e.target.value)}
          />
        </div>
      </fieldset>

      <div className={formStyles.formActions}>
        <Button type="submit" className={formStyles.btnPrimary} disabled={isLoading}>
          {isLoading ? t('products.saving') : t('products.save')}
        </Button>
      </div>
    </form>
  );
}
