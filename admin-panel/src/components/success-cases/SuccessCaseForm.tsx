import { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { Input, Textarea, Button } from '@jsoft/shared';
import type { SuccessCaseInput } from '@jsoft/shared';

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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Input
        id="title"
        label="Title"
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        error={errors.title}
        required
      />
      <Textarea
        id="description"
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={errors.description}
        required
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Images (optional)</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Input
            id="imageInput"
            placeholder="Enter image URL"
            value={imageInput}
            onChange={(e) => setImageInput(e.target.value)}
            error={errors.images}
          />
          <Button type="button" variant="secondary" size="sm" onClick={addImage}>
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
                  variant="danger"
                  size="sm"
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>{t('blog.status')}</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #d1d5db',
            fontSize: '0.875rem',
          }}
        >
          <option value="DRAFT">{t('blog.draft')}</option>
          <option value="PUBLISHED">{t('blog.published')}</option>
          <option value="PRIVATE">{t('blog.private')}</option>
          <option value="ARCHIVED">{t('blog.archived')}</option>
        </select>
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? t('successCases.saving') : t('successCases.save')}
      </Button>
    </form>
  );
}
