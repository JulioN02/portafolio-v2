import { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
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
    if (!title || title.length < 3) newErrors.title = t('validation.titleMin');
    if (!slug || slug.length < 3) newErrors.slug = t('validation.slugMin');
    if (!classification || classification.length < 2) newErrors.classification = t('validation.classificationRequired');
    if (!shortDescription || shortDescription.length < 10) newErrors.shortDescription = t('validation.shortDescriptionMin');
    if (!fullDescription || fullDescription.length < 50) newErrors.fullDescription = t('validation.fullDescriptionMin');
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
      {/* Basic Information Section */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>{t('services.basicInfo')}</legend>
        <div className={formStyles.fieldRow}>
          <div className={formStyles.formGroup}>
            <label className={formStyles.formLabel} htmlFor="title">{t('form.title')}</label>
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
            <label className={formStyles.formLabel} htmlFor="slug">{t('form.slug')}</label>
            <input
              id="slug"
              className={`${formStyles.formInput} ${errors.slug ? formStyles.inputError : ''}`}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
            <p className={formStyles.hint}>{t('form.slugHint')}</p>
            {errors.slug && <span className={formStyles.formError}>{errors.slug}</span>}
          </div>
        </div>
        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel} htmlFor="classification">{t('form.classification')}</label>
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
        <legend className={formStyles.sectionTitle}>{t('services.description')}</legend>
        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel} htmlFor="shortDescription">{t('form.shortDescription')}</label>
          <textarea
            id="shortDescription"
            className={`${formStyles.formInput} ${formStyles.formTextarea} ${errors.shortDescription ? formStyles.inputError : ''}`}
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder={t('form.shortDescriptionPlaceholder')}
            required
          />
          {errors.shortDescription && <span className={formStyles.formError}>{errors.shortDescription}</span>}
        </div>
        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel} htmlFor="fullDescription">{t('form.fullDescription')}</label>
          <textarea
            id="fullDescription"
            className={`${formStyles.formInput} ${formStyles.formTextarea} ${errors.fullDescription ? formStyles.inputError : ''}`}
            value={fullDescription}
            onChange={(e) => setFullDescription(e.target.value)}
            placeholder={t('form.fullDescriptionPlaceholder')}
            required
            style={{ minHeight: '200px' }}
          />
          {errors.fullDescription && <span className={formStyles.formError}>{errors.fullDescription}</span>}
        </div>
      </fieldset>

      {/* Settings Section */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>{t('services.settings')}</legend>
        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel} htmlFor="status">{t('form.status')}</label>
          <select
            id="status"
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

      <div className={formStyles.buttonRow}>
        <button type="submit" className={formStyles.btnPrimary} disabled={isLoading}>
          {isLoading ? t('form.saving') : t('services.save')}
        </button>
      </div>
    </form>
  );
}
