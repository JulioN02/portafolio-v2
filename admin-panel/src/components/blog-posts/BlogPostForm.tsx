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
    if (!title || title.length < 3) newErrors.title = 'Title must be at least 3 characters';
    if (!slug || slug.length < 3) newErrors.slug = 'Slug must be at least 3 characters';
    if (!category || category.length < 2) newErrors.category = 'Category must be at least 2 characters';
    if (!shortDescription || shortDescription.length < 10) newErrors.shortDescription = 'Short description must be at least 10 characters';
    if (!coverImage) newErrors.coverImage = 'Cover image URL is required';
    const textContent = getTextFromHTML(body);
    if (!body || textContent.length < 100) newErrors.body = 'Body must be at least 100 characters (plain text)';
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
      {/* Basic Info Section */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>Basic Information</legend>
        <div className={formStyles.formGroup}>
          <div className={formStyles.inputActionGroup}>
            <div style={{ flex: 1 }}>
              <div className={formStyles.formGroup}>
                <label className={formStyles.formLabel} htmlFor="title">Title</label>
                <input
                  id="title"
                  className={`${formStyles.formInput} ${errors.title ? formStyles.inputError : ''}`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                {errors.title && <span className={formStyles.formError}>{errors.title}</span>}
              </div>
            </div>
            <Button
              type="button"
              className={formStyles.btnAction}
              onClick={generateSlug}
            >
              Generate Slug
            </Button>
          </div>
        </div>
        <div className={formStyles.gridTwoCols}>
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
          <div className={formStyles.formGroup}>
            <label className={formStyles.formLabel} htmlFor="category">Category</label>
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

      {/* Content Section */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>Content</legend>
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
          <label className={formStyles.formLabel}>Body Content (TipTap Rich Text Editor)</label>
          <TipTapEditor
            content={body}
            onChange={setBody}
          />
          {errors.body && <span className={formStyles.formError}>{errors.body}</span>}
        </div>
      </fieldset>

      {/* Cover Image Section */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>Cover Image</legend>
        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel} htmlFor="coverImage">Cover Image URL</label>
          <input
            id="coverImage"
            type="url"
            className={`${formStyles.formInput} ${errors.coverImage ? formStyles.inputError : ''}`}
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            required
          />
          {errors.coverImage && <span className={formStyles.formError}>{errors.coverImage}</span>}
        </div>
      </fieldset>

      {/* Settings Section */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>Settings</legend>
        <div className={formStyles.gridTwoCols}>
          <div className={formStyles.formGroup}>
            <Select
              id="status"
              label="Status"
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
          <div className={formStyles.formGroup}>
            <label className={formStyles.formLabel} htmlFor="externalLink">External Link (optional)</label>
            <input
              id="externalLink"
              type="url"
              className={formStyles.formInput}
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>
        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel} htmlFor="lessonsLearned">Lessons Learned (optional)</label>
          <textarea
            id="lessonsLearned"
            className={`${formStyles.formInput} ${formStyles.formTextarea}`}
            value={lessonsLearned}
            onChange={(e) => setLessonsLearned(e.target.value)}
          />
        </div>
      </fieldset>

      <div className={formStyles.formActions}>
        <Button type="submit" className={formStyles.btnPrimary} disabled={isLoading}>
          {isLoading ? t('blog.saving') : t('blog.save')}
        </Button>
      </div>
    </form>
  );
}
