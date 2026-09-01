import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from '../../i18n/LanguageContext';
import type { ReactNode } from 'react';

const mockGet = vi.fn();

vi.mock('../../api/client', () => ({
  apiClient: {
    get: (url: string) => mockGet(url),
  },
}));

import { TagInput } from './TagInput';

function renderWithProviders(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LanguageProvider>{ui}</LanguageProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('TagInput', () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it('renders the selected tags as removable chips', () => {
    mockGet.mockResolvedValue({ data: [] });
    renderWithProviders(
      <TagInput value={['laboratorio', 'react']} onChange={() => undefined} suggestionsUrl="/blog-posts/tags" />,
    );

    const chips = screen.getAllByRole('button', { name: /react|laboratorio/ });
    // one chip button + remove buttons per chip + suggestion list is empty
    expect(screen.getByText('laboratorio')).toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(chips.length).toBeGreaterThanOrEqual(2);
  });

  it('commits a typed tag on Enter and trims it', async () => {
    mockGet.mockResolvedValue({ data: [] });
    const onChange = vi.fn();
    renderWithProviders(
      <TagInput value={[]} onChange={onChange} suggestionsUrl="/blog-posts/tags" />,
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: '  laboratorio  ' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith(['laboratorio']);
  });

  it('fetches suggestions from the given URL and renders them', async () => {
    mockGet.mockResolvedValue({ data: ['laboratorio', 'experimento'] });
    renderWithProviders(
      <TagInput value={[]} onChange={() => undefined} suggestionsUrl="/blog-posts/tags" />,
    );

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/blog-posts/tags');
    });

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'lab' } });

    await waitFor(() => {
      expect(screen.getByText('laboratorio')).toBeInTheDocument();
    });
  });

  it('refuses more than the max number of tags', () => {
    mockGet.mockResolvedValue({ data: [] });
    const onChange = vi.fn();
    renderWithProviders(
      <TagInput value={['a', 'b', 'c']} onChange={onChange} suggestionsUrl="/blog-posts/tags" max={3} />,
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'd' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText('Máximo 10 etiquetas')).toBeInTheDocument();
  });

  it('removes a chip when its remove button is clicked', () => {
    mockGet.mockResolvedValue({ data: [] });
    const onChange = vi.fn();
    renderWithProviders(
      <TagInput value={['laboratorio', 'react']} onChange={onChange} suggestionsUrl="/blog-posts/tags" />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar laboratorio' }));

    expect(onChange).toHaveBeenCalledWith(['react']);
  });
});