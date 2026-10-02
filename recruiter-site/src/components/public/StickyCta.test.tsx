import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PROFILE } from '@jsoft/shared';
import { StickyCta } from './StickyCta';

describe('StickyCta', () => {
  it('keeps the approved profile contact action keyboard reachable', () => {
    render(<StickyCta />);

    expect(screen.getByRole('link', { name: 'Contactar por correo electrónico' })).toHaveAttribute(
      'href',
      `mailto:${PROFILE.email}`,
    );
  });
});
