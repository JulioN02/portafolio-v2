import { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { RichTextEditor, serviceSchema } from '@jsoft/shared';
import type { ServiceInput } from '@jsoft/shared';
import { getTextFromHTML } from '../../utils/getTextFromHTML';
import { ImageUploader } from '../uploads/ImageUploader';
import formStyles from '../../styles/form.module.css';

interface ServiceFormProps {
  initialData?: Partial<ServiceInput>;
  onSubmit: (data: ServiceInput) => void;
  isLoading?: boolean;
}

interface ItemListInputProps {
  label: string;
  placeholder: string;
  hint?: string;
  values: string[];
  onChange: (values: string[]) => void;
  error?: string;
}

/** Dynamic list of plain-text items with add/remove controls. */
function ItemListInput({ label, placeholder, hint, values, onChange, error }: ItemListInputProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');

  const add = () => {
    const value = draft.trim();
    if (!value) return;
    if (!values.includes(value)) onChange([...values, value]);
    setDraft('');
  };

  const remove = (target: string) => {
    onChange(values.filter((value) => value !== target));
  };

  return (
    <div className={formStyles.formGroup}>
      <label className={formStyles.formLabel}>{label}</label>
      <div className={formStyles.inputActionGroup}>
        <input
          className={formStyles.formInput}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
        />
        <button type="button" className={formStyles.btnAction} onClick={add}>
          {t('common.add')}
        </button>
      </div>
      {hint && <p className={formStyles.hint}>{hint}</p>}
      {error && <span className={formStyles.formError}>{error}</span>}
      {values.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0 0', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {values.map((value) => (
            <li key={value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <span style={{ flex: 1 }}>{value}</span>
              <button
                type="button"
                className={formStyles.btnDangerSmall}
                onClick={() => remove(value)}
                aria-label={`${t('form.remove')} ${value}`}
              >
                {t('form.remove')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Helper to generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

export function ServiceForm({ initialData, onSubmit, isLoading }: ServiceFormProps) {
  const { t, lang } = useTranslation();
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [classification, setClassification] = useState(initialData?.classification || '');
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [fullDescription, setFullDescription] = useState(initialData?.fullDescription || '');
  const [status, setStatus] = useState<string>(initialData?.status || 'DRAFT');
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [includedItems, setIncludedItems] = useState<string[]>(initialData?.includedItems || []);
  const [technicalExplanation, setTechnicalExplanation] = useState(initialData?.technicalExplanation || '');
  const [technicalImages, setTechnicalImages] = useState<string[]>(initialData?.technicalImages || []);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    if (!classification || classification.length < 2) newErrors.classification = t('validation.classificationRequired');
    if (getTextFromHTML(shortDescription).length < 10) newErrors.shortDescription = t('validation.shortDescriptionMin');
    if (getTextFromHTML(fullDescription).length < 50) newErrors.fullDescription = t('validation.fullDescriptionMin');
    if (images.length === 0) newErrors.images = t('validation.imageRequired');
    if (includedItems.length === 0) newErrors.includedItems = t('services.includedItemsRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const payload: ServiceInput = {
        title,
        slug,
        classification,
        shortDescription,
        fullDescription,
        includedItems,
        images,
        status: status as ServiceInput['status'],
        technicalExplanation: technicalExplanation || undefined,
        technicalImages,
      };

      // Final gate: same Zod schema as the API (see BlogPostForm).
      const parsed = serviceSchema.safeParse(payload);
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
          <RichTextEditor value={shortDescription} onChange={setShortDescription} minHeight={120} lang={lang} />
          {errors.shortDescription && <span className={formStyles.formError}>{errors.shortDescription}</span>}
        </div>
        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel} htmlFor="fullDescription">{t('form.fullDescription')}</label>
          <RichTextEditor value={fullDescription} onChange={setFullDescription} minHeight={250} lang={lang} />
          {errors.fullDescription && <span className={formStyles.formError}>{errors.fullDescription}</span>}
        </div>
      </fieldset>

      {/* Images Section */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>{t('form.images')}</legend>
        <div className={formStyles.formGroup}>
          <ImageUploader
            id="serviceImages"
            value={images}
            onChange={handleImagesChange}
            multiple
            label={t('form.images')}
            error={errors.images}
          />
        </div>
        <div className={formStyles.formGroup}>
          <ImageUploader
            id="serviceTechnicalImages"
            value={technicalImages}
            onChange={handleTechnicalImagesChange}
            multiple
            label={t('form.technicalImages')}
          />
        </div>
      </fieldset>

      {/* Included Items + Technical Explanation Section */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>{t('services.includedItemsTitle')}</legend>
        <ItemListInput
          label={t('services.includedItems')}
          placeholder={t('services.includedItemsPlaceholder')}
          hint={t('services.includedItemsHint')}
          values={includedItems}
          onChange={setIncludedItems}
          error={errors.includedItems}
        />
        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel} htmlFor="technicalExplanation">
            {t('services.technicalExplanation')}
          </label>
          <textarea
            id="technicalExplanation"
            className={`${formStyles.formInput} ${formStyles.formTextarea}`}
            value={technicalExplanation}
            onChange={(e) => setTechnicalExplanation(e.target.value)}
            placeholder={t('services.technicalExplanationPlaceholder')}
            style={{ minHeight: '140px' }}
          />
          <p className={formStyles.hint}>{t('services.technicalExplanationHint')}</p>
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
