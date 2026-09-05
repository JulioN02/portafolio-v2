import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFeaturedProducts } from './useProducts';
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
    id: 'p1',
    title: 'Producto destacado',
    slug: 'producto-destacado',
    classification: 'app',
    shortDescription: 'Desc',
    images: [],
    featured: true,
  },
];

describe('useFeaturedProducts (CHC-8)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue(featuredArray);
  });

  it('fetches from GET /products/featured with the limit param', async () => {
    const { result } = renderHook(() => useFeaturedProducts(5), { wrapper });
    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(mockGet).toHaveBeenCalledWith(
      '/products/featured',
      expect.objectContaining({ params: { limit: 5 } }),
    );
  });

  it('returns the array of featured products directly (no pagination unwrap)', async () => {
    const { result } = renderHook(() => useFeaturedProducts(5), { wrapper });
    await waitFor(() => expect(result.current.data).toHaveLength(1));

    expect(result.current.data?.[0]?.id).toBe('p1');
  });
});