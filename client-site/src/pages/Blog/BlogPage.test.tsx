import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '../../i18n/LanguageContext';

vi.mock('../../components/seo/MetaTags', () => ({
  MetaTags: () => null,
}));

const mockPosts = vi.fn();
const mockCategories = vi.fn();
const mockTags = vi.fn();

vi.mock('../../hooks/useBlogPosts', () => ({
  useBlogPosts: (...args: unknown[]) => mockPosts(...args),
  useBlogCategories: () => mockCategories(),
  useBlogTags: () => mockTags(),
}));

import { BlogPage } from './index';

function renderPage(initialEntries: string[] = ['/blog']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <LanguageProvider>
        <BlogPage />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

const emptyData = { data: [], pagination: { total: 0, totalPages: 0, page: 1, limit: 9 } };

const mockPost = {
  id: 'p1',
  title: 'Simulador de circuitos',
  slug: 'simulador-circuitos',
  category: 'laboratorio',
  tags: ['react'],
  shortDescription: 'Post sobre el simulador',
  coverImage: 'https://example.com/c.jpg',
  mediaGallery: [],
  body: '<p>x</p>',
  status: 'PUBLISHED',
  deletedAt: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  publishedAt: new Date('2024-01-01'),
};

const withPostsData = {
  data: [mockPost],
  pagination: { total: 1, totalPages: 1, page: 1, limit: 9 },
};

describe('BlogPage tag filter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPosts.mockReturnValue({ data: emptyData, isLoading: false, isError: false, error: null, refetch: vi.fn() });
    mockCategories.mockReturnValue({ data: ['laboratorio', 'desarrollo'] });
    mockTags.mockReturnValue({ data: ['react', 'laboratorio'] });
  });

  it('pre-applies filters from URL params (?category=&tag=&search=)', () => {
    mockPosts.mockReturnValue({ data: withPostsData, isLoading: false, isError: false, error: null, refetch: vi.fn() });
    renderPage(['/blog?category=desarrollo&tag=react&search=hooks']);

    // useBlogPosts is called with the URL-derived filters (AND combination).
    expect(mockPosts).toHaveBeenCalledWith(1, {
      category: 'desarrollo',
      tag: 'react',
      search: 'hooks',
    });

    // The tag chips render from /api/blog-posts/tags.
    expect(screen.getByRole('button', { name: 'Todas las etiquetas' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'react' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'laboratorio' })).toBeInTheDocument();
  });

  it('fetches blog posts without filters when no URL params are present', () => {
    renderPage(['/blog']);

    expect(mockPosts).toHaveBeenCalledWith(1, {
      category: undefined,
      tag: undefined,
      search: undefined,
    });
  });

  it('does not call the API with a tag when the URL has none', () => {
    renderPage(['/blog?category=laboratorio']);

    const [, filters] = mockPosts.mock.calls[0];
    expect(filters.tag).toBeUndefined();
    expect(filters.category).toBe('laboratorio');
  });
});