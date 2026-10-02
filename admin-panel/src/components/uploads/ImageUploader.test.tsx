import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from '../../i18n/LanguageContext';
import type { ReactNode } from 'react';

vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock('../../api/upload.api', () => ({
  uploadApi: { uploadImage: vi.fn().mockResolvedValue({ url: 'https://cdn.example/image.png' }), deleteImage: vi.fn() },
}));

import { ImageUploader } from './ImageUploader';
import { uploadApi } from '../../api/upload.api';

function renderWithProviders(ui: ReactNode) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LanguageProvider>{ui}</LanguageProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ImageUploader accept attribute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('advertises exactly the server-accepted types and NOT svg', () => {
    const { container } = renderWithProviders(
      <ImageUploader value="" onChange={() => undefined} label="Imagen" />,
    );

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.accept).toBe('image/jpeg,image/png,image/gif,image/webp');
    expect(input.accept).not.toContain('svg');
    expect(input.accept).not.toContain('html');
  });

  it('passes the explicit service bucket when uploading', async () => {
    const { container } = renderWithProviders(
      <ImageUploader value={[]} onChange={() => undefined} label="Imagen" multiple bucket="servicios" />,
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['image'], 'service.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(uploadApi.uploadImage).toHaveBeenCalledWith(file, 'servicios', expect.any(Function)));
  });
});
