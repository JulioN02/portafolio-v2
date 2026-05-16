import { useState } from 'react';
import { Input } from '@jsoft/shared';
import { Button } from '@jsoft/shared';
import type { SuccessCaseInput } from '@jsoft/shared';

interface SuccessCaseFormProps {
  initialData?: Partial<SuccessCaseInput>;
  onSubmit: (data: SuccessCaseInput) => void;
  isLoading?: boolean;
}

export function SuccessCaseForm({ initialData, onSubmit, isLoading }: SuccessCaseFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [clientName, setClientName] = useState((initialData as Record<string, unknown>)?.clientName as string || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [classification, setClassification] = useState((initialData as Record<string, unknown>)?.classification as string || '');
  const [link, setLink] = useState((initialData as Record<string, unknown>)?.link as string || '');
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [imageInput, setImageInput] = useState('');
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
    if (!clientName || clientName.length < 1) {
      newErrors.clientName = 'Client name is required';
    }
    if (!description || description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    if (!classification || classification.length < 2) {
      newErrors.classification = 'Classification must be at least 2 characters';
    }
    if (link && !isValidUrl(link)) {
      newErrors.link = 'Please enter a valid URL';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const addImage = () => {
    if (imageInput && isValidUrl(imageInput)) {
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
        ...(initialData as Record<string, unknown>),
        clientName,
        classification,
        link: link || undefined,
      } as SuccessCaseInput);
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
      <Input
        id="clientName"
        label="Client Name"
        value={clientName}
        onChange={(e) => setClientName(e.target.value)}
        error={errors.clientName}
        required
      />
      <Input
        id="classification"
        label="Classification"
        value={classification}
        onChange={(e) => setClassification(e.target.value)}
        error={errors.classification}
        required
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <label htmlFor="description" style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            padding: '0.5rem',
            border: errors.description ? '1px solid #ef4444' : '1px solid #d1d5db',
            borderRadius: '4px',
            minHeight: '120px',
            fontSize: '1rem'
          }}
        />
        {errors.description && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.description}</span>}
      </div>
      <Input
        id="link"
        label="Link (optional)"
        type="url"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        error={errors.link}
        placeholder="https://example.com"
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
          <button
            type="button"
            onClick={addImage}
            style={{
              padding: '0.5rem 1rem',
              background: '#4b5563',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Add
          </button>
        </div>
        {images.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
            {images.map((img, index) => (
              <div key={index} style={{ position: 'relative' }}>
                <img
                  src={img}
                  alt={`Image ${index + 1}`}
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/80x80?text=Invalid';
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    background: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                    fontSize: '0.75rem'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save'}
      </Button>
    </form>
  );
}