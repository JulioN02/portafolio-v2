import { sanitizeHtml } from '../../utils/sanitize.js';
import {
  SimulatorNode,
  buildSimulatorSrc,
  SIMULATOR_DEFAULT_WIDTH,
  SIMULATOR_DEFAULT_HEIGHT,
} from './SimulatorNode.js';

export interface RenderSimulatorEmbedsOptions {
  /** Override display width for transformed embeds (default 800). */
  width?: number;
  /** Override display height for transformed embeds (default 600). */
  height?: number;
}

/**
 * Render-time transform for rich content containing simulator placeholders.
 *
 * The editor stores `<div data-simulator-id="...">` (SimulatorPlaceholder
 * node). This function:
 *  1. Sanitizes with the shared media allowlist (scripts stripped, iframes
 *     restricted to the simulator endpoint, `data-simulator-id` kept).
 *  2. Replaces every `div[data-simulator-id]` with the sandboxed iframe
 *     (`sandbox="allow-scripts"`, NO `allow-same-origin`).
 *  3. Hardens any surviving iframe (hand-written simulator iframe that passed
 *     the sanitize allowlist) by forcing the sandbox attribute.
 *
 * Returns a sanitized HTML string safe for `dangerouslySetInnerHTML`. In
 * environments without DOMParser (SSR) it returns the sanitized HTML as-is.
 */
export function renderSimulatorEmbeds(
  html: string,
  options: RenderSimulatorEmbedsOptions = {},
): string {
  const clean = sanitizeHtml(html, { allowMedia: true });

  if (typeof DOMParser === 'undefined') return clean;

  const doc = new DOMParser().parseFromString(clean, 'text/html');

  const width = options.width ?? SIMULATOR_DEFAULT_WIDTH;
  const height = options.height ?? SIMULATOR_DEFAULT_HEIGHT;

  doc.querySelectorAll('div[data-simulator-id]').forEach((div) => {
    const id = (div.getAttribute('data-simulator-id') || '').trim();
    const src = buildSimulatorSrc(id);
    if (!src) {
      // Placeholder with an invalid/unsafe id — drop it entirely.
      div.remove();
      return;
    }

    const iframe = doc.createElement('iframe');
    iframe.setAttribute('src', src);
    iframe.setAttribute('sandbox', 'allow-scripts');
    iframe.setAttribute('width', String(width));
    iframe.setAttribute('height', String(height));
    iframe.setAttribute('title', 'Simulador');
    iframe.setAttribute('loading', 'lazy');
    // Responsive: keep the design's aspect ratio, fill the container width.
    iframe.style.width = '100%';
    iframe.style.aspectRatio = `${width} / ${height}`;
    div.replaceWith(iframe);
  });

  // Hardening (defense in depth): every iframe that survived sanitization
  // (src matches the simulator endpoint) gets sandbox FORCED to exactly
  // 'allow-scripts'. Any author-supplied sandbox value — including
  // `allow-same-origin` — is overwritten, so the invariant holds even if the
  // DOMPurify attribute allowlist ever grows to admit `sandbox`.
  doc.querySelectorAll('iframe').forEach((iframe) => {
    iframe.setAttribute('sandbox', 'allow-scripts');
  });

  return doc.body.innerHTML;
}

export interface SimulatorSectionProps {
  simulatorId: string;
  /** Accessible iframe title (defaults to 'Simulador'). */
  title?: string;
  /** Display width in px. Default 800. */
  width?: number;
  /** Display height in px. Default 600. */
  height?: number;
}

/**
 * Standalone simulator section for direct embedding outside rich content.
 * Renders the sandboxed iframe with constrained dimensions (defaults 800×600,
 * overridable per placement; the wrapper clamps to the container width).
 */
export function SimulatorSection({ simulatorId, title, width, height }: SimulatorSectionProps) {
  return (
    <section className="rte-simulator-section" data-simulator-section="true">
      <SimulatorNode simulatorId={simulatorId} title={title} width={width} height={height} />
    </section>
  );
}

export { SimulatorNode, SIMULATOR_DEFAULT_WIDTH, SIMULATOR_DEFAULT_HEIGHT };