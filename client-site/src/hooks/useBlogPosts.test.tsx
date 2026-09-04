import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBlogPosts } from './useBlogPosts';
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

const emptyPage = {
  data: [],
  pagination: { page: 1, limit: 9, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
};

describe('useBlogPosts limit param (D4 / CHC-5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue(emptyPage);
  });

  it('sends limit 9 by default when the param is omitted (backward compatible)', async () => {
    renderHook(() => useBlogPosts(1), { wrapper });
    await waitFor(() => expect(mockGet).toHaveBeenCalled());

    const [, options] = mockGet.mock.calls[0];
    expect(options.params.limit).toBe(9);
    expect(options.params.page).toBe(1);
    expect(options.params.status).toBe('PUBLISHED');
  });

  it('sends the provided limit (3) when passed as the third argument', async () => {
    renderHook(() => useBlogPosts(1, undefined, 3), { wrapper });
    await waitFor(() => expect(mockGet).toHaveBeenCalled());

    const [, options] = mockGet.mock.calls[0];
    expect(options.params.limit).toBe(3);
    expect(options.params.page).toBe(1);
  });
});