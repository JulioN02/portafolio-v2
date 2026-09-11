// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { Turnstile } from '../Turnstile';
import type { TurnstileProps } from '../Turnstile';

/**
 * Cloudflare Turnstile widget (contact-anti-spam capability):
 *  - renders NOTHING when no siteKey is provided (graceful fallback)
 *  - injects the Cloudflare script once (id 'cf-turnstile-script',
 *    render=explicit) and renders the widget into the container
 *  - surfaces the solved token via onTokenChange
 *  - cleans up the widget on unmount
 */
describe('Turnstile', () => {
  const renderMock = vi.fn();
  const removeMock = vi.fn();
  const onTokenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    document.head.querySelectorAll('script#cf-turnstile-script').forEach((s) => s.remove());
    delete window.turnstile;
    renderMock.mockReturnValue('widget-1');
  });

  /** Renders with a siteKey while turnstile is NOT loaded, then simulates the script load. */
  function renderAndLoad(props: Partial<TurnstileProps> = {}) {
    delete window.turnstile;
    const utils = render(
      <Turnstile siteKey="0x4AAAAAAA-test" onTokenChange={onTokenChange} {...props} />,
    );
    const script = document.getElementById('cf-turnstile-script') as HTMLScriptElement;
    window.turnstile = { render: renderMock, remove: removeMock };
    act(() => {
      script.onload?.(new Event('load'));
    });
    return { ...utils, script };
  }

  it('renders nothing and injects no script when siteKey is missing (fallback)', () => {
    const { container } = render(<Turnstile onTokenChange={onTokenChange} />);

    expect(container.firstChild).toBeNull();
    expect(document.getElementById('cf-turnstile-script')).toBeNull();
    expect(renderMock).not.toHaveBeenCalled();
  });

  it('injects the Cloudflare script (render=explicit) and renders the widget with the siteKey', () => {
    const { script } = renderAndLoad();

    expect(script).not.toBeNull();
    expect(script.id).toBe('cf-turnstile-script');
    expect(script.src).toContain('challenges.cloudflare.com/turnstile/v0/api.js');
    expect(script.src).toContain('render=explicit');

    expect(renderMock).toHaveBeenCalledTimes(1);
    expect(renderMock).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({ sitekey: '0x4AAAAAAA-test' }),
    );
  });

  it('does NOT render the widget before the script has loaded', () => {
    delete window.turnstile;
    render(<Turnstile siteKey="0x4AAAAAAA-test" onTokenChange={onTokenChange} />);

    expect(renderMock).not.toHaveBeenCalled();
  });

  it('surfaces the solved token through onTokenChange', () => {
    renderAndLoad();

    const options = renderMock.mock.calls[0][1] as { callback?: (token: string) => void };
    act(() => {
      options.callback?.('token-123');
    });

    expect(onTokenChange).toHaveBeenCalledWith('token-123');
  });

  it('removes the widget on unmount', () => {
    const { unmount } = renderAndLoad();

    unmount();

    expect(removeMock).toHaveBeenCalledWith('widget-1');
  });
});