import { describe, expect, it } from 'vitest';
import clientNginx from '../../../client-site/nginx.conf?raw';
import recruiterNginx from '../../nginx.conf?raw';
import rootVercel from '../../../vercel.json?raw';

describe('public deployment CSP contracts', () => {
  it('keeps the static sites compatible with same-origin assets, API, uploads and embeds', () => {
    for (const contents of [clientNginx, recruiterNginx]) {
      expect(contents).toContain("Content-Security-Policy");
      expect(contents).toContain("connect-src 'self' https://portafolio-v2-api-v2.vercel.app");
      expect(contents).toContain("img-src 'self' https: data:");
      expect(contents).toContain("frame-src 'self'");
    }
  });

  it('keeps the root API deployment headers restrictive without changing API routing', () => {
    const contents = rootVercel;
    expect(contents).toContain('Content-Security-Policy');
    expect(contents).toContain('api/build/index.cjs');
    expect(contents).toContain("connect-src 'self' https://portafolio-v2-api-v2.vercel.app");
  });
});
