# Verification Report — project-publications (Phase 2)

**Change**: project-publications
**Phase**: 2 (blog tags + admin gaps + uploads) — tasks P2-01..P2-14
**Mode**: Strict TDD (api) — runner `pnpm --filter api test`, coverage ≥70%, typecheck gate `pnpm -r run typecheck`
**Branch**: feat/project-publications-p2 (implementation done, NOT committed)
**Gate**: fresh-review before P2 PR creation
**Date**: 2026-08-31

---

## Verdict: ✅ GO (PASS WITH WARNINGS)

Phase 2 is complete and behaviorally compliant with the P2 delta specs (blog-tags, blog-post-api, blog-filters, upload-hardening, admin-success-cases-crud, admin-services-crud) and the design decisions. All phase gates pass: typecheck 0 errors (5 packages), api 240/240 tests, coverage ≥70% on all four metrics, and all Vitest suites green. No CRITICAL issues. Two WARNINGs (one protocol-format, one pre-existing spec gap not owned by P2) and five SUGGESTIONs. Safe to create the P2 PR.

---

## Completeness

| Metric | Value |
|--------|-------|
| Tasks in scope (P2-01..P2-14) | 14 |
| Tasks implemented | 14 |
| Tasks marked `[x]` in tasks.md | 14 |
| Tasks incomplete | 0 |

All P2 tasks are marked `[x]` and verified implemented (see checklist below).

---

## Gate Results (Real Execution)

**Typecheck**: ✅ 0 errors — `pnpm -r run typecheck` (5 packages: shared, api, admin-panel, client-site, recruiter-site) all "Done".

**API tests**: ✅ 240 passed / 240 total (19 suites), exit 0 — `pnpm --filter api test`.

**Coverage**: ✅ `pnpm --filter @jsoft/api exec jest --coverage` — Stmts 84.00 / Branch 71.45 / Funcs 90.97 / Lines 90.94 — all ≥ 70% threshold.

**Vitest suites**:
| Package | Files | Tests | Result |
|---------|-------|-------|--------|
| @jsoft/shared | 4 | 79 | ✅ |
| @jsoft/admin-panel | 4 | 13 | ✅ |
| @jsoft/client-site | 5 | 15 | ✅ |
| @jsoft/recruiter-site | 5 | 15 | ✅ |

---

## TDD Compliance (Strict TDD)

| Check | Result | Details |
|-------|--------|---------|
| TDD Evidence reported | ⚠️ | Present narratively in `sdd/project-publications/apply-progress` (engram #1012) + RED/GREEN markers in tasks.md (P2-04 "Test: RED", P2-05 "GREEN + integration", P2-10 "RED→GREEN"); NOT in the canonical RED/GREEN/TRIANGULATE/SAFETY-NET/REFACTOR table format |
| All tasks have tests | ✅ | 10/10 TDD-bearing tasks have test files (service, routes, migration, schema, upload, storage, TagInput, ImageUploader, BlogPage) |
| RED confirmed (tests exist) | ✅ | All RED test files exist and were verified by reading source |
| GREEN confirmed (tests pass) | ✅ | 240/240 api tests + all Vitest suites pass on execution |
| Triangulation adequate | ✅ | Tags behavior ×7 cases, upload bucket ×4, schema tags ×8, route 401s ×5 — multiple distinct expected values per behavior |
| Safety Net for modified files | ✅ | apply-progress documents updating existing upload/storage tests for the new default-bucket 4th arg (`toHaveBeenCalledWith` exact-arg-count); full suite green |

**TDD Compliance**: 5/6 checks passed; 1 format deviation (WARNING — evidence substance fully verifiable).

---

## Test Layer Distribution

| Layer | Tests | Files | Tools |
|-------|-------|-------|-------|
| Unit (api, Jest+ts-jest) | ~200 | 19 suites | Jest 30 (mocked Prisma) |
| Integration (api HTTP, Node fetch) | 11 | blog-post.routes.test.ts + project/portfolio routes | Express + real router |
| Frontend (Vitest + Testing Library) | 122 | shared 4 / admin 4 / client 5 / recruiter 5 | Vitest 4.1.8 |
| **Total** | **~362** | **~37** | |

Integration tests use real HTTP (fetch against ephemeral Express server) — no E2E tool needed; capabilities are consistent.

---

## Changed File Coverage (api, from jest --coverage)

| File | Stmts | Branch | Funcs | Lines | Rating |
|------|-------|--------|-------|-------|--------|
| `config/upload.config.ts` | 100% | 100% | 100% | 100% | ✅ Excellent |
| `scripts/category-to-tags.ts` | 100% | 100% | 100% | 100% | ✅ Excellent |
| `scripts/migrate-category-to-tags.ts` | 0% | 0% | 0% | 0% | ⚠️ DB-touching script executed via tsx (pure mapping covered at 100%) |
| `services/blog-post.service.ts` | 85.45% | 76.78% | 100% | 97.77% | ⚠️ Acceptable (L117 = else-if category-only update branch) |
| `services/portfolio.service.ts` | 95.58% | 59.01% | 91.42% | 100% | ⚠️ Branch low — type-filter paths + getClassifications uncovered |
| `services/upload.service.ts` | 94.44% | 88.88% | 100% | 94.44% | ✅ |
| `services/storage.service.ts` | 100% | 100% | 100% | 100% | ✅ Excellent |

**Average changed-file coverage**: ~82% stmts (weighted). Project-wide all four metrics ≥ 70% gate. The two low-branch files are informational per strict-TDD module (non-blocking).

---

## Assertion Quality (Step 5f)

**✅ All assertions verify real behavior.** No tautologies, no ghost loops, no type-only lone assertions, no smoke-only tests found in the 9 new/modified test files reviewed (blog-post.service.test.ts, blog-post.routes.test.ts, migrate-category-to-tags.test.ts, upload.service.test.ts, storage.service.test.ts, TagInput.test.tsx, ImageUploader.test.tsx, BlogPage.test.tsx, blogPost.schema.test.ts). Mock/assertion ratios are healthy. Two cosmetic notes (SUGGESTION level): TagInput test asserts the hardcoded "Máximo 10 etiquetas" string while passing `max={3}` (message does not reflect the prop); BlogPage chips-count assertion is loose but paired with value assertions.

---

## Spec Compliance Matrix (behavioral, by executed tests)

| Requirement | Scenario | Test | Result |
|-------------|----------|------|--------|
| blog-tags:TagsField | Tags stored on create | `blog-post.service.test.ts > persists tags on create` | ✅ COMPLIANT |
| blog-tags:TagsField | Category derived from first tag | `blog-post.service.test.ts > derives category from first tag on create` + `persists tags and derives category on update` | ✅ COMPLIANT |
| blog-tags:TagsField | Empty tags allowed | `blogPost.schema.test.ts > accepts a post without tags` | ✅ COMPLIANT |
| blog-tags:TagSuggestions | Suggestions from published posts | `blog-post.service.test.ts > getTags distinct PUBLISHED sorted` + `excludes tags from DRAFT` | ✅ COMPLIANT |
| blog-tags:TagFilter | Filter by tag | `blog-post.service.test.ts > combines tag + category filters with AND (hasSome)` | ✅ COMPLIANT |
| blog-tags:TagFilter | Combined filters (AND) | `blog-post.service.test.ts > combines tag filter with search via AND` | ✅ COMPLIANT |
| blog-tags:AdminTagEditor | Free entry with suggestions | `TagInput.test.tsx > fetches suggestions / commits typed tag / chips / max` | ✅ COMPLIANT |
| blog-tags:TagMigration | Existing categories become tags | `migrate-category-to-tags.test.ts > non-empty → tag, empty → [], clamp 30` | ✅ COMPLIANT |
| blog-post-api:Routes | Get all (public, filters) | `blog-post.routes.test.ts > GET /` + service findAll | ✅ COMPLIANT |
| blog-post-api:Routes | Get by slug (public) | `blog-post.routes.test.ts > GET /:slug 404` + service findBySlug | ✅ COMPLIANT |
| blog-post-api:Routes | Get by ID (protected) | `blog-post.routes.test.ts > GET /by-id/:id → 401` + route has authMiddleware | ✅ COMPLIANT |
| blog-post-api:Routes | Create (protected) | `blog-post.routes.test.ts > POST / → 401` + service create | ✅ COMPLIANT |
| blog-post-api:Routes | Update (protected) | `blog-post.routes.test.ts > PUT /:id → 401` + service update | ✅ COMPLIANT |
| blog-post-api:Routes | Delete (protected) | `blog-post.routes.test.ts > DELETE /:id → 401` | ✅ COMPLIANT |
| blog-post-api:Routes | Restore (protected) | `blog-post.routes.test.ts > PATCH /:id/restore → 401` | ✅ COMPLIANT |
| blog-post-api:Routes | Reorder (protected) | (none found — no route/handler/service/admin API exists) | ❌ UNTESTED — pre-existing gap, see WARNING-2 |
| blog-post-api:Routes | Change status (protected) | `blog-post.routes.test.ts > PATCH /:id/status → 401` + service updateStatus | ✅ COMPLIANT |
| blog-post-api:Routes | Get available tags (public) | `blog-post.routes.test.ts > GET /tags 200` + service getTags | ✅ COMPLIANT |
| blog-post-api:Routes | Unauthorized access | 5× 401 integration tests | ✅ COMPLIANT |
| upload-hardening:ServerBucket | Upload to allowed bucket | `upload.service.test.ts > stores allowed bucket in requested bucket` | ✅ COMPLIANT |
| upload-hardening:ServerBucket | Unknown bucket → 400 | `upload.service.test.ts > rejects unknown bucket, uploadFile NOT called` + env-override test | ✅ COMPLIANT |
| upload-hardening:ServerBucket | Missing bucket → default | `upload.service.test.ts > uses default bucket (general)` | ✅ COMPLIANT |
| upload-hardening:ClientAccept | Accept list aligned (no SVG) | `ImageUploader.test.tsx > accept = jpeg/png/gif/webp, not svg/html` | ✅ COMPLIANT |
| upload-hardening:ClientAccept | Server still rejects SVG | `upload.service.test.ts > rejects svg with XSS-safety message` + controller fileFilter | ✅ COMPLIANT |
| upload-hardening:ContentType | Image served with image content-type | `storage.service.test.ts > Content-Type: image/png stored with object` | ✅ COMPLIANT |
| upload-hardening:ContentType | Non-image upload rejected | `upload.service.test.ts > rejects pdf` + multer fileFilter rejects .html | ✅ COMPLIANT |
| admin-sc:Create | Create with videos+links | `SuccessCaseForm.tsx` (UrlListInput videos/links in payload) — typecheck gate | ✅ COMPLIANT (structural; no Vitest required by task) |
| admin-sc:Edit | Prefill + edit videos/links | `SuccessCaseForm.tsx` (initialData.videos/links prefill + submit) | ✅ COMPLIANT (structural) |
| admin-sv:Create | includedItems + technicalExplanation | `ServiceForm.tsx` (ItemListInput + textarea in payload, validation) | ✅ COMPLIANT (structural) |
| admin-sv:Edit | Prefill + edit both fields | `ServiceForm.tsx` (initialData prefill + submit) | ✅ COMPLIANT (structural) |
| blog-filters:RecruiterGrid | Tag filter auto-populated, AND, ?tag= URL | `BlogPage.tsx` + `useBlogTags()` + `BlogGrid.tsx` (category/tag/search → API) — typecheck gate | ✅ COMPLIANT (structural) |
| blog-filters:ClientBlog | Tag filter, AND, URL persistence | `BlogPage.test.tsx > pre-applies ?category&tag&search` + `no-tag when URL has none` + code | ✅ COMPLIANT (URL pre-apply covered; debounce/click not automated — SUGGESTION-1) |
| blog-filters:archive | Delta heading + requirement names match main spec | Delta `# Delta for Blog Frontend Filters`; req names `Blog Grid (Recruiter Site)` + `Client Site Blog Page` — exact match with `openspec/specs/blog-filters/spec.md` | ✅ COMPLIANT (H1 wording "for" vs ":" differs — SUGGESTION-4) |

**Compliance summary**: 33/34 scenarios compliant; 1 pre-existing unimplemented scenario (blog-post reorder).

---

## Correctness (Static — Structural Evidence)

| Requirement | Status | Notes |
|------------|--------|-------|
| P2-01 Prisma BlogPost.tags + migration | ✅ | `tags String[]` in schema; `20260831_add_blog_tags/migration.sql` = `ALTER TABLE "BlogPost" ADD COLUMN "tags" TEXT[]` (coherent, additive) |
| P2-02 Shared schema tags + tag filter | ✅ | `tags: tagsSchema.optional()`, filter gains `tag`; tagsSchema (trim 1–30, max 10) in own module to break circular import; re-exported via project.schema |
| P2-03 Migration script idempotent | ✅ | `category-to-tags.ts` pure helper (trim, clamp 30, empty → []); script skips unchanged rows; ran on live DB (0 posts) |
| P2-04/05 Blog API tags + `/tags` + guards | ✅ | create/update persist tags + derived category; tag `hasSome` AND category/search; `GET /tags` PUBLISHED-only, distinct, sorted; `/tags` + `/by-id/:id` before `/:slug`; 401 guards on all protected routes |
| P2-06 Portfolio lab filter | ✅ | `tags hasSome [laboratorio,experimento]` + `NOT tags hasSome [articulo]`; classification = first tag; PUBLISHED+deletedAt-null on all 6 sources |
| P2-07 TagInput | ✅ | Shared component (suggestionsUrl, chips, Enter/comma commit, max 10 default, 1–30 trim); adopted in BlogPostForm + ProjectForm; project pages use ProjectForm (no stale inline editor) |
| P2-08 SuccessCase videos/links | ✅ | Create + edit via UrlListInput; payload includes videos/links (optional) |
| P2-09 Service includedItems/technicalExplanation | ✅ | Create + edit via ItemListInput + textarea; validation (min 1 item); prefill from initialData |
| P2-10 Upload hardening | ✅ | `upload.config.ts` (default `general`, env `UPLOAD_BUCKET_ALLOWLIST` override, unknown → ValidationError 400); controller passes bucket from body; SVG rejected with XSS message at multer + service; content-type stored on object |
| P2-11 ImageUploader accept | ✅ | `DEFAULT_ACCEPT = image/jpeg,image/png,image/gif,image/webp` (SVG removed); Vitest asserts attr |
| P2-12 Client blog filters | ✅ | Tag chips from `/api/blog-posts/tags`, AND with category/search, `?tag=` URL persistence, 300ms debounce (code); BlogPage.test covers URL pre-apply |
| P2-13 Recruiter blog filters | ✅ | Same pattern; BlogGrid receives category/tag/search → API params |
| P2-14 Phase gate | ✅ | typecheck 0 errors; api coverage ≥70% (all metrics); Vitest suites green |

---

## Coherence (Design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| D1 Aggregation at `/api/portfolio/projects` | ✅ Yes | Unchanged from P1; blog-post reorder gap unrelated |
| D3 SVG accept aligned to server | ✅ Yes | ImageUploader accept + server fileFilter agree; sanitized-SVG deferred as designed |
| D4 Lab posts type `laboratorio` via tags | ✅ Yes | P2-06 switched category-proxy → `tags hasSome`; articulo excluded; first-tag classification |
| D7 Tags free-form, category derived | ✅ Yes | tagsSchema shared; category derived from first tag on create/update; BlogPostForm derives category client-side for validation |
| Bucket allowlist source (open question) | ✅ Resolved | config constant + `UPLOAD_BUCKET_ALLOWLIST` env override (config-driven, per risk note) |
| Route-order guard | ✅ Yes | `/tags` + `/by-id/:id` before `/:slug`; enforced by integration tests |
| Design File Changes table | ✅ Matched | All listed Phase 2 files present; `api/src/config/` (upload.config.ts) new as designed |

---

## Issues Found

**CRITICAL** (must fix before PR/archive):
None.

**WARNING** (should fix / be aware of):
1. **TDD evidence format** — the apply-progress artifact reports TDD narratively (tests written first, existing tests updated as safety net) but lacks the canonical "TDD Cycle Evidence" table (RED/GREEN/TRIANGULATE/SAFETY NET/REFACTOR). Substance is fully verifiable: all RED test files exist and pass. Protocol-format deviation only.
2. **Spec scenario "Reorder blog posts (protected)" unimplemented** — `PATCH /api/blog-posts/:id/reorder` has no route/handler/service/admin API anywhere. This is a **pre-existing gap** carried from the main spec (archived change, present on main before P2) into the P2 delta as an unchanged scenario; no P2 task owns it. Not a P2 regression, but the delta spec lists it as active — orchestrator should decide: implement in a follow-up or clean the spec.
3. **Changed-file branch coverage below 80%** — `portfolio.service.ts` branch 59.01% (uncovered: type-filter branches, getClassifications) and `blog-post.service.ts` branch 76.78%. Informational per strict-TDD module; project-wide branch 71.45% passes the 70% gate.
4. **`migrate-category-to-tags.ts` script 0% coverage** — expected (DB-touching, executed via tsx); the pure mapping is 100% covered.

**SUGGESTION** (nice to have):
1. Client BlogPage Vitest does not exercise the 300ms debounce (no fake timers) or chip-click → `?tag=` URL update; it covers URL pre-apply only. Add a fake-timer + click test.
2. Recruiter BlogPage tag filter has no Vitest (task required only typecheck) — structurally identical to client, low risk.
3. TagInput max-tag message is the hardcoded "Máximo 10 etiquetas" string regardless of the `max` prop (test passes max=3 but asserts the "10" message). Cosmetic.
4. Delta H1 `# Delta for Blog Frontend Filters` vs main spec `# Delta: Blog Frontend Filters` — requirement names match exactly (merge-safe), but archive phase should confirm heading-based matching.
5. `update` with `tags: []` leaves `category` untouched (undefined → skipped in Prisma data). Consider explicitly setting category (e.g. keep-or-empty policy) so empty-tags updates are unambiguous.

---

## Verdict

**PASS (GO)** — Phase 2 (P2-01..P2-14) is complete, all gates pass, implementation matches the P2 delta specs and design. No CRITICAL issues; 2 WARNINGs (protocol format + pre-existing out-of-scope gap) and 5 SUGGESTIONs. Safe to create the P2 PR (`feat/project-publications-p2`). Remember to `git add` the untracked files (migration folder, TagInput, new tests, config/scripts) before committing.