import { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
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
    if (!title || title.length < 3) newErrors.title = t('validation.titleMin');
    if (!slug || slug.length < 3) newErrors.slug = t('validation.slugMin');
    if (!classification || classification.length < 2) newErrors.classification = t('validation.classificationMin');
    if (!shortDescription || shortDescription.length < 10) newErrors.shortDescription = t('validation.shortDescriptionMin');
    if (!fullDescription || fullDescription.length < 50) newErrors.fullDescription = t('validation.fullDescriptionMin');
    if (images.length === 0) newErrors.images = t('validation.imageRequired');
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
      {/* Section 1: Basic Information */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>{t('products.basicInfo')}</legend>

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

        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel} htmlFor="shortDescription">{t('form.shortDescription')}</label>
          <textarea
            id="shortDescription"
            className={`${formStyles.formInput} ${formStyles.formTextarea} ${errors.shortDescription ? formStyles.inputError : ''}`}
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            required
            placeholder={t('form.shortDescriptionPlaceholder')}
          />
          {errors.shortDescription && <span className={formStyles.formError}>{errors.shortDescription}</span>}
        </div>
      </fieldset>

      {/* Section 2: Description */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>{t('products.description')}</legend>

        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel} htmlFor="fullDescription">{t('form.fullDescription')}</label>
          <textarea
            id="fullDescription"
            className={`${formStyles.formInput} ${formStyles.formTextarea} ${errors.fullDescription ? formStyles.inputError : ''}`}
            value={fullDescription}
            onChange={(e) => setFullDescription(e.target.value)}
            required
            style={{ minHeight: '200px' }}
            placeholder={t('form.fullDescriptionPlaceholder')}
          />
          {errors.fullDescription && <span className={formStyles.formError}>{errors.fullDescription}</span>}
        </div>

        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel} htmlFor="externalLink">{t('form.externalLink')}</label>
          <input
            id="externalLink"
            type="url"
            className={formStyles.formInput}
            value={externalLink}
            onChange={(e) => setExternalLink(e.target.value)}
            placeholder={t('form.externalLinkPlaceholder')}
          />
          <p className={formStyles.hint}>{t('form.externalLinkHint')}</p>
        </div>
      </fieldset>

      {/* Section 3: Images */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>{t('products.imagesSection')}</legend>

        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel}>
            {t('form.images')} <span className={formStyles.optional}>({t('form.imageRequired')})</span>
          </label>

          <div className={formStyles.inputActionGroup}>
            <input
              id="newImageUrl"
              type="url"
              placeholder={t('form.addImagePlaceholder')}
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className={`${formStyles.formInput} ${errors.images ? formStyles.inputError : ''}`}
            />
            <button type="button" className={formStyles.btnAction} onClick={handleAddImage}>
              {t('form.addImage')}
            </button>
          </div>

          {errors.images && <span className={formStyles.formError}>{errors.images}</span>}

          {images.length > 0 && (
            <div className={formStyles.imageGallery}>
              {images.map((url, index) => (
                <div key={url} className={formStyles.imageItem}>
                  <img src={url} alt={`${t('form.images')} ${index + 1}`} loading="lazy" />
                  <button
                    type="button"
                    className={formStyles.imageRemove}
                    onClick={() => handleRemoveImage(index)}
                    title={t('form.remove')}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </fieldset>

      {/* Section 4: Settings */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>{t('products.settings')}</legend>

        <div className={formStyles.gridTwoCols}>
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
          <div className={formStyles.checkboxGroup}>
            <input
              type="checkbox"
              id="featured"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />
            <label className={formStyles.checkboxLabel} htmlFor="featured">{t('form.featured')}</label>
          </div>
        </div>

        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel} htmlFor="technicalExplanation">{t('form.technicalExplanation')}</label>
          <textarea
            id="technicalExplanation"
            className={`${formStyles.formInput} ${formStyles.formTextarea}`}
            value={technicalExplanation}
            onChange={(e) => setTechnicalExplanation(e.target.value)}
            placeholder={t('form.technicalExplanationPlaceholder')}
          />
          <p className={formStyles.hint}>{t('form.technicalExplanationHint')}</p>
        </div>
      </fieldset>

      <div className={formStyles.buttonRow}>
        <button type="submit" className={formStyles.btnPrimary} disabled={isLoading}>
          {isLoading ? t('form.saving') : t('form.save')}
        </button>
      </div>
    </form>
  );
}
