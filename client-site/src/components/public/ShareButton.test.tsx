import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ShareButton } from './ShareButton';

describe('ShareButton', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn() } });
  });

  afterEach(() => vi.unstubAllGlobals());

  it('uses clipboard fallback and announces success', async () => {
    const writeText = vi.mocked(navigator.clipboard.writeText);
    render(<ShareButton title="Servicio" />);

    fireEvent.click(screen.getByRole('button', { name: 'Compartir Servicio' }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(window.location.href));
    expect(screen.getByRole('status')).toHaveTextContent('Enlace copiado.');
    expect(screen.getByRole('button')).toHaveAttribute('aria-describedby');
  });

  it('distinguishes Web Share cancellation from an actual failure', async () => {
    const share = vi.fn().mockRejectedValueOnce(Object.assign(new Error(), { name: 'AbortError' }));
    vi.stubGlobal('navigator', { share, clipboard: { writeText: vi.fn() } });
    render(<ShareButton title="Servicio" />);
    fireEvent.click(screen.getByRole('button', { name: 'Compartir Servicio' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Compartir cancelado.'));

    share.mockRejectedValueOnce(new Error('technical failure'));
    fireEvent.click(screen.getByRole('button', { name: 'Compartir Servicio' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('No se pudo compartir el enlace.'));
    expect(screen.getByRole('status')).not.toHaveTextContent('technical failure');
  });

  it('gives each instance a unique status relationship', () => {
    render(<><ShareButton title="Uno" /><ShareButton title="Dos" /></>);
    const buttons = screen.getAllByRole('button');
    expect(buttons[0].getAttribute('aria-describedby')).not.toBe(buttons[1].getAttribute('aria-describedby'));
  });
});
