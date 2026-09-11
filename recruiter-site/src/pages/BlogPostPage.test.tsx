import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { PROFILE } from '@jsoft/shared';
import { LanguageProvider } from '../i18n/LanguageContext';

const mockUseBlogPostBySlug = vi.fn();

vi.mock('../hooks/useBlogPosts', () => ({
  useBlogPostBySlug: (slug: string) => mockUseBlogPostBySlug(slug),
}));

vi.mock('../components/blog/BlogPostContent', () => ({
  BlogPostContent: () => null,
}));

import { BlogPostPage } from './BlogPostPage';

function renderPage() {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/blog/mi-post']}>
        <LanguageProvider>
          <Routes>
            <Route path="/blog/:slug" element={<BlogPostPage />} />
          </Routes>
        </LanguageProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('BlogPostPage canonical title (seo)', () => {
  beforeEach(() => {
    mockUseBlogPostBySlug.mockReturnValue({
      data: { title: 'Mi Post', shortDescription: 'desc', publishedAt: '2026-01-01' },
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it('uses the canonical PROFILE.fullName in the document title', async () => {
    renderPage();
    await waitFor(() =>
      expect(document.title).toBe(`Mi Post | ${PROFILE.fullName}`),
    );
  });
});
