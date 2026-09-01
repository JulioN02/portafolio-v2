import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { BlogPostResponse } from '@jsoft/shared';
import { BlogPostContent } from './BlogPostContent';

function makePost(overrides: Partial<BlogPostResponse> = {}): BlogPostResponse {
  return {
    id: 'post-1',
    title: 'Publicación de prueba',
    slug: 'publicacion-de-prueba',
    category: 'Tutorial',
    shortDescription: 'Descripción corta de la publicación de prueba',
    coverImage: 'https://example.com/cover.png',
    body: '<p>Contenido seguro del cuerpo</p>',
    status: 'PUBLISHED',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    publishedAt: new Date('2024-01-01T00:00:00Z'),
    deletedAt: null,
    ...overrides,
  };
}

describe('BlogPostContent (sanitization adoption)', () => {
  it('renders the body through sanitizeHtml: strips scripts and preserves inline media', async () => {
    const post = makePost({
      body: '<script>alert("xss")</script><figure><img src="/uploads/x.png" alt="diagrama"></figure><p>Contenido seguro del cuerpo</p>',
    });

    const { container } = render(<BlogPostContent post={post} />);

    // Body is injected via innerHTML after the effect runs — wait for the safe text.
    expect(await screen.findByText('Contenido seguro del cuerpo')).toBeInTheDocument();
    // Script stripped by the media allowlist.
    expect(container.querySelector('script')).toBeNull();
    // Inline media node preserved.
    const img = container.querySelector('figure img');
    expect(img).toHaveAttribute('src', '/uploads/x.png');
    expect(img).toHaveAttribute('alt', 'diagrama');
  });

  it('sanitizes lessonsLearned the same way when present', async () => {
    const post = makePost({
      lessonsLearned: '<script>alert(1)</script><p>Lección segura</p>',
    });

    const { container } = render(<BlogPostContent post={post} />);

    expect(await screen.findByText('Lección segura')).toBeInTheDocument();
    expect(container.querySelector('script')).toBeNull();
  });
});