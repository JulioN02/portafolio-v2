import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ProjectList } from './ProjectList';
import type { ProjectSummary } from '../../types';

const mockNavigate = vi.fn();
const mockProjectsQuery = vi.fn();
const mockClassificationsQuery = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../hooks/useProjects', () => ({
  useProjects: (filters?: unknown) => mockProjectsQuery(filters),
  useProjectClassifications: () => mockClassificationsQuery(),
}));

const labProject: ProjectSummary = {
  id: 'b1',
  type: 'laboratorio',
  title: 'Simulador de circuitos',
  slug: 'simulador-circuitos',
  classification: 'laboratorio',
  shortDescription: 'Post de laboratorio',
  images: ['c.jpg'],
};

const realProject: ProjectSummary = {
  id: 'p1',
  type: 'project',
  title: 'Portafolio Web',
  slug: 'portafolio-web',
  classification: 'proyecto-rapido',
  shortDescription: 'Proyecto real',
  images: [],
  tags: ['proyecto-rapido'],
};

function renderList() {
  return render(
    <MemoryRouter>
      <ProjectList onSelectProject={vi.fn()} />
    </MemoryRouter>
  );
}

describe('ProjectList', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockProjectsQuery.mockReset();
    mockClassificationsQuery.mockReset();
    mockClassificationsQuery.mockReturnValue({ data: ['proyecto-rapido'] });
  });

  it('navigates to /blog/:slug when a lab card is clicked (no modal)', async () => {
    mockProjectsQuery.mockReturnValue({
      data: { data: [labProject], pagination: { total: 1, totalPages: 1, page: 1, limit: 12, hasNext: false, hasPrev: false } },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    const user = userEvent.setup();
    renderList();

    await user.click(screen.getByText('Simulador de circuitos'));

    expect(mockNavigate).toHaveBeenCalledWith('/blog/simulador-circuitos');
  });

  it('opens the modal (calls onSelectProject) for a real Project card', async () => {
    mockProjectsQuery.mockReturnValue({
      data: { data: [realProject], pagination: { total: 1, totalPages: 1, page: 1, limit: 12, hasNext: false, hasPrev: false } },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    const onSelectProject = vi.fn();
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ProjectList onSelectProject={onSelectProject} />
      </MemoryRouter>
    );

    await user.click(screen.getByText('Portafolio Web'));

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(onSelectProject).toHaveBeenCalledWith(expect.objectContaining({ type: 'project' }));
  });
});