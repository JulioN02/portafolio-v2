import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useVisibleSections } from './useSiteSections';
import type { ReactNode } from 'react';

const mockGet = vi.fn();

vi.mock('../api/client', () => ({
  apiClient: { get: (path: string, options: unknown) => mockGet(path, options) },
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const DEFAULT_KEYS = ['services', 'success-cases', 'products', 'tools'];

const sampleSections = [
  { id: 's1', key: 'services', label: 'Servicios', visible: true, order: 0 },
  { id: 's2', key: 'products', label: 'Productos', visible: true, order: 1 },
  { id: 's3', key: 'tools', label: 'Herramientas', visible: true, order: 2 },
  { id: 's4', key: 'success-cases', label: 'Casos', visible: true, order: 3 },
];

describe('useVisibleSections (site-sections hardening)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('returns visible sections sorted by order from the API', async () => {
    mockGet.mockResolvedValue(sampleSections);
    const { result } = renderHook(() => useVisibleSections(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.sections.map((section) => section.key)).toEqual([
      'services', 'products', 'tools', 'success-cases',
    ]);
    expect(result.current.isUsingFallback).toBe(false);
  });

  it('hides non-visible sections', async () => {
    mockGet.mockResolvedValue([
      ...sampleSections,
      { id: 'hidden', key: 'blog-teaser', label: 'Extra', visible: false, order: 4 },
    ]);
    const { result } = renderHook(() => useVisibleSections(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.sections.map((section) => section.key)).not.toContain('blog-teaser');
  });

  it('falls back to the default order when the API returns an empty list', async () => {
    mockGet.mockResolvedValue([]);
    const { result } = renderHook(() => useVisibleSections(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.sections.map((section) => section.key)).toEqual(DEFAULT_KEYS);
    expect(result.current.sections.every((section) => section.visible)).toBe(true);
    expect(result.current.isUsingFallback).toBe(true);
  });

  it('falls back to the default order when the API call errors', async () => {
    mockGet.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useVisibleSections(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.sections.map((section) => section.key)).toEqual(DEFAULT_KEYS);
    expect(result.current.isError).toBe(true);
    expect(result.current.isUsingFallback).toBe(true);
  });

  it('falls back to the default order when every section is hidden', async () => {
    mockGet.mockResolvedValue([
      { id: 's1', key: 'services', label: 'Servicios', visible: false, order: 0 },
      { id: 's2', key: 'products', label: 'Productos', visible: false, order: 1 },
    ]);
    const { result } = renderHook(() => useVisibleSections(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.sections.map((section) => section.key)).toEqual(DEFAULT_KEYS);
  });
});