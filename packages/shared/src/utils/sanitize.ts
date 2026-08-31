import DOMPurify from 'dompurify';

/**
 * Simulator serving endpoint. iframes are ONLY preserved when their src
 * matches this dedicated endpoint (sandboxed content, never raw third-party
 * origins). See openspec design Decision 5.
 */
export const SIMULATOR_CONTENT_SRC_REGEX = /^\/api\/simulators\/[A-Za-z0-9]+\/content$/;

const MEDIA_TAGS = ['img', 'video', 'source', 'figure', 'figcaption', 'iframe'] as const;
const MEDIA_ATTRS = [
  'src',
  'srcset',
  'alt',
  'controls',
  'poster',
  'width',
  'height',
  'loop',
  'muted',
  'autoplay',
  'playsinline',
  'preload',
] as const;

export interface SanitizeOptions {
  /** Preserve inline rich-text media nodes (img/video/source/figure/figcaption) and simulator iframes. */
  allowMedia?: boolean;
}

/**
 * DOMPurify hooks are global to the module instance, so the policy hook is
 * installed exactly once. The policy itself is read from a module-level flag
 * set per sanitizeHtml() call — sanitizeHtml is synchronous, so there is no
 * interleaving risk.
 */
let mediaPolicyInstalled = false;
let stripMedia = false;

function installMediaPolicy(): void {
  if (mediaPolicyInstalled) return;

  DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    const tagName = data.tagName as (typeof MEDIA_TAGS)[number];

    if (stripMedia) {
      // allowMedia=false: drop every inline media node.
      if ((MEDIA_TAGS as readonly string[]).includes(tagName)) {
        node.parentNode?.removeChild(node);
      }
      return;
    }

    // allowMedia=true: keep media nodes; iframes ONLY for the simulator endpoint.
    if (tagName === 'iframe') {
      const src = (node as Element).getAttribute('src') || '';
      if (!SIMULATOR_CONTENT_SRC_REGEX.test(src)) {
        node.parentNode?.removeChild(node);
      }
    }
  });

  mediaPolicyInstalled = true;
}

/**
 * DOMPurify wrapper with a shared media allowlist so every renderer
 * (client-site, recruiter-site, admin previews) stays in lockstep.
 *
 * - Default (allowMedia: false): strips scripts/objects/iframes AND inline
 *   media nodes (img/video/source/figure/figcaption).
 * - allowMedia: true: preserves inline rich-text media; iframes are kept ONLY
 *   when `src` matches the simulator endpoint regex.
 */
export function sanitizeHtml(html: string, options: SanitizeOptions = {}): string {
  const { allowMedia = false } = options;

  installMediaPolicy();
  stripMedia = !allowMedia;

  return DOMPurify.sanitize(html, {
    ...(allowMedia ? { ADD_TAGS: [...MEDIA_TAGS], ADD_ATTR: [...MEDIA_ATTRS] } : {}),
  });
}