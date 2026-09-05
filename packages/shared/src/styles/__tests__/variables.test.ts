import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const cssPath = fileURLToPath(new URL('../variables.css', import.meta.url));
const css = readFileSync(cssPath, 'utf-8');

describe('variables.css design tokens (D3, CHC-7)', () => {
  it('maps --text-* aliases to the existing --font-size-* tokens', () => {
    const sizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'];
    for (const size of sizes) {
      expect(css, `--text-${size}`).toContain(`--text-${size}: var(--font-size-${size})`);
    }
  });

  it('defines the WhatsApp brand colors', () => {
    expect(css).toContain('--color-whatsapp: #128C7E');
    expect(css).toContain('--color-whatsapp-hover: #0E7A6E');
  });
});