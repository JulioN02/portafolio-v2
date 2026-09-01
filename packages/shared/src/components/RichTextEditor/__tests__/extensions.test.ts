// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { Editor } from '@tiptap/react';
import { buildEditorExtensions } from '../extensions';
import { sanitizeHtml } from '../../../utils/sanitize';

function createEditor(content: string): Editor {
  return new Editor({ extensions: buildEditorExtensions(), content });
}

describe('RichTextEditor extensions (serialization)', () => {
  it('InlineImage: preserves an existing <figure><img src alt></figure> between paragraphs', () => {
    const editor = createEditor(
      '<p>Primero</p><figure><img src="/uploads/x.png" alt="Diagrama"></figure><p>Segundo</p>',
    );
    const html = editor.getHTML();
    editor.destroy();

    expect(html).toContain('<figure><img src="/uploads/x.png" alt="Diagrama"></figure>');
    expect(html).toContain('<p>Primero</p>');
    expect(html).toContain('<p>Segundo</p>');
  });

  it('InlineImage: inserting an image between paragraphs serializes to figure>img', () => {
    const editor = createEditor('<p>Primero</p><p>Segundo</p>');
    editor
      .chain()
      .insertContent({ type: 'inlineImage', attrs: { src: '/uploads/y.png', alt: 'Esquema' } })
      .run();
    const html = editor.getHTML();
    editor.destroy();

    expect(html).toContain('<figure><img src="/uploads/y.png" alt="Esquema"></figure>');
  });

  it('InlineVideo: roundtrips <video src controls> markup', () => {
    const editor = createEditor(
      '<p>Intro</p><video src="/uploads/v.mp4" controls></video><p>Fin</p>',
    );
    const html = editor.getHTML();
    editor.destroy();

    expect(html).toContain('<video src="/uploads/v.mp4"');
    expect(html).toContain('controls');
    expect(html).toContain('<p>Intro</p>');
  });

  it('InlineVideo: inserting a video serializes to <video src controls>', () => {
    const editor = createEditor('<p>Intro</p><p>Fin</p>');
    editor
      .chain()
      .insertContent({ type: 'inlineVideo', attrs: { src: '/uploads/v2.mp4' } })
      .run();
    const html = editor.getHTML();
    editor.destroy();

    expect(html).toContain('<video src="/uploads/v2.mp4"');
    expect(html).toContain('controls');
  });

  it('SimulatorPlaceholder: roundtrips <div data-simulator-id> markup', () => {
    const editor = createEditor(
      '<p>Intro</p><div data-simulator-id="abc123"></div><p>Fin</p>',
    );
    const html = editor.getHTML();
    editor.destroy();

    expect(html).toContain('<div data-simulator-id="abc123"></div>');
  });

  it('SimulatorPlaceholder: inserting the placeholder serializes to data-simulator-id markup', () => {
    const editor = createEditor('<p>Intro</p><p>Fin</p>');
    editor
      .chain()
      .insertContent({ type: 'simulatorPlaceholder', attrs: { simulatorId: 'sim-9' } })
      .run();
    const html = editor.getHTML();
    editor.destroy();

    expect(html).toContain('data-simulator-id="sim-9"');
  });

  it('supports headings h1–h4 and drops h5+ on parse', () => {
    const editor = createEditor(
      '<h1>A</h1><h2>B</h2><h3>C</h3><h4>D</h4><h5>E</h5><p>F</p>',
    );
    const html = editor.getHTML();
    editor.destroy();

    expect(html).toContain('<h1>A</h1>');
    expect(html).toContain('<h2>B</h2>');
    expect(html).toContain('<h3>C</h3>');
    expect(html).toContain('<h4>D</h4>');
    expect(html).not.toContain('<h5');
  });

  it('output stays sanitizable: media nodes preserved and scripts stripped by the media allowlist', () => {
    const editor = createEditor(
      '<p>Intro</p><figure><img src="/uploads/x.png" alt="A"></figure><video src="/uploads/v.mp4" controls></video><p>Fin</p>',
    );
    const raw = editor.getHTML();
    editor.destroy();

    // Simulate a hostile value injected before render-time sanitization.
    const safe = sanitizeHtml(`${raw}<script>alert(1)</script>`, { allowMedia: true });

    expect(safe).toContain('<figure><img src="/uploads/x.png" alt="A"></figure>');
    expect(safe).toContain('<video src="/uploads/v.mp4"');
    expect(safe).not.toContain('<script');
    expect(safe).toContain('<p>Fin</p>');
  });
});