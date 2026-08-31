# Proposal: Project Publications

## Intent

Owner needs a real `Project` entity (practice projects), richer publications (tags, inline media, simulators), and a recruiter feed without the status-leak (aggregation returns non-PUBLISHED rows).

## Scope

### In Scope
1. `Project` model + API CRUD + admin CRUD + client `/proyectos` list/detail; `type` (QUICK|PROFESSIONAL) + `repositoryUrl`.
2. Blog tags (laboratorio/experimento/articulo, controlled) + public filters + admin UI.
3. Shared TipTap editor with inline Image/Video (Project/Product/Tool/Blog).
4. Simulators: per-publication HTML/CSS/JS in sandboxed iframe; storage/serving + security.
5. Recruiter reads real `Project`; fix leak (PUBLISHED only, deletedAt null); include 'laboratorio'/'experimento' posts.
6. Admin gaps: SuccessCase videos/links, Service includedItems/technicalExplanation editable; bucket param respected; SVG accept fix.

### Out of Scope
- Doc host; deep docs stay in repo/Obsidian
- Markdown; gallery captions; frontend test frameworks
- Free-text classification refactor
- Legacy blog rewrite (migration maps category→tags only)

## Capabilities

### New
- `projects`: Project model+API+admin+client pages
- `blog-tags`: controlled tags+filters+admin
- `rich-text-editor`: shared TipTap + inline Image/Video
- `simulator-embeds`: sandboxed HTML/CSS/JS embeds
- `upload-hardening`: bucket param, SVG accept, /uploads serving

### Modified (delta)
- `recruiter-projects`: real Project source + status filter + lab posts
- `sanitization`: inline-media allowlist; simulators via sandboxed iframe
- `blog-filters`: tags filter
- `blog-post-api`: tags field/endpoint
- `admin-success-cases-crud` / `admin-services-crud`: editable missing fields

## Approach

Phased (each phase shippable, spec-able alone):

| Phase | Deliverables |
|---|---|
| 1 Core | Project chain shared→api→admin→client-site; recruiter + status fix |
| 2 Blog+admin | Tags, filters, admin UI, form gaps, uploads |
| 3 Editor | TipTap→shared, inline Image/Video, adopt across forms |
| 4 Simulators | Sandboxed iframe section, upload/serving, CSP |

Ordering per phase: shared Zod → api (strict TDD) → frontends.

## Key Decisions

- **Real Project model** (not aggregation extension): stable client detail pages; aggregation stays recruiter-view only.
- **Simulator storage**: files in 'simulators' bucket, served with CSP `sandbox` headers; iframe `sandbox="allow-scripts"` (no allow-same-origin); not DOMPurify-rendered.
- **Tags replace free-text category** (seed migration; category kept as derived first-tag for API compat).
- **Labs count as projects**: recruiter includes 'laboratorio'/'experimento' (type 'laboratorio'); 'articulo' excluded.
- **Keep HTML storage** for rich text (TipTap getHTML), sanitize on render.
- **Divulgative linking**: `repositoryUrl`; deep docs stay in repo/Obsidian.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `api/prisma/schema.prisma` | Modified | +Project model, BlogPost.tags |
| `packages/shared/src/schemas/` | Modified | project schema, blog tags, editor UI |
| `api/src/{services,controllers,routes}/` | Modified | projects (new), upload fix, blog tags |
| `admin-panel/src/` | Modified | Project forms, tags UI, form gaps, ImageUploader |
| `client-site/src/pages/proyectos/` | New | list + detail pages |
| `recruiter-site/src/` | Modified | projects page, aggregation hooks |

## Risks

| Risk | L | Mitigation |
|---|---|---|
| XSS via simulators | High | sandbox attrs, CSP headers, size limits, no same-origin |
| Blast radius shared→3 frontends | Med | phased plan, per-phase typecheck |
| Status leak regression | Med | service tests assert PUBLISHED-only |
| Tag migration orphans seeds | Low | seed mapping migration |

## Rollback Plan

Per-phase: revert Prisma migration + unregister routes. Tags/Project additive — no data loss.

## Dependencies

Supabase bucket 'simulators' + bucket param fix; TipTap Image/Video extensions.

## Success Criteria

- [ ] Client `/proyectos` shows PUBLISHED Projects only
- [ ] Recruiter aggregation: PUBLISHED + deletedAt null only; labs included
- [ ] Blog tag filter works on client + recruiter
- [ ] Inline image/video renders sanitized in rich text
- [ ] Simulator XSS stays sandboxed
- [ ] API tests pass (70% coverage); typecheck 0 errors

## Spec Phase Inputs

Confirm: tag values; simulator storage (files vs blob); Project fields (type enum, repositoryUrl); category→tags mapping; per-phase spec files (5 new + 6 deltas).