import { SIMULATOR_CONTENT_SRC_REGEX } from '../../utils/sanitize.js';

export const SIMULATOR_DEFAULT_WIDTH = 800;
export const SIMULATOR_DEFAULT_HEIGHT = 600;

/**
 * Build the dedicated serving URL for a simulator id, or null when the id is
 * not a safe token (defense in depth — the sanitize allowlist enforces the
 * same regex at the HTML level).
 */
export function buildSimulatorSrc(simulatorId: string): string | null {
  const src = `/api/simulators/${simulatorId}/content`;
  return SIMULATOR_CONTENT_SRC_REGEX.test(src) ? src : null;
}

export interface SimulatorNodeProps {
  simulatorId: string;
  /** Accessible iframe title (defaults to 'Simulador'). */
  title?: string;
  /** Display width in px. Default 800. */
  width?: number;
  /** Display height in px. Default 600. */
  height?: number;
  className?: string;
}

/**
 * Sandboxed simulator embed.
 *
 * SECURITY INVARIANT (design.md Decision 6 / simulator-embeds spec):
 * - `sandbox="allow-scripts"` — the simulator can run its own scripts but has
 *   NO same-origin privileges.
 * - NO `allow-same-origin` — the iframe cannot read the parent DOM, cookies,
 *   or localStorage, and the parent cannot reach into the frame.
 * - The src is ALWAYS the dedicated serving endpoint (never inline raw HTML,
 *   never DOMPurify-rendered).
 */
export function SimulatorNode({
  simulatorId,
  title,
  width = SIMULATOR_DEFAULT_WIDTH,
  height = SIMULATOR_DEFAULT_HEIGHT,
  className,
}: SimulatorNodeProps) {
  const src = buildSimulatorSrc(simulatorId);
  if (!src) return null;

  return (
    <div
      className={`rte-simulator-embed${className ? ` ${className}` : ''}`}
      data-simulator-embed="true"
    >
      <iframe
        src={src}
        sandbox="allow-scripts"
        title={title || 'Simulador'}
        width={width}
        height={height}
        loading="lazy"
      />
    </div>
  );
}