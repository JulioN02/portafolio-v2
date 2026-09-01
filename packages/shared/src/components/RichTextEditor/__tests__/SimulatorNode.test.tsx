// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  SimulatorNode,
  buildSimulatorSrc,
  SIMULATOR_DEFAULT_WIDTH,
  SIMULATOR_DEFAULT_HEIGHT,
} from '../SimulatorNode';
import { SimulatorSection } from '../SimulatorEmbeds';

describe('SimulatorNode', () => {
  it('renders an iframe with sandbox="allow-scripts" and NO allow-same-origin', () => {
    render(<SimulatorNode simulatorId="abc123" />);

    const iframe = screen.getByTitle('Simulador') as HTMLIFrameElement;
    expect(iframe).toBeInTheDocument();
    // src is ALWAYS the dedicated serving endpoint (relative path preserved).
    expect(iframe.getAttribute('src')).toBe('/api/simulators/abc123/content');
    // SECURITY INVARIANT: scripts allowed, same-origin privileges NOT granted.
    expect(iframe.getAttribute('sandbox')).toBe('allow-scripts');
    expect(iframe.getAttribute('sandbox')).not.toContain('allow-same-origin');
  });

  it('applies default dimensions 800×600', () => {
    render(<SimulatorNode simulatorId="abc123" />);

    const iframe = screen.getByTitle('Simulador') as HTMLIFrameElement;
    expect(iframe.getAttribute('width')).toBe(String(SIMULATOR_DEFAULT_WIDTH));
    expect(iframe.getAttribute('height')).toBe(String(SIMULATOR_DEFAULT_HEIGHT));
  });

  it('honors explicit width/height and a custom title', () => {
    render(<SimulatorNode simulatorId="abc123" width={900} height={700} title="Demo" />);

    const iframe = screen.getByTitle('Demo') as HTMLIFrameElement;
    expect(iframe.getAttribute('width')).toBe('900');
    expect(iframe.getAttribute('height')).toBe('700');
  });

  it('renders nothing when the simulator id is not a safe token', () => {
    render(<SimulatorNode simulatorId="../../etc/passwd" />);

    expect(document.querySelector('iframe')).toBeNull();
  });
});

describe('buildSimulatorSrc', () => {
  it('accepts alphanumeric ids (cuid-safe tokens)', () => {
    expect(buildSimulatorSrc('cmabc123')).toBe('/api/simulators/cmabc123/content');
  });

  it('rejects unsafe ids (no path traversal / URLs)', () => {
    expect(buildSimulatorSrc('../../etc/passwd')).toBeNull();
    expect(buildSimulatorSrc('a/b')).toBeNull();
    expect(buildSimulatorSrc('https://evil.com')).toBeNull();
  });
});

describe('SimulatorSection', () => {
  it('renders a standalone section containing the sandboxed iframe', () => {
    const { container } = render(<SimulatorSection simulatorId="sec1" title="Standalone" />);

    const section = container.querySelector('[data-simulator-section="true"]');
    expect(section).not.toBeNull();
    const iframe = section!.querySelector('iframe') as HTMLIFrameElement;
    expect(iframe).not.toBeNull();
    expect(iframe.getAttribute('sandbox')).toBe('allow-scripts');
    expect(iframe.getAttribute('sandbox')).not.toContain('allow-same-origin');
    expect(iframe.getAttribute('src')).toBe('/api/simulators/sec1/content');
  });
});