import { describe, it, expect } from 'vitest';
import { PROFILE } from '@jsoft/shared';
import { buildMetaTitle } from './buildMetaTitle';

describe('buildMetaTitle', () => {
  it('replaces the {name} token with PROFILE.fullName', () => {
    expect(buildMetaTitle('{name} | Backend')).toBe(`${PROFILE.fullName} | Backend`);
  });

  it('replaces every occurrence of the token', () => {
    expect(buildMetaTitle('{name} | Proyectos | {name}')).toBe(
      `${PROFILE.fullName} | Proyectos | ${PROFILE.fullName}`,
    );
  });

  it('returns the template unchanged when no token is present', () => {
    expect(buildMetaTitle('Blog')).toBe('Blog');
  });
});
