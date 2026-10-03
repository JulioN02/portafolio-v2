# Public deployment foundations

The public Vercel and Nginx configurations apply `nosniff`, restrictive referrer and permissions policies, frame protection, and a conservative CSP. HSTS is intentionally not emitted by the HTTP Nginx configuration: it must only be enabled at the HTTPS edge after TLS is guaranteed.

Both sites use SPA rewrites. Their client-side `*` routes render the custom 404 page, but an SPA rewrite can still return HTTP 200. A host-level true-404 rule or edge middleware is required if HTTP status correctness is needed.

No non-essential analytics or tracking scripts are registered in this batch. Consent storage is not authentication and never gates essential navigation or contact functionality.

## Batch 2 release checklist (manual)

Because this repository has no E2E runner, deploy reviewers must record these checks for each public site before release:

- Keyboard-only: consent controls, legal links, share fallback, forms, and the mobile contact CTA receive visible focus; the CTA does not cover the focused control.
- Screen reader: the consent dialog has an accessible name and action labels; share success/failure is announced; every route has one H1 and logical H2/H3 order.
- Mobile/virtual keyboard: at narrow viewport widths, scroll to the final content and focus a form control while the keyboard is open; the reserved CTA space and `env(keyboard-inset-height)` fallback keep content reachable.
- Reduced motion: with `prefers-reduced-motion: reduce`, essential content and controls remain available without waiting for animation.
- Deployment: inspect `Content-Security-Policy`, CORS/API calls, asset and `/uploads/` loading, and the SPA custom 404 status limitation at the deployed Vercel/Nginx edge.
- Security: run the tracked-tree/config secret scan without printing values and confirm no non-essential script runs before consent.
