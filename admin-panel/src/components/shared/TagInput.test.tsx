import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('does not render the suggestions dropdown before the input is focused', async () => {
    mockGet.mockResolvedValue({ data: ['laboratorio', 'experimento'] });
    renderWithProviders(
      <TagInput value={[]} onChange={() => undefined} suggestionsUrl="/blog-posts/tags" />,
    );

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/blog-posts/tags');
    });

    // Regression: with an empty input every suggestion matches, but the
    // dropdown MUST stay hidden until the user focuses the field.
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.queryByText('laboratorio')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders the suggestions dropdown after the input is focused', async () => {
    mockGet.mockResolvedValue({ data: ['laboratorio', 'experimento'] });
    const user = userEvent.setup();
    renderWithProviders(
      <TagInput value={[]} onChange={() => undefined} suggestionsUrl="/blog-posts/tags" />,
    );

    const input = screen.getByRole('combobox');
    await user.click(input);

    expect(await screen.findByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('laboratorio')).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes the suggestions dropdown on blur', async () => {
    mockGet.mockResolvedValue({ data: ['laboratorio', 'experimento'] });
    const user = userEvent.setup();
    renderWithProviders(
      <TagInput value={[]} onChange={() => undefined} suggestionsUrl="/blog-posts/tags" />,
    );

    const input = screen.getByRole('combobox');
    await user.click(input);
    expect(await screen.findByRole('listbox')).toBeInTheDocument();

    fireEvent.blur(input);

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes the suggestions dropdown on Escape', async () => {
    mockGet.mockResolvedValue({ data: ['laboratorio', 'experimento'] });
    const user = userEvent.setup();
    renderWithProviders(
      <TagInput value={[]} onChange={() => undefined} suggestionsUrl="/blog-posts/tags" />,
    );

    const input = screen.getByRole('combobox');
    await user.click(input);
    expect(await screen.findByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  it('fetches suggestions from the given URL and renders them after focus', async () => {
    mockGet.mockResolvedValue({ data: ['laboratorio', 'experimento'] });
    const user = userEvent.setup();
    renderWithProviders(
      <TagInput value={[]} onChange={() => undefined} suggestionsUrl="/blog-posts/tags" />,
    );

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/blog-posts/tags');
    });

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'lab');

    expect(await screen.findByText('laboratorio')).toBeInTheDocument();
    expect(screen.queryByText('experimento')).not.toBeInTheDocument();
  });

  it('adds a tag when a suggestion is clicked', async () => {
    mockGet.mockResolvedValue({ data: ['laboratorio'] });
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <TagInput value={[]} onChange={onChange} suggestionsUrl="/blog-posts/tags" />,
    );

    const input = screen.getByRole('combobox');
    await user.click(input);

    const suggestion = await screen.findByRole('button', { name: 'laboratorio' });
    await user.click(suggestion);

    expect(onChange).toHaveBeenCalledWith(['laboratorio']);
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

  it('removes a chip when its remove button is clicked', async () => {
    mockGet.mockResolvedValue({ data: ['laboratorio'] });
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <TagInput value={['laboratorio', 'react']} onChange={onChange} suggestionsUrl="/blog-posts/tags" />,
    );

    // Even with the dropdown open, removing a chip must still work.
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('button', { name: 'Eliminar laboratorio' }));

    expect(onChange).toHaveBeenCalledWith(['react']);
  });
});
