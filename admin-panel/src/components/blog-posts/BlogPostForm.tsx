import { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { Select, Button } from '@jsoft/shared';
import type { BlogPostInput, PostStatus } from '@jsoft/shared';
import { TipTapEditor } from './TipTapEditor';
import { getTextFromHTML } from '../../utils/getTextFromHTML';
import formStyles from '../../styles/form.module.css';

interface BlogPostFormProps {
  initialData?: Partial<BlogPostInput>;
  onSubmit: (data: BlogPostInput) => void;
  isLoading?: boolean;
}

export function BlogPostForm({ initialData, onSubmit, isLoading }: BlogPostFormProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [body, setBody] = useState(initialData?.body || '');
  const [status, setStatus] = useState<PostStatus>(initialData?.status || 'DRAFT');
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [externalLink, setExternalLink] = useState(initialData?.externalLink || '');
  const [lessonsLearned, setLessonsLearned] = useState(initialData?.lessonsLearned || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title || title.length < 3) newErrors.title = t('validation.titleMin');
    if (!slug || slug.length < 3) newErrors.slug = t('validation.slugMin');
    if (!category) {
      newErrors.category = t('validation.categoryRequired');
    } else if (category.length < 2) {
      newErrors.category = t('validation.categoryMin');
    }
    if (!shortDescription || shortDescription.length < 10) newErrors.shortDescription = t('validation.shortDescriptionMin');
    if (!coverImage) newErrors.coverImage = t('validation.coverImageRequired');
    const textContent = getTextFromHTML(body);
    if (!body || textContent.length < 100) newErrors.body = t('validation.bodyMin');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateSlug = () => {
    const slugified = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setSlug(slugified);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        title,
        slug,
        shortDescription,
        body,
        status,
        coverImage,
        category,
        externalLink: externalLink || undefined,
        lessonsLearned: lessonsLearned || undefined,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ════════════════════════════════════════════ */}
      {/* Section 1 — Basic Information               */}
      {/* ════════════════════════════════════════════ */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>{t('blog.basicInfo')}</legend>

        {/* Title + Generate Slug button */}
        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel} htmlFor="title">{t('form.title')}</label>
          <div className={formStyles.inputActionGroup}>
            <input
              id="title"
              className={`${formStyles.formInput} ${errors.title ? formStyles.inputError : ''}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <button
              type="button"
              className={formStyles.btnAction}
              onClick={generateSlug}
            >
              {t('form.generateSlug')}
            </button>
          </div>
          {errors.title && <span className={formStyles.formError}>{errors.title}</span>}
        </div>

        {/* Slug + Category */}
        <div className={formStyles.gridTwoCols}>
          <div className={formStyles.formGroup}>
            <label className={formStyles.formLabel} htmlFor="slug">{t('form.slug')}</label>
            <input
              id="slug"
              className={`${formStyles.formInput} ${errors.slug ? formStyles.inputError : ''}`}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
            {errors.slug && <span className={formStyles.formError}>{errors.slug}</span>}
          </div>
          <div className={formStyles.formGroup}>
            <label className={formStyles.formLabel} htmlFor="category">{t('blog.category')}</label>
            <input
              id="category"
              className={`${formStyles.formInput} ${errors.category ? formStyles.inputError : ''}`}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
            {errors.category && <span className={formStyles.formError}>{errors.category}</span>}
          </div>
        </div>
      </fieldset>

      {/* ════════════════════════════════════════════ */}
      {/* Section 2 — Content                         */}
      {/* ════════════════════════════════════════════ */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>{t('blog.content')}</legend>

        {/* Short Description */}
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
          <p className={formStyles.hint}>{t('form.shortDescriptionPlaceholder')}</p>
          {errors.shortDescription && <span className={formStyles.formError}>{errors.shortDescription}</span>}
        </div>

        {/* Rich Text Editor */}
        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel}>{t('blog.bodyContent')}</label>
          <TipTapEditor content={body} onChange={setBody} />
          {errors.body && <span className={formStyles.formError}>{errors.body}</span>}
        </div>
      </fieldset>

      {/* ════════════════════════════════════════════ */}
      {/* Section 3 — Cover Image                     */}
      {/* ════════════════════════════════════════════ */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>{t('blog.coverImage')}</legend>

        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel} htmlFor="coverImage">{t('blog.coverImage')}</label>
          <input
            id="coverImage"
            type="url"
            className={`${formStyles.formInput} ${errors.coverImage ? formStyles.inputError : ''}`}
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://..."
            required
          />
          <p className={formStyles.hint}>{t('blog.coverImageHint')}</p>
          {errors.coverImage && <span className={formStyles.formError}>{errors.coverImage}</span>}
        </div>

        {/* Image preview thumbnail when URL is valid */}
        {coverImage && (
          <div style={{ marginTop: '0.75rem' }}>
            <img
              src={coverImage}
              alt={t('blog.coverImage')}
              style={{
                maxWidth: '100%',
                maxHeight: 260,
                borderRadius: 8,
                objectFit: 'cover',
                border: '1px solid var(--color-border)',
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
      </fieldset>

      {/* ════════════════════════════════════════════ */}
      {/* Section 4 — Advanced                        */}
      {/* ════════════════════════════════════════════ */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>{t('blog.advanced')}</legend>

        {/* External Link */}
        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel} htmlFor="externalLink">{t('blog.externalLink')}</label>
          <input
            id="externalLink"
            type="url"
            className={formStyles.formInput}
            value={externalLink}
            onChange={(e) => setExternalLink(e.target.value)}
            placeholder={t('form.externalLinkPlaceholder')}
          />
          <p className={formStyles.hint}>{t('blog.externalLinkHint')}</p>
        </div>

        {/* Lessons Learned */}
        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel} htmlFor="lessonsLearned">{t('blog.lessonsLearned')}</label>
          <textarea
            id="lessonsLearned"
            className={`${formStyles.formInput} ${formStyles.formTextarea}`}
            value={lessonsLearned}
            onChange={(e) => setLessonsLearned(e.target.value)}
            placeholder={t('blog.lessonsLearnedHint')}
          />
          <p className={formStyles.hint}>{t('blog.lessonsLearnedHint')}</p>
        </div>
      </fieldset>

      {/* ════════════════════════════════════════════ */}
      {/* Section 5 — Settings                        */}
      {/* ════════════════════════════════════════════ */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>{t('blog.settings')}</legend>

        <div className={formStyles.formGroup}>
          <Select
            id="status"
            label={t('blog.status')}
            value={status}
            onChange={(e) => setStatus(e.target.value as PostStatus)}
            options={[
              { value: 'DRAFT', label: t('blog.draft') },
              { value: 'PUBLISHED', label: t('blog.published') },
              { value: 'PRIVATE', label: t('blog.private') },
              { value: 'ARCHIVED', label: t('blog.archived') },
            ]}
          />
        </div>
      </fieldset>

      {/* ════════════════════════════════════════════ */}
      {/* Submit Button                               */}
      {/* ════════════════════════════════════════════ */}
      <div className={formStyles.buttonRow}>
        <Button type="submit" className={formStyles.btnPrimary} disabled={isLoading}>
          {isLoading ? t('blog.saving') : t('blog.save')}
        </Button>
      </div>
    </form>
  );
}
