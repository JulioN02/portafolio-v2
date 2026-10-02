import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PROFILE } from '@jsoft/shared';
import { StickyCta } from './StickyCta';

describe('StickyCta', () => {
  it('exposes a client-specific accessible contact action', () => {
    render(<StickyCta />);
    expect(screen.getByRole('link', { name: 'Solicitar una propuesta por correo electrónico' })).toHaveAttribute('href', `mailto:${PROFILE.email}`);
  });
});
