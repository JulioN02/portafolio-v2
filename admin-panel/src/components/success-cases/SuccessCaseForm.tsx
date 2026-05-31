import { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { Button } from '@jsoft/shared';
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

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title || title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    if (!description || description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addImage = () => {
    if (imageInput && imageInput.startsWith('http')) {
      setImages([...images, imageInput]);
      setImageInput('');
    } else if (imageInput) {
      setErrors({ ...errors, images: 'Please enter a valid URL' });
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
      {/* Basic Info Section */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>Basic Information</legend>
        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel} htmlFor="title">Title</label>
          <input
            id="title"
            className={`${formStyles.formInput} ${errors.title ? formStyles.inputError : ''}`}
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
          />
          {errors.title && <span className={formStyles.formError}>{errors.title}</span>}
        </div>
      </fieldset>

      {/* Description Section */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>Description</legend>
        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel} htmlFor="description">Description</label>
          <textarea
            id="description"
            className={`${formStyles.formInput} ${formStyles.formTextarea} ${errors.description ? formStyles.inputError : ''}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          {errors.description && <span className={formStyles.formError}>{errors.description}</span>}
        </div>
      </fieldset>

      {/* Images Section */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>Images</legend>
        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel}>Images <span className={formStyles.optional}>(optional)</span></label>
          <div className={formStyles.inputActionGroup}>
            <input
              id="imageInput"
              placeholder="Enter image URL"
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              className={`${formStyles.formInput} ${errors.images ? formStyles.inputError : ''}`}
            />
            <Button type="button" className={formStyles.btnAction} onClick={addImage}>
              Add
            </Button>
          </div>
          {images.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              {images.map((img, index) => (
                <div key={img} style={{ position: 'relative' }}>
                  <img
                    src={img}
                    alt={`Image ${index + 1}`}
                    loading="lazy"
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/80x80?text=Invalid';
                    }}
                  />
                  <Button
                    type="button"
                    className={formStyles.btnAction}
                    onClick={() => removeImage(index)}
                    style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-5px',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      fontSize: '0.75rem',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </fieldset>

      {/* Settings Section */}
      <fieldset className={formStyles.formSection}>
        <legend className={formStyles.sectionTitle}>Settings</legend>
        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel}>{t('blog.status')}</label>
          <select
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

      <div className={formStyles.formActions}>
        <Button type="submit" className={formStyles.btnPrimary} disabled={isLoading}>
          {isLoading ? t('successCases.saving') : t('successCases.save')}
        </Button>
      </div>
    </form>
  );
}
