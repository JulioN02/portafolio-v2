import { useEffect, useRef } from 'react';

/**
 * Ambient type for the Cloudflare Turnstile global API (loaded via script).
 * Rendered with render=explicit so we control exactly which container hosts
 * the widget (no auto-render conflicts with other instances).
 */
declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
        },
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

export interface TurnstileProps {
  /** Cloudflare Turnstile site key. When absent the widget renders nothing. */
  siteKey?: string;
  /** Called with the solved token (or empty string when expired/reset). */
  onTokenChange: (token: string) => void;
}

/**
 * NOTE: Class names are defined inline instead of CSS module import because
 * tsup strips CSS module mappings during build. The corresponding styles live
 * in Turnstile.module.css and are bundled into dist/index.css.
 */
const styles = {
  wrapper: 'turnstile-wrapper',
  widget: 'turnstile-widget',
};

const SCRIPT_ID = 'cf-turnstile-script';
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

/**
 * Cloudflare Turnstile widget (contact-anti-spam).
 *
 * - No siteKey → renders nothing (graceful fallback; honeypot + limiter carry
 *   the load on the API side).
 * - Injects the Cloudflare script once (guarded by script id) and renders the
 *   widget with render=explicit once the API is available.
 * - Solved tokens are surfaced via `onTokenChange`; the widget is removed on
 *   unmount.
 */
export function Turnstile({ siteKey, onTokenChange }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  // Keep the latest callback without re-rendering the widget on parent renders.
  const onTokenChangeRef = useRef(onTokenChange);
  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  });

  useEffect(() => {
    if (!siteKey) {
      return;
    }

    let cancelled = false;

    const tryRender = () => {
      if (cancelled || !containerRef.current || !window.turnstile) {
        return;
      }
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => onTokenChangeRef.current(token),
        'expired-callback': () => onTokenChangeRef.current(''),
        'error-callback': () => onTokenChangeRef.current(''),
      });
    };

    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    if (existingScript) {
      if (window.turnstile) {
        tryRender();
      } else {
        // Script tag present but API not loaded yet — wait for the load event.
        const onLoad = () => tryRender();
        existingScript.addEventListener('load', onLoad);
        return () => existingScript.removeEventListener('load', onLoad);
      }
    } else if (window.turnstile) {
      tryRender();
    } else {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => tryRender();
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey]);

  if (!siteKey) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <div ref={containerRef} className={styles.widget} />
    </div>
  );
}