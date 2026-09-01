import { Node } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from '@tiptap/react';

/**
 * Node view for the InlineVideo node. Renders a `<video src controls>` player
 * with an editable URL field. Serialization emits non-executable media markup
 * compatible with the shared media sanitize allowlist.
 */
function InlineVideoNodeView({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const { src } = node.attrs as { src: string };

  return (
    <NodeViewWrapper className="rte-media-node">
      <div className="rte-media-figure">
        {src ? (
          <video src={src} controls className="rte-video" />
        ) : (
          <span className="rte-media-empty">Video sin URL</span>
        )}
      </div>
      <div className="rte-media-controls">
        <input
          className="rte-media-input"
          value={src}
          placeholder="URL del video"
          aria-label="URL del video"
          onChange={(e) => updateAttributes({ src: e.target.value })}
        />
        <button type="button" className="rte-media-remove" onClick={() => deleteNode()}>
          Quitar
        </button>
      </div>
    </NodeViewWrapper>
  );
}

/**
 * Inline Video node: an atomic block insertable between paragraphs (local
 * upload URL or remote URL) that serializes to `<video src controls>`.
 */
export const InlineVideo = Node.create({
  name: 'inlineVideo',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: '',
        parseHTML: (element) => element.getAttribute('src') ?? '',
        renderHTML: (attributes) => ({ src: attributes.src }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'video[src]' }];
  },

  renderHTML({ node }) {
    return ['video', { src: node.attrs.src, controls: 'controls' }];
  },

  addNodeView() {
    return ReactNodeViewRenderer(InlineVideoNodeView);
  },
});