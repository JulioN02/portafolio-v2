import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { LanguageProvider } from '../../i18n/LanguageContext';

const mockSlug = 'mi-proyecto';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ slug: mockSlug }),
  Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
}));

const mockQuery = vi.fn();

vi.mock('../../hooks/useProjects', () => ({
  useProjectBySlug: (slug: string) => mockQuery(slug),
}));

vi.mock('../../components/common/Loading', () => ({
  Loading: () => <div>loading...</div>,
}));

vi.mock('../../components/seo/MetaTags', () => ({
  MetaTags: () => null,
}));

import { ProjectDetailPage } from './ProjectDetailPage';

function renderPage() {
  return render(
    <LanguageProvider>
      <ProjectDetailPage />
    </LanguageProvider>
  );
}

describe('ProjectDetailPage', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  it('renders the sanitized rich body preserving media nodes and stripping scripts', () => {
    mockQuery.mockReturnValue({
      data: {
        id: 'p1',
        title: 'Proyecto de prueba',
        slug: mockSlug,
        shortDescription: 'Descripción corta del proyecto',
        body: '<p>Contenido seguro</p><script>alert("xss")</script><figure><img src="/uploads/x.png" alt="diagrama"></figure>',
        images: [],
        tags: ['proyecto-rapido'],
        repositoryUrl: 'https://github.com/example/proyecto',
        status: 'PUBLISHED',
        deletedAt: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        publishedAt: new Date('2024-01-01'),
      },
      isLoading: false,
      error: null,
    });

    const { container } = renderPage();

    // Title appears in breadcrumb and h1 — assert the heading specifically
    expect(screen.getByRole('heading', { level: 1, name: 'Proyecto de prueba' })).toBeInTheDocument();
    // Script stripped by sanitizeHtml (allowMedia: true)
    expect(container.querySelector('script')).toBeNull();
    // Safe text preserved
    expect(screen.getByText('Contenido seguro')).toBeInTheDocument();
    // Media nodes preserved (figure > img)
    expect(container.querySelector('figure img')).toHaveAttribute('src', '/uploads/x.png');
    // Repository link rendered
    expect(screen.getByRole('link', { name: /Ver repositorio/i })).toHaveAttribute(
      'href',
      'https://github.com/example/proyecto'
    );
  });

  it('renders a not-found state when the slug is unknown', () => {
    mockQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Not Found'),
    });

    renderPage();

    expect(screen.getByText('Proyecto no encontrado')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Volver a proyectos/i })).toHaveAttribute(
      'href',
      '/proyectos'
    );
  });
});