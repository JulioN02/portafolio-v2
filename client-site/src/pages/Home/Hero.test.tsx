import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { PROFILE } from '@jsoft/shared';

vi.mock('../../components/seo/MetaTags', () => ({
  MetaTags: () => null,
}));

const mockUseProjects = vi.fn();

vi.mock('../../hooks/useProjects', () => ({
  useProjects: (opts: unknown) => mockUseProjects(opts),
}));

import { Hero } from './Hero';

function renderHero() {
  return render(
    <MemoryRouter>
      <LanguageProvider>
        <Hero />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

const okData = {
  data: [],
  pagination: { page: 1, limit: 1, total: 42, totalPages: 42, hasNext: true, hasPrev: false },
};

const loadingState = { data: undefined, isLoading: true, isError: false, error: null };
const errorState = { data: undefined, isLoading: false, isError: true, error: new Error('boom') };
const okState = { data: okData, isLoading: false, isError: false, error: null };

describe('Hero trust stats (D5 / CHC-2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseProjects.mockReturnValue(okState);
  });

  it('requests the projects endpoint with limit 1 to read the total', () => {
    renderHero();
    expect(mockUseProjects).toHaveBeenCalledWith({ filter: { page: 1, limit: 1 } });
  });

  it('renders the 3 stats: availability (PROFILE), response < 24h, delivered projects count', () => {
    renderHero();

    // (1) static availability from PROFILE.availabilityMetric + translation label
    expect(screen.getByText(PROFILE.availabilityMetric)).toBeInTheDocument();
    expect(screen.getByText('disponibilidad')).toBeInTheDocument();

    // (2) static response-time claim
    expect(screen.getByText('Respuesta < 24h')).toBeInTheDocument();

    // (3) project count from the API total (42), with its label
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Proyectos entregados')).toBeInTheDocument();
  });

  it('shows a role="status" skeleton while loading and keeps the two static stats', () => {
    mockUseProjects.mockReturnValue(loadingState);
    renderHero();

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(PROFILE.availabilityMetric)).toBeInTheDocument();
    expect(screen.getByText('Respuesta < 24h')).toBeInTheDocument();
  });

  it('hides the project stat on error, keeping the two static stats (no placeholder)', () => {
    mockUseProjects.mockReturnValue(errorState);
    renderHero();

    expect(screen.queryByText('Proyectos entregados')).not.toBeInTheDocument();
    expect(screen.getByText(PROFILE.availabilityMetric)).toBeInTheDocument();
    expect(screen.getByText('Respuesta < 24h')).toBeInTheDocument();
  });
});

describe('Hero CTAs (CHC-1 / CIN-3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseProjects.mockReturnValue(okState);
  });

  it('points the WhatsApp CTA to the canonical PROFILE URL (573003727134)', () => {
    renderHero();
    const whatsapp = screen.getByRole('link', { name: 'Escríbeme por WhatsApp' });
    expect(whatsapp).toHaveAttribute('href', PROFILE.whatsappUrl);
    expect(PROFILE.whatsappUrl).toContain('573003727134');
  });

  it('keeps the primary CTA pointing to /servicios', () => {
    renderHero();
    const primary = screen.getByRole('link', { name: 'Ver Servicios' });
    expect(primary).toHaveAttribute('href', '/servicios');
  });
});

describe('Hero badge replacement (D5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseProjects.mockReturnValue(okState);
  });

  it('no longer renders the 4 generic service badges', () => {
    renderHero();
    expect(screen.queryByText('UI/UX Design')).not.toBeInTheDocument();
    expect(screen.queryByText('Consultoría')).not.toBeInTheDocument();
    expect(screen.queryByText('Apps Móviles')).not.toBeInTheDocument();
  });
});