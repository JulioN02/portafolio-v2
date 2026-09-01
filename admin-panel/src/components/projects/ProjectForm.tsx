import { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { RichTextEditor } from '@jsoft/shared';
import type { ProjectInput } from '@jsoft/shared';
import { ImageUploader } from '../uploads/ImageUploader';
import { TagInput } from '../shared/TagInput';
import { simulatorPickerApi } from '../../api/simulators.api';
import { getTextFromHTML } from '../../utils/getTextFromHTML';
import formStyles from '../../styles/form.module.css';

interface ProjectFormProps {
  initialData?: Partial<ProjectInput>;
  onSubmit: (data: ProjectInput) => void;
  isLoading?: boolean;
}

// Helper to generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

const MAX_TAGS = 10;

export function ProjectForm({ initialData, onSubmit, isLoading }: ProjectFormProps) {
  const { t, lang } = useTranslation();

  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [body, setBody] = useState(initialData?.body || '');
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [repositoryUrl, setRepositoryUrl] = useState(initialData?.repositoryUrl || '');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [status, setStatus] = useState<string>(initialData?.status || 'DRAFT');
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [order, setOrder] = useState(initialData?.order ?? 0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    // Auto-generate slug if the user hasn't manually edited it
    if (!initialData?.slug || slug === generateSlug(initialData.title || '')) {
      setSlug(generateSlug(newTitle));
    }
  };

  const handleImagesChange = (value: string | string[]): void => {
    setImages(Array.isArray(value) ? value : value ? [value] : []);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title || title.length < 3) newErrors.title = t('validation.titleMin');
    if (!slug || slug.length < 3) newErrors.slug = t('validation.slugMin');
    if (!shortDescription || shortDescription.length < 10) newErrors.shortDescription = t('validation.shortDescriptionMin');
    const textContent = getTextFromHTML(body);
    if (!body || textContent.length < 100) newErrors.body = t('validation.bodyMin');
    if (tags.some((tag) => tag.length === 0)) newErrors.tags = t('projects.tagsMin');
    if (tags.length > MAX_TAGS) newErrors.tags = t('projects.tagsMax');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        title,
        slug,
        shortDescription,
        body,
        images,
        repositoryUrl: repositoryUrl || undefined,
        tags,
        status: status as ProjectInput['status'],
        featured,
        order,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Basic Information Section */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>{t('projects.basicInfo')}</legend>
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

        {/* Tags */}
        <div className={formStyles.formGroup}>
          <TagInput
            id="tags"
            value={tags}
            onChange={setTags}
            suggestionsUrl="/projects/tags"
            label={t('projects.tags')}
            placeholder={t('projects.tagsHint')}
            hint={t('projects.tagsHint')}
            error={errors.tags}
          />
        </div>
      </fieldset>

      {/* Description Section */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>{t('projects.description')}</legend>
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
          <label className={formStyles.formLabel}>{t('projects.bodyContent')}</label>
          <RichTextEditor value={body} onChange={setBody} minHeight={400} lang={lang} simulatorApi={simulatorPickerApi} />
          {errors.body && <span className={formStyles.formError}>{errors.body}</span>}
        </div>
      </fieldset>

      {/* Images + Repository */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>{t('form.images')}</legend>
        <div className={formStyles.formGroup}>
          <ImageUploader
            id="projectImages"
            value={images}
            onChange={handleImagesChange}
            multiple
            label={t('form.images')}
            error={errors.images}
          />
        </div>
        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel} htmlFor="repositoryUrl">{t('projects.repositoryUrl')}</label>
          <input
            id="repositoryUrl"
            type="url"
            className={formStyles.formInput}
            value={repositoryUrl}
            onChange={(e) => setRepositoryUrl(e.target.value)}
            placeholder="https://github.com/usuario/proyecto"
          />
          <p className={formStyles.hint}>{t('projects.repositoryUrlHint')}</p>
        </div>
      </fieldset>

      {/* Settings Section */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>{t('projects.settings')}</legend>
        <div className={formStyles.fieldRow}>
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
          <div className={formStyles.formGroup}>
            <label className={formStyles.formLabel} htmlFor="order">{t('projects.order')}</label>
            <input
              id="order"
              type="number"
              min={0}
              className={formStyles.formInput}
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
            />
          </div>
        </div>
        <div className={formStyles.checkboxGroup}>
          <input
            id="featured"
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          <label className={formStyles.checkboxLabel} htmlFor="featured">{t('projects.featured')}</label>
        </div>
      </fieldset>

      <div className={formStyles.buttonRow}>
        <button type="submit" className={formStyles.btnPrimary} disabled={isLoading}>
          {isLoading ? t('projects.saving') : t('projects.save')}
        </button>
      </div>
    </form>
  );
}