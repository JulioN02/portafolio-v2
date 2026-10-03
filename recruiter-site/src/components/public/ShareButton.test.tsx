import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ShareButton } from './ShareButton';

describe('ShareButton', () => {
  beforeEach(() => vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn() } }));
  afterEach(() => vi.unstubAllGlobals());

  it('announces clipboard success and keeps feedback associated', async () => {
    const writeText = vi.mocked(navigator.clipboard.writeText);
    render(<ShareButton title="Proyecto" />);
    fireEvent.click(screen.getByRole('button', { name: 'Compartir Proyecto' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(window.location.href));
    expect(screen.getByRole('status')).toHaveTextContent('Enlace copiado.');
    expect(screen.getByRole('button')).toHaveAttribute('aria-describedby');
  });

  it('does not expose the technical error returned by Web Share', async () => {
    vi.stubGlobal('navigator', { share: vi.fn().mockRejectedValue(new Error('secret detail')), clipboard: { writeText: vi.fn() } });
    render(<ShareButton title="Proyecto" />);
    fireEvent.click(screen.getByRole('button', { name: 'Compartir Proyecto' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('No se pudo compartir el enlace.'));
    expect(screen.getByRole('status')).not.toHaveTextContent('secret detail');
  });
});
