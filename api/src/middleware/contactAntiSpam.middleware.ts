import { type Request, type Response, type NextFunction } from 'express';
import { contactLimiter } from './rateLimit.middleware.js';
import { turnstileVerify } from './turnstile.middleware.js';

const HONEYPOT_FIELD = 'website';

/**
 * Honeypot anti-spam middleware for public contact submission endpoints.
 *
 * A hidden `website` input is rendered on both public contact forms; bots that
 * auto-fill every input will populate it. When the raw body carries a non-empty
 * `website` value we respond with the SAME generic success shape a real
 * submission would receive (200 `{ message: 'Contact form submitted
 * successfully' }`) and STOP the chain: no DB row, no further middleware, no
 * logging of the payload — zero signal to the bot.
 */
export function honeypotMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const website = (req.body as Record<string, unknown> | undefined)?.[HONEYPOT_FIELD];

  if (typeof website === 'string' && website.trim() !== '') {
    res.status(200).json({ message: 'Contact form submitted successfully' });
    return;
  }

  next();
}

/**
 * Composed anti-spam chain applied to POST /client + POST /recruiter.
 * Order matters: honeypot first (cheapest, stops bots before any budget),
 * then the dedicated limiter, then optional Turnstile verification.
 */
export const contactAntiSpam = [honeypotMiddleware, contactLimiter, turnstileVerify];