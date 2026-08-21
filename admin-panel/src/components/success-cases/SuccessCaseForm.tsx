import { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import type { SuccessCaseInput } from '@jsoft/shared';
import { ImageUploader } from '../uploads/ImageUploader';
import formStyles from '../../styles/form.module.css';

interface SuccessCaseFormProps {
  initialData?: Partial<SuccessCaseInput>;
  onSubmit: (data: SuccessCaseInput) => void;
  isLoading?: boolean;
}

export function SuccessCaseForm({ initialData, onSubmit, isLoading }: SuccessCaseFormProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [status, setStatus] = useState<string>(initialData?.status || 'DRAFT');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper to generate slug from title
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const slug = initialData?.slug || generateSlug(title);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title || title.length < 3) {
      newErrors.title = t('validation.titleMin');
    }
    if (!description || description.length < 10) {
      newErrors.description = t('validation.shortDescriptionMin');
    }
    if (images.length === 0) newErrors.images = t('validation.imageRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImagesChange = (value: string | string[]): void => {
    setImages(Array.isArray(value) ? value : value ? [value] : []);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        title,
        slug: initialData?.slug || generateSlug(title),
        description,
        images,
        status: status as 'DRAFT' | 'PUBLISHED' | 'PRIVATE' | 'ARCHIVED',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Section 1: Basic Information */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>{t('successCases.basicInfo')}</legend>
        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel} htmlFor="title">
            {t('form.title')}
          </label>
          <input
            id="title"
            className={`${formStyles.formInput} ${errors.title ? formStyles.inputError : ''}`}
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
          />
          {errors.title && <span className={formStyles.formError}>{errors.title}</span>}
          {slug && (
            <p className={formStyles.hint}>
              {t('form.slug')}: {slug}
            </p>
          )}
        </div>
      </fieldset>

      {/* Section 2: Description */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>{t('successCases.description')}</legend>
        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel} htmlFor="description">
            {t('successCases.description')}
          </label>
          <textarea
            id="description"
            className={`${formStyles.formInput} ${formStyles.formTextarea} ${errors.description ? formStyles.inputError : ''}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('successCases.descriptionPlaceholder')}
            required
          />
          {errors.description && <span className={formStyles.formError}>{errors.description}</span>}
        </div>
      </fieldset>

      {/* Section 3: Images */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>{t('successCases.images')}</legend>
        <div className={formStyles.formGroup}>
          <ImageUploader
            id="successCaseImages"
            value={images}
            onChange={handleImagesChange}
            multiple
            label={t('successCases.images')}
            error={errors.images}
          />
        </div>
      </fieldset>

      {/* Section 4: Settings */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>{t('successCases.settings')}</legend>
        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel} htmlFor="status">
            {t('form.status')}
          </label>
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

      {/* Submit */}
      <div className={formStyles.buttonRow}>
        <button type="submit" className={formStyles.btnPrimary} disabled={isLoading}>
          {isLoading ? t('form.saving') : t('successCases.save')}
        </button>
      </div>
    </form>
  );
}
