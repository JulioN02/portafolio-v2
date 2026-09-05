import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '../../i18n/LanguageContext';

const mockUseBlogPosts = vi.fn();

vi.mock('../../hooks/useBlogPosts', () => ({
  useBlogPosts: (...args: unknown[]) => mockUseBlogPosts(...args),
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

describe('BlogTeaser (CHC-5 / D4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseBlogPosts.mockReturnValue(okState);
  });

  it('fetches the latest 3 posts via useBlogPosts(1, undefined, 3)', () => {
    renderTeaser();
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

  it('shows a role="status" skeleton while loading', () => {
    mockUseBlogPosts.mockReturnValue(loadingState);
    renderTeaser();

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Últimos artículos' })).toBeInTheDocument();
  });

  it('renders nothing (no layout break) when there are zero published posts', () => {
    mockUseBlogPosts.mockReturnValue({ ...okState, data: emptyPage });
    renderTeaser();

    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders nothing when the request errors (no crash, no placeholder)', () => {
    mockUseBlogPosts.mockReturnValue(errorState);
    renderTeaser();

    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});