import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProjectDetailModal } from './ProjectDetailModal';
import type { ProjectSummary } from '../../types';

const mockDetail = vi.fn();

vi.mock('../../hooks/useProjects', () => ({
  useProjectDetail: (type: string, slug: string) => mockDetail(type, slug),
}));

const project: ProjectSummary = {
  id: 'p1',
  type: 'project',
  title: 'Proyecto de prueba',
  slug: 'proyecto-prueba',
  classification: 'proyecto-rapido',
  shortDescription: 'Descripción corta',
  images: [],
  tags: ['proyecto-rapido', 'web'],
};

function renderModal() {
  return render(<ProjectDetailModal project={project} onClose={() => undefined} />);
}

describe('ProjectDetailModal (real Project branch)', () => {
  beforeEach(() => {
    mockDetail.mockReset();
  });

  it('renders sanitized body preserving media and stripping scripts, plus tags and repository link', () => {
    mockDetail.mockReturnValue({
      data: {
        id: 'p1',
        title: 'Proyecto de prueba',
        slug: 'proyecto-prueba',
        body: '<p>Descripción rica</p><script>alert("xss")</script><figure><img src="/uploads/x.png" alt="diagrama"></figure>',
        repositoryUrl: 'https://github.com/example/proyecto',
        images: [],
        tags: ['proyecto-rapido', 'web'],
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    const { container } = renderModal();

    expect(screen.getByText('Proyecto de prueba')).toBeInTheDocument();
    // Tags rendered as chips (classification also shows 'proyecto-rapido', so >= 2 matches)
    expect(screen.getAllByText('proyecto-rapido').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('web')).toBeInTheDocument();
    // Sanitized body: script stripped, safe text + figure/img preserved
    expect(container.querySelector('script')).toBeNull();
    expect(screen.getByText('Descripción rica')).toBeInTheDocument();
    expect(container.querySelector('figure img')).toHaveAttribute('src', '/uploads/x.png');
    // Repository link
    expect(screen.getByRole('link', { name: /Ver repositorio/i })).toHaveAttribute(
      'href',
      'https://github.com/example/proyecto'
    );
    // Legacy sections hidden for real projects
    expect(screen.queryByText('Detalles Técnicos')).not.toBeInTheDocument();
    expect(screen.queryByText('Imágenes Técnicas')).not.toBeInTheDocument();
  });

  it('hides body and repository sections gracefully when fields are absent', () => {
    mockDetail.mockReturnValue({
      data: {
        id: 'p1',
        title: 'Proyecto de prueba',
        slug: 'proyecto-prueba',
        body: '',
        repositoryUrl: undefined,
        images: [],
        tags: [],
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    renderModal();

    expect(screen.queryByText('Descripción')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Ver repositorio/i })).not.toBeInTheDocument();
  });
});