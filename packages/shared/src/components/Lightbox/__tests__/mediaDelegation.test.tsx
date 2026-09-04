// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useEffect, useRef } from 'react';
import {
  prepareLightboxMedia,
  buildMediaItem,
  useMediaClickDelegation,
} from '../mediaDelegation';
import type { LightboxItem } from '../Lightbox';

const BODY_HTML =
  '<figure><img src="/uploads/x.png" alt="diagrama"></figure>' +
  '<video src="/clip.mp4" poster="/poster.png"></video>' +
  '<iframe src="/api/simulators/abc123/content" sandbox="allow-scripts" title="Simulador"></iframe>';

// Test harness: renders sanitized body HTML (test-only), wraps iframes, and
// wires the delegation hook — mirroring how the sites use it.
function Harness({ onMediaClick }: { onMediaClick: (item: LightboxItem) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) prepareLightboxMedia(ref.current, 'Ampliar');
  }, []);

  useMediaClickDelegation(ref, onMediaClick);

  return <div ref={ref} data-testid="body" dangerouslySetInnerHTML={{ __html: BODY_HTML }} />;
}

describe('prepareLightboxMedia', () => {
  it('wraps every iframe in a host and appends an expand button; sandbox/src untouched', () => {
    const container = document.createElement('div');
    container.innerHTML =
      '<iframe src="/api/simulators/abc123/content" sandbox="allow-scripts"></iframe>';

    prepareLightboxMedia(container, 'Ampliar');

    const host = container.querySelector('.media-lightbox-host');
    expect(host).not.toBeNull();
    const iframe = host?.querySelector('iframe');
    expect(iframe).toHaveAttribute('src', '/api/simulators/abc123/content');
    expect(iframe).toHaveAttribute('sandbox', 'allow-scripts');

    const button = container.querySelector('[data-media-expand]');
    expect(button).not.toBeNull();
    expect(button).toHaveAttribute('aria-label', 'Ampliar');
  });

  it('is idempotent: running twice does not double-wrap', () => {
    const container = document.createElement('div');
    container.innerHTML =
      '<iframe src="/api/simulators/abc123/content" sandbox="allow-scripts"></iframe>';

    prepareLightboxMedia(container, 'Ampliar');
    prepareLightboxMedia(container, 'Ampliar');

    expect(container.querySelectorAll('.media-lightbox-host')).toHaveLength(1);
    expect(container.querySelectorAll('[data-media-expand]')).toHaveLength(1);
  });
});

describe('buildMediaItem', () => {
  it('reads attributes from a live DOM img node', () => {
    const img = document.createElement('img');
    img.setAttribute('src', '/uploads/x.png');
    img.setAttribute('alt', 'diagrama');

    const item = buildMediaItem(img);
    expect(item).toEqual({ kind: 'image', src: '/uploads/x.png', alt: 'diagrama' });
  });

  it('reads attributes from a live DOM video node', () => {
    const video = document.createElement('video');
    video.setAttribute('src', '/clip.mp4');
    video.setAttribute('poster', '/poster.png');

    const item = buildMediaItem(video);
    expect(item).toEqual({
      kind: 'video',
      src: '/clip.mp4',
      poster: '/poster.png',
    });
  });

  it('reads attributes from a live DOM iframe node', () => {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', '/api/simulators/abc123/content');
    iframe.setAttribute('sandbox', 'allow-scripts');
    iframe.setAttribute('title', 'Simulador');

    const item = buildMediaItem(iframe);
    expect(item).toEqual({
      kind: 'iframe',
      src: '/api/simulators/abc123/content',
      sandbox: 'allow-scripts',
      title: 'Simulador',
    });
  });

  it('returns null for unknown elements and missing src', () => {
    const div = document.createElement('div');
    expect(buildMediaItem(div)).toBeNull();

    const img = document.createElement('img');
    expect(buildMediaItem(img)).toBeNull();
  });
});

describe('useMediaClickDelegation', () => {
  it('opens with the image item when a body img is clicked', () => {
    const onMediaClick = vi.fn();
    render(<Harness onMediaClick={onMediaClick} />);

    fireEvent.click(screen.getByRole('img', { name: 'diagrama' }));

    expect(onMediaClick).toHaveBeenCalledTimes(1);
    expect(onMediaClick.mock.calls[0][0]).toEqual({
      kind: 'image',
      src: '/uploads/x.png',
      alt: 'diagrama',
    });
  });

  it('opens with the video item when a body video is clicked', () => {
    const onMediaClick = vi.fn();
    render(<Harness onMediaClick={onMediaClick} />);

    const video = document.querySelector('video') as HTMLVideoElement;
    fireEvent.click(video);

    expect(onMediaClick).toHaveBeenCalledTimes(1);
    expect(onMediaClick.mock.calls[0][0]).toEqual({
      kind: 'video',
      src: '/clip.mp4',
      poster: '/poster.png',
    });
  });

  it('opens with the iframe item when the expand button is clicked', () => {
    const onMediaClick = vi.fn();
    render(<Harness onMediaClick={onMediaClick} />);

    fireEvent.click(screen.getByRole('button', { name: 'Ampliar' }));

    expect(onMediaClick).toHaveBeenCalledTimes(1);
    expect(onMediaClick.mock.calls[0][0]).toEqual({
      kind: 'iframe',
      src: '/api/simulators/abc123/content',
      sandbox: 'allow-scripts',
      title: 'Simulador',
    });
  });

  it('does not fire for clicks on non-media content', () => {
    const onMediaClick = vi.fn();
    render(<Harness onMediaClick={onMediaClick} />);

    // Clicking the container itself matches no media selector.
    fireEvent.click(screen.getByTestId('body'));

    expect(onMediaClick).not.toHaveBeenCalled();
  });
});