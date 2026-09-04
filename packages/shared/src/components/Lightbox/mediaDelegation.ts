/**
 * Body-media lightbox wiring for blog rich content.
 *
 * The body HTML is rendered ONLY through the existing sanitized pipeline
 * (renderSimulatorEmbeds / sanitizeHtml). This module never touches HTML
 * strings — it post-processes the already-sanitized DOM and attaches ONE
 * click listener (event delegation) so that clicking a body image, video, or
 * simulator iframe opens the lightbox. Sandboxed simulator iframes cannot
 * bubble clicks from their own content, so each iframe is wrapped in a host
 * with a guaranteed corner "expand" button.
 */
import { useEffect, type RefObject } from 'react';
import type { LightboxItem } from './Lightbox';

export const MEDIA_HOST_CLASS = 'media-lightbox-host';
export const MEDIA_EXPAND_CLASS = 'media-expand';
export const MEDIA_EXPAND_ATTR = 'data-media-expand';

/**
 * Post-render DOM pass over the sanitized body container:
 * wraps every iframe in a relative host and appends a corner expand button.
 * Pure DOM API (createElement/appendChild) — no innerHTML, no string
 * reconstruction. Idempotent: already-wrapped iframes are skipped.
 */
export function prepareLightboxMedia(container: HTMLElement, expandLabel: string): void {
  if (!container) return;

  container.querySelectorAll('iframe').forEach((iframe) => {
    if (iframe.closest(`.${MEDIA_HOST_CLASS}`)) return;

    const host = document.createElement('div');
    host.className = MEDIA_HOST_CLASS;

    iframe.parentNode?.insertBefore(host, iframe);
    host.appendChild(iframe);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = MEDIA_EXPAND_CLASS;
    button.setAttribute(MEDIA_EXPAND_ATTR, 'true');
    button.setAttribute('aria-label', expandLabel);
    button.textContent = '⤢';
    host.appendChild(button);
  });
}

/**
 * Build a LightboxItem from a live DOM node (img/video/iframe) by reading its
 * attributes — never reconstructs media from HTML strings.
 */
export function buildMediaItem(el: Element): LightboxItem | null {
  const tag = el.tagName.toLowerCase();

  if (tag === 'img') {
    const src = el.getAttribute('src');
    if (!src) return null;
    return { kind: 'image', src, alt: el.getAttribute('alt') ?? undefined };
  }

  if (tag === 'video') {
    const src = el.getAttribute('src') ?? el.querySelector('source')?.getAttribute('src');
    if (!src) return null;
    return { kind: 'video', src, poster: el.getAttribute('poster') ?? undefined };
  }

  if (tag === 'iframe') {
    const src = el.getAttribute('src');
    if (!src) return null;
    return {
      kind: 'iframe',
      src,
      sandbox: el.getAttribute('sandbox') ?? undefined,
      title: el.getAttribute('title') ?? undefined,
    };
  }

  return null;
}

/**
 * ONE click listener on the (already-sanitized) body container. Matches
 * img/video/iframe directly or the expand button added by prepareLightboxMedia
 * (resolving to its host iframe). Videos are paused on the source element when
 * opened.
 */
export function useMediaClickDelegation(
  containerRef: RefObject<HTMLElement | null>,
  onMediaClick: (item: LightboxItem, sourceEl: Element) => void,
): void {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target) return;

      const matched = target.closest('img, video, iframe, [data-media-expand]');
      if (!matched) return;

      let sourceEl: Element = matched;
      let item: LightboxItem | null = null;

      if (matched.hasAttribute(MEDIA_EXPAND_ATTR)) {
        const host = matched.closest(`.${MEDIA_HOST_CLASS}`);
        const iframe = host?.querySelector('iframe');
        if (!iframe) return;
        sourceEl = iframe;
        item = buildMediaItem(iframe);
      } else {
        item = buildMediaItem(matched);
      }

      if (!item) return;
      event.preventDefault();

      if (item.kind === 'video' && matched instanceof HTMLVideoElement) {
        matched.pause();
      }

      onMediaClick(item, sourceEl);
    };

    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, [containerRef, onMediaClick]);
}