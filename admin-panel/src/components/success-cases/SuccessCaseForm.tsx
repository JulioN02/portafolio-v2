import { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import type { SuccessCaseInput } from '@jsoft/shared';
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
  const [imageInput, setImageInput] = useState('');
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addImage = () => {
    if (imageInput && imageInput.startsWith('http')) {
      setImages([...images, imageInput]);
      setImageInput('');
    } else if (imageInput) {
      setErrors({ ...errors, images: t('validation.imageUrl') });
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        title,
        slug: initialData?.slug || generateSlug(title),
        description,
        images: images.length > 0 ? images : ['https://placehold.co/600x400'],
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
          <label className={formStyles.formLabel} htmlFor="imageInput">
            {t('successCases.images')} <span className={formStyles.optional}>({t('form.images')})</span>
          </label>
          <div className={formStyles.inputActionGroup}>
            <input
              id="imageInput"
              className={`${formStyles.formInput} ${errors.images ? formStyles.inputError : ''}`}
              placeholder={t('form.addImagePlaceholder')}
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
            />
            <button
              type="button"
              className={formStyles.btnAction}
              onClick={addImage}
            >
              {t('form.addImage')}
            </button>
          </div>
          {errors.images && <span className={formStyles.formError}>{errors.images}</span>}
          {images.length > 0 && (
            <div className={formStyles.imageGallery}>
              {images.map((img, index) => (
                <div key={img} className={formStyles.imageItem}>
                  <img
                    src={img}
                    alt={`${t('successCases.title')} ${index + 1}`}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Error';
                    }}
                  />
                  <button
                    type="button"
                    className={formStyles.imageRemove}
                    onClick={() => removeImage(index)}
                    title={t('form.remove')}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
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
