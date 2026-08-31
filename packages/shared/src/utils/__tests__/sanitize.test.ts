// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { sanitizeHtml, SIMULATOR_CONTENT_SRC_REGEX } from '../sanitize';

describe('sanitizeHtml', () => {
  describe('default (allowMedia: false)', () => {
    it('strips script tags', () => {
      const result = sanitizeHtml('<script>alert("xss")</script><p>Hola</p>');
      expect(result).not.toContain('<script');
      expect(result).toContain('<p>Hola</p>');
    });

    it('strips object and embed tags', () => {
      const result = sanitizeHtml('<object data="x.swf"></object><embed src="y.swf"><p>ok</p>');
      expect(result).not.toContain('<object');
      expect(result).not.toContain('<embed');
      expect(result).toContain('<p>ok</p>');
    });

    it('strips iframes (even simulator ones)', () => {
      const result = sanitizeHtml('<iframe src="/api/simulators/abc123/content"></iframe><p>ok</p>');
      expect(result).not.toContain('iframe');
      expect(result).toContain('<p>ok</p>');
    });

    it('strips inline media (img/figure/video) by default', () => {
      const result = sanitizeHtml('<figure><img src="/uploads/x.png"><figcaption>cap</figcaption></figure><video src="/uploads/v.mp4"></video>');
      expect(result).not.toContain('<img');
      expect(result).not.toContain('<video');
      expect(result).not.toContain('<figure');
      expect(result).not.toContain('<figcaption');
    });
  });

  describe('allowMedia: true', () => {
    it('preserves figure + img (inline rich-text node)', () => {
      const result = sanitizeHtml('<figure><img src="/uploads/x.png"></figure>', { allowMedia: true });
      expect(result).toContain('<figure>');
      expect(result).toContain('<img src="/uploads/x.png"');
    });

    it('preserves figcaption', () => {
      const result = sanitizeHtml('<figure><img src="/uploads/x.png"><figcaption>Caption</figcaption></figure>', { allowMedia: true });
      expect(result).toContain('<figcaption>Caption</figcaption>');
    });

    it('preserves video with source child', () => {
      const result = sanitizeHtml('<video controls><source src="/uploads/v.mp4"></video>', { allowMedia: true });
      expect(result).toContain('<video');
      expect(result).toContain('<source src="/uploads/v.mp4"');
    });

    it('preserves an iframe pointing to the simulator content endpoint', () => {
      const result = sanitizeHtml('<iframe src="/api/simulators/abc123/content"></iframe>', { allowMedia: true });
      expect(result).toContain('<iframe src="/api/simulators/abc123/content"');
    });

    it('strips an iframe pointing to any other origin', () => {
      const result = sanitizeHtml('<iframe src="https://evil.example.com/x"></iframe><p>ok</p>', { allowMedia: true });
      expect(result).not.toContain('iframe');
      expect(result).toContain('<p>ok</p>');
    });

    it('strips an iframe with a non-matching local path', () => {
      const result = sanitizeHtml('<iframe src="/api/projects/foo"></iframe>', { allowMedia: true });
      expect(result).not.toContain('iframe');
    });

    it('still strips scripts when media is allowed', () => {
      const result = sanitizeHtml('<script>alert(1)</script><img src="/uploads/x.png">', { allowMedia: true });
      expect(result).not.toContain('<script');
      expect(result).toContain('<img src="/uploads/x.png"');
    });
  });

  it('keeps safe HTML identical (no safe content lost)', () => {
    const input = '<p>Hello <strong>world</strong></p>';
    expect(sanitizeHtml(input)).toBe(input);
  });

  it('exports the simulator iframe src regex', () => {
    expect(SIMULATOR_CONTENT_SRC_REGEX.test('/api/simulators/abc123/content')).toBe(true);
    expect(SIMULATOR_CONTENT_SRC_REGEX.test('/api/simulators/abc/content')).toBe(true);
    expect(SIMULATOR_CONTENT_SRC_REGEX.test('/api/simulators/abc/other')).toBe(false);
    expect(SIMULATOR_CONTENT_SRC_REGEX.test('https://evil.com/api/simulators/abc/content')).toBe(false);
  });
});