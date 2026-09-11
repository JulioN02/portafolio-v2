import { type Request, type Response, type NextFunction } from 'express';

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/** Single shape for every Turnstile failure (missing/invalid/failed verification). */
function rejectTurnstile(res: Response): void {
  res.status(400).json({
    message: 'Turnstile verification failed',
    code: 'TURNSTILE_FAILED',
  });
}

/**
 * Cloudflare Turnstile server-side verification middleware.
 *
 * - When `TURNSTILE_SECRET_KEY` is unset the middleware is skipped entirely
 *   (graceful fallback — honeypot + contact limiter stay active).
 * - Otherwise the request MUST carry a non-empty `turnstileToken` in the body,
 *   which is verified against the Cloudflare siteverify endpoint with the
 *   client IP (`req.ip` — requires `app.set('trust proxy', 1)`, set in app.ts).
 * - Any missing/invalid/failed verification → 400 `{ code: 'TURNSTILE_FAILED' }`.
 *
 * The token is transient: it is never persisted (Zod strips it as an unknown
 * key in the controller, and the service only persists known fields).
 */
export async function turnstileVerify(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return next();
  }

  const token = (req.body as Record<string, unknown> | undefined)?.turnstileToken;
  if (typeof token !== 'string' || token.trim() === '') {
    rejectTurnstile(res);
    return;
  }

  try {
    const form = new URLSearchParams({
      secret,
      response: token,
      remoteip: req.ip ?? '',
    });

    const response = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      body: form,
    });

    const result = (await response.json()) as { success?: boolean };

    if (result.success !== true) {
      rejectTurnstile(res);
      return;
    }

    next();
  } catch {
    rejectTurnstile(res);
  }
}