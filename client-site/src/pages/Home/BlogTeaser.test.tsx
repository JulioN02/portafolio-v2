import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '../../i18n/LanguageContext';

const mockUseBlogPosts = vi.fn();
const mockUseFeaturedBlogPosts = vi.fn();

vi.mock('../../hooks/useBlogPosts', () => ({
  useBlogPosts: (...args: unknown[]) => mockUseBlogPosts(...args),
  useFeaturedBlogPosts: (...args: unknown[]) => mockUseFeaturedBlogPosts(...args),
}));

import { BlogTeaser } from './BlogTeaser';

function renderTeaser() {
  return render(
    <MemoryRouter>
      <LanguageProvider>
        <BlogTeaser />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

function makePost(id: string, title: string, slug: string) {
  return {
    id,
    title,
    slug,
    category: 'desarrollo',
    tags: [],
    shortDescription: `Descripción de ${title}`,
    coverImage: '',
    mediaGallery: [],
    body: '<p>x</p>',
    status: 'PUBLISHED',
    deletedAt: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    publishedAt: new Date('2024-01-01'),
  };
}

const threePosts = {
  data: [
    makePost('p1', 'Post 1', 'post-1'),
    makePost('p2', 'Post 2', 'post-2'),
    makePost('p3', 'Post 3', 'post-3'),
  ],
  pagination: { page: 1, limit: 3, total: 3, totalPages: 1, hasNext: false, hasPrev: false },
};

const emptyPage = { data: [], pagination: { page: 1, limit: 3, total: 0, totalPages: 0, hasNext: false, hasPrev: false } };

const loadingState = { data: undefined, isLoading: true, isError: false, error: null };
const okState = { data: threePosts, isLoading: false, isError: false, error: null };
const errorState = { data: undefined, isLoading: false, isError: true, error: new Error('boom') };
const noFeatured = { data: [], isLoading: false, isError: false, error: null };

describe('BlogTeaser (CHC-5 / D4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseBlogPosts.mockReturnValue(okState);
    mockUseFeaturedBlogPosts.mockReturnValue(noFeatured);
  });

  it('fetches featured posts and the latest 3 posts via useBlogPosts(1, undefined, 3)', () => {
    renderTeaser();
    expect(mockUseFeaturedBlogPosts).toHaveBeenCalledWith(3);
    expect(mockUseBlogPosts).toHaveBeenCalledWith(1, undefined, 3);
  });

  it('renders the title, 3 post cards, and a "view all" link to /blog', () => {
    renderTeaser();

    expect(screen.getByRole('heading', { level: 2, name: 'Últimos artículos' })).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /Post 1/ })).toHaveAttribute('href', '/blog/post-1');
    expect(screen.getByRole('link', { name: /Post 2/ })).toHaveAttribute('href', '/blog/post-2');
    expect(screen.getByRole('link', { name: /Post 3/ })).toHaveAttribute('href', '/blog/post-3');

    expect(screen.getByRole('link', { name: 'Ver todos →' })).toHaveAttribute('href', '/blog');
  });

  it('shows featured posts first and fills the remaining slots with recent posts', () => {
    mockUseFeaturedBlogPosts.mockReturnValue({
      data: [makePost('f1', 'Featured', 'featured')],
      isLoading: false,
      isError: false,
      error: null,
    });
    mockUseBlogPosts.mockReturnValue(okState);

    renderTeaser();

    const links = screen.getAllByRole('link').filter((link) => link.getAttribute('href')?.startsWith('/blog/'));
    expect(links[0]).toHaveAttribute('href', '/blog/featured');
    expect(links).toHaveLength(3);
  });

  it('does not duplicate a featured post that is also recent', () => {
    mockUseFeaturedBlogPosts.mockReturnValue({
      data: [makePost('p1', 'Post 1', 'post-1')],
      isLoading: false,
      isError: false,
      error: null,
    });
    mockUseBlogPosts.mockReturnValue(okState);

    renderTeaser();

    const links = screen.getAllByRole('link').filter((link) => link.getAttribute('href') === '/blog/post-1');
    expect(links).toHaveLength(1);
  });

  it('shows a role="status" skeleton while loading', () => {
    mockUseFeaturedBlogPosts.mockReturnValue(noFeatured);
    mockUseBlogPosts.mockReturnValue(loadingState);
    renderTeaser();

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Últimos artículos' })).toBeInTheDocument();
  });

  it('renders nothing (no layout break) when there are zero published posts', () => {
    mockUseFeaturedBlogPosts.mockReturnValue(noFeatured);
    mockUseBlogPosts.mockReturnValue({ ...okState, data: emptyPage });
    renderTeaser();

    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders nothing when the request errors (no crash, no placeholder)', () => {
    mockUseFeaturedBlogPosts.mockReturnValue(noFeatured);
    mockUseBlogPosts.mockReturnValue(errorState);
    renderTeaser();

    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
