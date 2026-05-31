import { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { Button } from '@jsoft/shared';
import type { ServiceInput } from '@jsoft/shared';
import formStyles from '../../styles/form.module.css';

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
  const [status, setStatus] = useState<string>(initialData?.status || 'DRAFT');
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
        status: status as ServiceInput['status'],
        technicalExplanation: initialData?.technicalExplanation,
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

      {/* Settings Section */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>Settings</legend>
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
      </fieldset>

      <div className={formStyles.formActions}>
        <Button type="submit" className={formStyles.btnPrimary} disabled={isLoading}>
          {isLoading ? t('services.saving') : t('services.save')}
        </Button>
      </div>
    </form>
  );
}
