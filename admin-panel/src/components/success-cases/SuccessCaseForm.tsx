import { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { successCaseSchema } from '@jsoft/shared';
import type { SuccessCaseInput } from '@jsoft/shared';
import { ImageUploader } from '../uploads/ImageUploader';
import formStyles from '../../styles/form.module.css';

interface SuccessCaseFormProps {
  initialData?: Partial<SuccessCaseInput>;
  onSubmit: (data: SuccessCaseInput) => void;
  isLoading?: boolean;
}

interface UrlListInputProps {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
}

/** Dynamic list of URL strings with add/remove controls. */
function UrlListInput({ label, placeholder, values, onChange }: UrlListInputProps) {
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
          type="url"
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
      {values.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0 0', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {values.map((value) => (
            <li key={value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <a href={value} target="_blank" rel="noreferrer" style={{ flex: 1, color: 'var(--color-primary, #2563eb)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {value}
              </a>
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

export function SuccessCaseForm({ initialData, onSubmit, isLoading }: SuccessCaseFormProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [videos, setVideos] = useState<string[]>(initialData?.videos || []);
  const [links, setLinks] = useState<string[]>(initialData?.links || []);
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
      const payload: SuccessCaseInput = {
        title,
        slug: initialData?.slug || generateSlug(title),
        description,
        images,
        videos: videos.length > 0 ? videos : undefined,
        links: links.length > 0 ? links : undefined,
        status: status as 'DRAFT' | 'PUBLISHED' | 'PRIVATE' | 'ARCHIVED',
      };

      // Final gate: same Zod schema as the API (see BlogPostForm).
      const parsed = successCaseSchema.safeParse(payload);
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

      {/* Section 4: Videos & Links */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>{t('successCases.videosAndLinks')}</legend>
        <UrlListInput
          label={t('successCases.videos')}
          placeholder="https://www.youtube.com/watch?v=..."
          values={videos}
          onChange={setVideos}
        />
        <UrlListInput
          label={t('successCases.links')}
          placeholder="https://..."
          values={links}
          onChange={setLinks}
        />
      </fieldset>

      {/* Section 5: Settings */}
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