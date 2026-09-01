import { ValidationError } from '../utils/errors.js';

/**
 * Upload bucket allowlist (config-driven).
 *
 * Decision (documented at apply): a config constant with an env override.
 * `UPLOAD_BUCKET_ALLOWLIST` (comma-separated) overrides the default constant,
 * so operators can add buckets at deploy time without a code change. This
 * satisfies the upload-hardening risk note ("allowlist must be config-driven
 * to avoid redeploys when adding buckets").
 */
export const DEFAULT_UPLOAD_BUCKET = 'general';

/** Buckets in use by the app today + simulators (Phase 4). */
const DEFAULT_BUCKET_ALLOWLIST = [
  'servicios',
  'productos',
  'herramientas',
  'blog',
  'proyectos',
  'casos-exito',
  'general',
  'simulators',
];

/** Buckets the server accepts for uploads. */
export function getBucketAllowlist(): string[] {
  const env = process.env.UPLOAD_BUCKET_ALLOWLIST;
  if (env) {
    return env
      .split(',')
      .map((bucket) => bucket.trim())
      .filter(Boolean);
  }
  return DEFAULT_BUCKET_ALLOWLIST;
}

/**
 * Resolve and validate the `bucket` parameter from a request:
 *  - missing/empty  → default bucket (general)
 *  - allowed        → the requested bucket
 *  - unknown        → ValidationError (400), nothing stored
 */
export function resolveBucket(bucket?: string): string {
  const value = (bucket || '').trim();
  if (!value) return DEFAULT_UPLOAD_BUCKET;
  const allowlist = getBucketAllowlist();
  if (!allowlist.includes(value)) {
    throw new ValidationError(`Unknown bucket: "${value}". Allowed: ${allowlist.join(', ')}`);
  }
  return value;
}