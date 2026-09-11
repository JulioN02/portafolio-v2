import { describe, it, expect } from 'vitest';
import { PROFILE } from '@jsoft/shared';
import html from '../../../index.html?raw';

describe('recruiter-site/index.html canonical metadata (seo)', () => {
  it('uses PROFILE.fullName and the canonical role in title/description', () => {
    expect(html).toContain(PROFILE.fullName);
    expect(html).toContain(PROFILE.role.es);
  });

  it('does not contain the stale "Julio César" / Full Stack identity', () => {
    expect(html).not.toContain('Julio César');
    expect(html).not.toMatch(/full\s*stack/i);
  });

  it('carries the sync comment pointing at PROFILE', () => {
    expect(html).toContain('PROFILE.fullName');
  });
});