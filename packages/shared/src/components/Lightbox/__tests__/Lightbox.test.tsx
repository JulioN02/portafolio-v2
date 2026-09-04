// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Lightbox } from '../Lightbox';
import type { LightboxItem } from '../Lightbox';

const labels = {
  close: 'Cerrar',
  prev: 'Anterior',
  next: 'Siguiente',
  counter: '{current} de {total}',
  dialogLabel: 'Visor de imágenes',
};

const items: LightboxItem[] = [
  { kind: 'image', src: '/a.png', alt: 'Imagen A' },
  { kind: 'image', src: '/b.png', alt: 'Imagen B' },
  { kind: 'image', src: '/c.png', alt: 'Imagen C' },
];

function renderLightbox(
  props: Partial<React.ComponentProps<typeof Lightbox>> = {},
) {
  const onClose = props.onClose ?? vi.fn();
  const onIndexChange = props.onIndexChange ?? vi.fn();
  const utils = render(
    <Lightbox
      isOpen={props.isOpen ?? true}
      items={props.items ?? items}
      initialIndex={props.initialIndex ?? 0}
      labels={labels}
      onClose={onClose}
      onIndexChange={onIndexChange}
    />,
  );
  return { ...utils, onClose, onIndexChange };
}

describe('Lightbox', () => {
  it('renders a dialog with aria-modal and a translated aria-label', () => {
    renderLightbox();

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', labels.dialogLabel);
    expect(screen.getByRole('button', { name: labels.close })).toBeInTheDocument();
  });

  it('shows the initial slide and the translated counter', () => {
    renderLightbox({ initialIndex: 1 });
    expect(screen.getByText('2 de 3')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Imagen B' })).toHaveAttribute(
      'src',
      '/b.png',
    );
  });

  it('closes when the backdrop (outside the media) is clicked', () => {
    const { onClose } = renderLightbox();

    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog); // click on the overlay itself = backdrop

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does NOT close when the click lands on the media element', () => {
    const { onClose } = renderLightbox();

    const img = screen.getByRole('img', { name: 'Imagen A' });
    fireEvent.click(img);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes on ESC and restores focus to the trigger element', () => {
    const trigger = document.createElement('button');
    trigger.textContent = 'Abrir';
    document.body.appendChild(trigger);
    trigger.focus();

    const { onClose, rerender } = renderLightbox();
    expect(document.activeElement).not.toBe(trigger); // focus moved into dialog

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);

    // Parent closes the lightbox → focus returns to the trigger.
    rerender(
      <Lightbox
        isOpen={false}
        items={items}
        initialIndex={0}
        labels={labels}
        onClose={onClose}
      />,
    );
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it('traps Tab focus inside the dialog, wrapping first↔last and never escaping', () => {
    const onClose = vi.fn();
    const onIndexChange = vi.fn();
    render(
      <>
        <button type="button">Fuera antes</button>
        <Lightbox
          isOpen
          items={items}
          initialIndex={0}
          labels={labels}
          onClose={onClose}
          onIndexChange={onIndexChange}
        />
        <button type="button">Fuera después</button>
      </>,
    );

    const dialog = screen.getByRole('dialog');
    const dialogButtons = Array.from(dialog.querySelectorAll('button'));
    // 3 image items → close + prev + next are the only focusable elements.
    expect(dialogButtons).toHaveLength(3);
    const first = dialogButtons[0];
    const middle = dialogButtons[1];
    const last = dialogButtons[dialogButtons.length - 1];

    // Focus moves into the dialog on open (close button).
    expect(document.activeElement).toBe(first);

    // Tab from the LAST focusable element wraps back to the FIRST.
    last.focus();
    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(document.activeElement).toBe(first);

    // Shift+Tab from the FIRST element wraps to the LAST.
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);

    // Non-wrapping Tab from a middle element keeps focus inside the dialog.
    middle.focus();
    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(document.activeElement).toBe(middle);
    expect(dialog.contains(document.activeElement)).toBe(true);

    // Focus never escapes to elements outside the dialog.
    expect(document.activeElement).not.toBe(
      screen.getByRole('button', { name: 'Fuera antes' }),
    );
    expect(document.activeElement).not.toBe(
      screen.getByRole('button', { name: 'Fuera después' }),
    );
  });

  it('closes on wheel scroll over the overlay (accumulated deltaY > 25)', () => {
    const { onClose } = renderLightbox();

    const dialog = screen.getByRole('dialog');
    fireEvent.wheel(dialog, { deltaY: 30 });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('ignores wheel events whose target is inside [data-lightbox-media]', () => {
    const { onClose } = renderLightbox();

    const img = screen.getByRole('img', { name: 'Imagen A' });
    fireEvent.wheel(img, { deltaY: 30 });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes on touch scroll (vertical delta > 25)', () => {
    const { onClose } = renderLightbox();

    const dialog = screen.getByRole('dialog');
    fireEvent.touchStart(dialog, { touches: [{ clientY: 100 }] });
    fireEvent.touchMove(dialog, { touches: [{ clientY: 200 }] });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('navigates with arrow keys and prev/next controls, syncing via onIndexChange', () => {
    const { onIndexChange } = renderLightbox({ initialIndex: 1 });

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowRight' });
    expect(screen.getByText('3 de 3')).toBeInTheDocument();
    expect(onIndexChange).toHaveBeenLastCalledWith(2);

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowLeft' });
    expect(screen.getByText('2 de 3')).toBeInTheDocument();
    expect(onIndexChange).toHaveBeenLastCalledWith(1);

    fireEvent.click(screen.getByRole('button', { name: labels.next }));
    expect(screen.getByText('3 de 3')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: labels.prev }));
    expect(screen.getByText('2 de 3')).toBeInTheDocument();
  });

  it('renders a single body item without navigation controls', () => {
    renderLightbox({ items: [items[0]], initialIndex: 0 });

    expect(screen.queryByRole('button', { name: labels.next })).toBeNull();
    expect(screen.queryByRole('button', { name: labels.prev })).toBeNull();
    expect(screen.getByText('1 de 1')).toBeInTheDocument();
  });

  it('renders videos with controls', () => {
    renderLightbox({
      items: [{ kind: 'video', src: '/clip.mp4', poster: '/poster.png' }],
    });

    const videoEl = document.querySelector('video');
    expect(videoEl).not.toBeNull();
    expect(videoEl).toHaveAttribute('src', '/clip.mp4');
    expect(videoEl).toHaveAttribute('poster', '/poster.png');
    expect(videoEl).toHaveAttribute('controls');
  });

  it('renders iframes with the SAME sandbox/src (visual overlay only)', () => {
    renderLightbox({
      items: [
        { kind: 'iframe', src: '/api/simulators/abc/content', sandbox: 'allow-scripts', title: 'Simulador' },
      ],
    });

    const iframe = document.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe).toHaveAttribute('src', '/api/simulators/abc/content');
    expect(iframe).toHaveAttribute('sandbox', 'allow-scripts');
    expect(iframe).toHaveAttribute('title', 'Simulador');
    expect(iframe).toHaveAttribute('data-lightbox-media', 'true');
  });

  it('renders nothing when closed', () => {
    const { container } = renderLightbox({ isOpen: false });
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });
});