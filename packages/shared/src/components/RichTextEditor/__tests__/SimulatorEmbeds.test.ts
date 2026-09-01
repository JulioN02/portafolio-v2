// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderSimulatorEmbeds } from '../SimulatorEmbeds';

describe('renderSimulatorEmbeds', () => {
  it('replaces <div data-simulator-id> placeholders with sandboxed iframes', () => {
    const html =
      '<p>Intro</p><div data-simulator-id="abc123"></div><p>Fin</p>';

    const result = renderSimulatorEmbeds(html);

    expect(result).toContain('<p>Intro</p>');
    expect(result).toContain('<p>Fin</p>');
    // Placeholder div is gone, sandboxed iframe to the dedicated endpoint is in.
    expect(result).not.toContain('data-simulator-id');
    expect(result).toContain('<iframe src="/api/simulators/abc123/content"');
    expect(result).toContain('sandbox="allow-scripts"');
    // SECURITY INVARIANT: never allow-same-origin.
    expect(result).not.toContain('allow-same-origin');
  });

  it('removes placeholders with unsafe ids (no injection into src)', () => {
    const html = '<div data-simulator-id="../../etc/passwd"></div><p>ok</p>';

    const result = renderSimulatorEmbeds(html);

    expect(result).not.toContain('iframe');
    expect(result).toContain('<p>ok</p>');
  });

  it('strips scripts while keeping the embed', () => {
    const html = '<script>alert(1)</script><div data-simulator-id="abc123"></div>';

    const result = renderSimulatorEmbeds(html);

    expect(result).not.toContain('<script');
    expect(result).toContain('sandbox="allow-scripts"');
  });

  it('hardens hand-written simulator iframes by forcing the sandbox attribute', () => {
    // Author hand-wrote an iframe that passes the sanitize allowlist (src
    // matches the dedicated endpoint) but omitted the sandbox attribute.
    const html = '<iframe src="/api/simulators/abc123/content"></iframe>';

    const result = renderSimulatorEmbeds(html);

    expect(result).toContain('<iframe src="/api/simulators/abc123/content"');
    expect(result).toContain('sandbox="allow-scripts"');
    expect(result).not.toContain('allow-same-origin');
  });

  it('strips allow-same-origin from hand-written simulator iframes (strict invariant)', () => {
    // An author-supplied sandbox that grants same-origin privileges MUST be
    // neutralized: the transform forces sandbox="allow-scripts" exactly.
    const html =
      '<iframe src="/api/simulators/abc123/content" sandbox="allow-scripts allow-same-origin"></iframe>';

    const result = renderSimulatorEmbeds(html);

    expect(result).toContain('<iframe src="/api/simulators/abc123/content"');
    expect(result).toContain('sandbox="allow-scripts"');
    expect(result).not.toContain('allow-same-origin');
  });

  it('keeps inline media (figure/img/video) intact next to embeds', () => {
    const html =
      '<figure><img src="/uploads/x.png"></figure><div data-simulator-id="abc123"></div>';

    const result = renderSimulatorEmbeds(html);

    expect(result).toContain('<figure>');
    expect(result).toContain('<img src="/uploads/x.png"');
    expect(result).toContain('sandbox="allow-scripts"');
  });

  it('applies the configured width/height to transformed embeds', () => {
    const html = '<div data-simulator-id="abc123"></div>';

    const result = renderSimulatorEmbeds(html, { width: 900, height: 700 });

    expect(result).toContain('width="900"');
    expect(result).toContain('height="700"');
  });
});