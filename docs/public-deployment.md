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

## Homepage sections (site-sections) — production diagnosis

The client homepage reads `/api/site-sections` to decide which dynamic sections (services, success cases, products, tools) render and in what order. The client now falls back to the default order when the request errors, is empty, or every section is hidden — it never silently removes all dynamic sections.

Before blaming the online editor, verify the data path:

1. Curl the deployed API from the browser origin:
   `curl -i https://<api-host>/api/site-sections`
   - A non-200 or HTML response means the client falls back to defaults (editor changes will not appear).
2. Check the `SiteSection` table row count and keys in the deployed database. If the table is empty, the seed has not run in that environment.
3. Confirm the deployed client-site commit includes the section-rendering fix (Home maps `services|success-cases|products|tools`). A stale deployment predating that code will not reflect editor changes regardless of the API.
4. Toggle visibility/order in the admin `Páginas` screen and verify the SAME `key` values (`services`, `success-cases`, `products`, `tools`) are sent by `PATCH /api/site-sections/:id` and `PUT /api/site-sections/reorder`.

Known limitation: HSTS is delegated to the edge, and SPA rewrites still return HTTP 200 for unknown routes (documented above).
