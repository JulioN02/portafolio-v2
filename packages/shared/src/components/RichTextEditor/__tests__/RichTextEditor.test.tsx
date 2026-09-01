// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RichTextEditor } from '../RichTextEditor';

// jsdom does not implement Range geometry; ProseMirror's scrollToSelection
// calls range.getClientRects() during DOM changes. Provide no-op rects so the
// editor can apply input events in tests.
if (typeof Range !== 'undefined') {
  const emptyRectList = {
    length: 0,
    item: () => null,
    [Symbol.iterator]: Array.prototype[Symbol.iterator],
  } as DOMRectList;
  Range.prototype.getClientRects = () => emptyRectList;
  Range.prototype.getBoundingClientRect = () => ({
    left: 0,
    top: 0,
    right: 1,
    bottom: 1,
    width: 1,
    height: 1,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
}

describe('RichTextEditor component', () => {
  it('initializes from HTML: parses and renders the content for editing', () => {
    const { container } = render(
      <RichTextEditor
        value="<h2>Título</h2><p>Hello <strong>world</strong></p>"
        onChange={() => {}}
      />,
    );

    const editable = container.querySelector('[contenteditable="true"]');
    expect(editable).not.toBeNull();
    expect(editable!.textContent).toContain('Hello world');
    expect(editable!.querySelector('strong')?.textContent).toBe('world');
    expect(editable!.querySelector('h2')?.textContent).toBe('Título');
  });

  it('emits serialized HTML on change', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<RichTextEditor value="<p>Hola</p>" onChange={onChange} />);

    const editable = container.querySelector('[contenteditable="true"]') as HTMLElement;
    expect(editable).not.toBeNull();

    // Focus and place the caret at the end of the content (jsdom has no
    // element geometry, so clicks land at position 0).
    editable.focus();
    const selection = window.getSelection()!;
    const range = document.createRange();
    range.selectNodeContents(editable);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);

    await user.keyboard(' mundo');

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0] as string;
    expect(lastCall).toContain('Hola mundo');
  });

  it('renders the toolbar with media insert buttons (neutral Spanish labels)', () => {
    render(<RichTextEditor value="<p>x</p>" onChange={() => {}} />);

    expect(screen.getByRole('button', { name: 'Insertar imagen' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Insertar video' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Insertar simulador' })).toBeInTheDocument();
  });

  it('applies the minHeight prop to the editable area', () => {
    const { container } = render(
      <RichTextEditor value="<p>x</p>" onChange={() => {}} minHeight={300} />,
    );
    const editable = container.querySelector('[contenteditable="true"]');
    expect(editable?.getAttribute('style')).toContain('min-height: 300px');
  });
});