import { Node } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from '@tiptap/react';

/**
 * Node view for the InlineImage node. Renders the image between paragraphs
 * with editable URL/alt fields. Serialization (renderHTML) emits non-executable
 * `<figure><img src alt></figure>` markup compatible with the shared media
 * sanitize allowlist.
 */
function InlineImageNodeView({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const { src, alt } = node.attrs as { src: string; alt: string };

  return (
    <NodeViewWrapper className="rte-media-node">
      <figure className="rte-media-figure">
        {src ? (
          <img src={src} alt={alt} />
        ) : (
          <span className="rte-media-empty">Imagen sin URL</span>
        )}
        <figcaption className="rte-media-caption">{alt || 'Sin descripción'}</figcaption>
      </figure>
      <div className="rte-media-controls">
        <input
          className="rte-media-input"
          value={src}
          placeholder="URL de la imagen"
          aria-label="URL de la imagen"
          onChange={(e) => updateAttributes({ src: e.target.value })}
        />
        <input
          className="rte-media-input"
          value={alt}
          placeholder="Texto alternativo"
          aria-label="Texto alternativo"
          onChange={(e) => updateAttributes({ alt: e.target.value })}
        />
        <button type="button" className="rte-media-remove" onClick={() => deleteNode()}>
          Quitar
        </button>
      </div>
    </NodeViewWrapper>
  );
}

/**
 * Inline Image node: an atomic block insertable between paragraphs that
 * serializes to `<figure><img src alt></figure>`.
 */
export const InlineImage = Node.create({
  name: 'inlineImage',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: '',
        parseHTML: (element) =>
          element.querySelector('img')?.getAttribute('src') ?? element.getAttribute('src') ?? '',
        renderHTML: (attributes) => ({ src: attributes.src }),
      },
      alt: {
        default: '',
        parseHTML: (element) =>
          element.querySelector('img')?.getAttribute('alt') ?? element.getAttribute('alt') ?? '',
        renderHTML: (attributes) => ({ alt: attributes.alt }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'figure img[src]' }, { tag: 'img[src]' }];
  },

  renderHTML({ node }) {
    return ['figure', ['img', { src: node.attrs.src, alt: node.attrs.alt }]];
  },

  addNodeView() {
    return ReactNodeViewRenderer(InlineImageNodeView);
  },
});