import { rateLimit } from 'express-rate-limit';

/**
 * Brute-force protection (OWASP recommended controls).
 *
 * - `authLimiter`: strict per-IP limiter for credential-entry endpoints
 *   (login + verification code). 5 attempts per 15 minutes.
 * - `apiLimiter`: general per-IP limiter for every `/api` request.
 *   300 requests per minute (~5 req/s) — generous for API clients but
 *   still caps obvious abuse.
 *
 * NOTE: limiters are in-memory (per-process). On horizontally-scaled
 * deployments they must be backed by a shared store (Redis/Memcached).
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // 5 tries per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many attempts. Please try again later.',
    code: 'RATE_LIMITED',
  },
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 300, // 300 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many requests. Please slow down.',
    code: 'RATE_LIMITED',
  },
});

/**
 * Dedicated limiter for public contact submission endpoints
 * (POST /api/contact/client + /api/contact/recruiter).
 *
 * - `CONTACT_RATE_LIMIT_MAX` (default 5): submissions per window per IP.
 * - `CONTACT_RATE_LIMIT_WINDOW_MINUTES` (default 10): window length.
 *
 * In-memory (per-process) store: on serverless each isolate counts separately —
 * documented limitation; honeypot + Turnstile carry the real load.
 */
export const contactLimiter = rateLimit({
  windowMs:
    (parseInt(process.env.CONTACT_RATE_LIMIT_WINDOW_MINUTES || '10', 10) || 10) *
    60 *
    1000,
  limit: parseInt(process.env.CONTACT_RATE_LIMIT_MAX || '5', 10) || 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many contact submissions. Please try again later.',
    code: 'RATE_LIMITED',
  },
});