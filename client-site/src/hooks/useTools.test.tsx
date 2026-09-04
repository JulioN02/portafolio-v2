import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFeaturedTools } from './useTools';
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

const featuredArray = [
  {
    id: 't1',
    title: 'Herramienta destacada',
    slug: 'herramienta-destacada',
    classification: 'dev',
    shortDescription: 'Desc',
    images: [],
    featured: true,
  },
];

describe('useFeaturedTools (CHC-8)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue(featuredArray);
  });

  it('fetches from GET /tools/featured with the limit param', async () => {
    const { result } = renderHook(() => useFeaturedTools(3), { wrapper });
    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(mockGet).toHaveBeenCalledWith(
      '/tools/featured',
      expect.objectContaining({ params: { limit: 3 } }),
    );
  });

  it('returns the array of featured tools directly (no pagination unwrap)', async () => {
    const { result } = renderHook(() => useFeaturedTools(3), { wrapper });
    await waitFor(() => expect(result.current.data).toHaveLength(1));

    expect(result.current.data?.[0]?.id).toBe('t1');
  });
});