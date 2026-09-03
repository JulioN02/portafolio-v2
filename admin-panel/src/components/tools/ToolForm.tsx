import { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { RichTextEditor, toolSchema } from '@jsoft/shared';
import type { ToolInput } from '@jsoft/shared';
import { ImageUploader } from '../uploads/ImageUploader';
import { getTextFromHTML } from '../../utils/getTextFromHTML';
import { simulatorPickerApi } from '../../api/simulators.api';
import formStyles from '../../styles/form.module.css';

interface ToolFormProps {
  initialData?: Partial<ToolInput>;
  onSubmit: (data: ToolInput) => void;
  isLoading?: boolean;
}

export function ToolForm({ initialData, onSubmit, isLoading }: ToolFormProps) {
  const { t, lang } = useTranslation();
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [classification, setClassification] = useState(initialData?.classification || '');
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [fullDescription, setFullDescription] = useState(initialData?.fullDescription || '');
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [requiresInstall, setRequiresInstall] = useState(initialData?.requiresInstall || false);
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [status, setStatus] = useState<string>(initialData?.status || 'DRAFT');
  const [technicalExplanation, setTechnicalExplanation] = useState(initialData?.technicalExplanation || '');
  const [technicalImages, setTechnicalImages] = useState<string[]>(initialData?.technicalImages || []);
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

  const handleImagesChange = (value: string | string[]): void => {
    setImages(Array.isArray(value) ? value : value ? [value] : []);
  };

  const handleTechnicalImagesChange = (value: string | string[]): void => {
    setTechnicalImages(Array.isArray(value) ? value : value ? [value] : []);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title || title.length < 3) newErrors.title = t('validation.titleMin');
    if (!slug || slug.length < 3) newErrors.slug = t('validation.slugMin');
    if (!classification || classification.length < 2) newErrors.classification = t('validation.classificationMin');
    if (getTextFromHTML(shortDescription).length < 10) newErrors.shortDescription = t('validation.shortDescriptionMin');
    if (getTextFromHTML(fullDescription).length < 50) newErrors.fullDescription = t('validation.fullDescriptionMin');
    if (images.length === 0) newErrors.images = t('validation.imageRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const payload: ToolInput = {
        title,
        slug,
        classification,
        shortDescription,
        fullDescription,
        images,
        requiresInstall,
        featured,
        status: status as 'DRAFT' | 'PUBLISHED' | 'PRIVATE' | 'ARCHIVED',
        technicalExplanation: technicalExplanation || undefined,
        technicalImages,
      };

      // Final gate: same Zod schema as the API (see BlogPostForm).
      const parsed = toolSchema.safeParse(payload);
      if (!parsed.success) {
        const newErrors: Record<string, string> = {};
        for (const issue of parsed.error.issues) {
          const field = String(issue.path[0] ?? '');
          if (!newErrors[field]) newErrors[field] = issue.message;
        }
        setErrors(newErrors);
        return;
      }

      onSubmit(parsed.data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Section 1: Basic Information */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>{t('tools.basicInfo')}</legend>
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

      {/* Section 2: Description */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>{t('tools.description')}</legend>
        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel} htmlFor="shortDescription">{t('form.shortDescription')}</label>
          <RichTextEditor value={shortDescription} onChange={setShortDescription} minHeight={120} lang={lang} />
          {errors.shortDescription && <span className={formStyles.formError}>{errors.shortDescription}</span>}
        </div>
        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel} htmlFor="fullDescription">{t('form.fullDescription')}</label>
          <RichTextEditor value={fullDescription} onChange={setFullDescription} minHeight={250} lang={lang} simulatorApi={simulatorPickerApi} />
          {errors.fullDescription && <span className={formStyles.formError}>{errors.fullDescription}</span>}
        </div>
      </fieldset>

      {/* Section 3: Images */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>{t('products.imagesSection')}</legend>
        <div className={formStyles.formGroup}>
          <ImageUploader
            id="toolImages"
            value={images}
            onChange={handleImagesChange}
            multiple
            label={t('products.imagesSection')}
            error={errors.images}
          />
        </div>
      </fieldset>

      {/* Section 4: Technical Details */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>{t('tools.technicalDetails')}</legend>
        <div className={formStyles.checkboxGroup}>
          <input
            type="checkbox"
            id="requiresInstall"
            checked={requiresInstall}
            onChange={(e) => setRequiresInstall(e.target.checked)}
          />
          <label className={formStyles.checkboxLabel} htmlFor="requiresInstall">
            {t('form.requiresInstall')}
          </label>
        </div>
        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel} htmlFor="technicalExplanation">
            {t('form.technicalExplanation')} <span className={formStyles.optional}>{t('common.optional')}</span>
          </label>
          <textarea
            id="technicalExplanation"
            className={`${formStyles.formInput} ${formStyles.formTextarea}`}
            value={technicalExplanation}
            onChange={(e) => setTechnicalExplanation(e.target.value)}
            placeholder={t('form.technicalExplanationPlaceholder')}
          />
          <p className={formStyles.hint}>{t('form.technicalExplanationHint')}</p>
        </div>
        <div className={formStyles.formGroup}>
          <ImageUploader
            id="toolTechnicalImages"
            value={technicalImages}
            onChange={handleTechnicalImagesChange}
            multiple
            label={t('tools.technicalDetails')}
          />
        </div>
      </fieldset>

      {/* Section 5: Settings */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>{t('tools.settings')}</legend>
        <div className={formStyles.checkboxGroup}>
          <input
            type="checkbox"
            id="featured"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          <label className={formStyles.checkboxLabel} htmlFor="featured">
            {t('form.featured')}
          </label>
        </div>
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
          {isLoading ? t('tools.saving') : t('tools.save')}
        </button>
      </div>
    </form>
  );
}
