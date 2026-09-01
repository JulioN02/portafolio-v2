import { Node } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from '@tiptap/react';

/**
 * Node view for the SimulatorPlaceholder node. Renders a reserved placeholder
 * block ("Simulador") with an editable simulator ID. The simulator-embeds
 * phase (Phase 4) binds this placeholder to the sandboxed iframe embed.
 */
function SimulatorPlaceholderNodeView({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const { simulatorId } = node.attrs as { simulatorId: string };

  return (
    <NodeViewWrapper className="rte-simulator-placeholder">
      <div className="rte-simulator-box" data-simulator-id={simulatorId}>
        <span className="rte-simulator-icon" aria-hidden="true">
          ▶
        </span>
        <div className="rte-simulator-meta">
          <span className="rte-simulator-label">Simulador</span>
          <input
            className="rte-simulator-input"
            value={simulatorId}
            placeholder="ID del simulador"
            aria-label="ID del simulador"
            onChange={(e) => updateAttributes({ simulatorId: e.target.value })}
          />
        </div>
        <button type="button" className="rte-media-remove" onClick={() => deleteNode()}>
          Quitar
        </button>
      </div>
    </NodeViewWrapper>
  );
}

/**
 * Simulator Placeholder node: an atomic block insertable between paragraphs
 * that serializes to `<div data-simulator-id="...">`. The iframe binding is
 * implemented in the simulator-embeds phase.
 */
export const SimulatorPlaceholder = Node.create({
  name: 'simulatorPlaceholder',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      simulatorId: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-simulator-id') ?? '',
        renderHTML: (attributes) => ({ 'data-simulator-id': attributes.simulatorId }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-simulator-id]' }];
  },

  renderHTML({ node }) {
    return ['div', { 'data-simulator-id': node.attrs.simulatorId }];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SimulatorPlaceholderNodeView);
  },
});