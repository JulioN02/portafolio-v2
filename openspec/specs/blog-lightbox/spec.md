# Blog Lightbox Specification

## Purpose

Click-to-enlarge overlay for blog media: carousel slide images AND body media (images, videos, simulator iframes). Opens ABOVE the article content as a dialog (`role="dialog"`, `aria-modal="true"`) and closes on backdrop click, ESC, or scroll. Body media stays in the body — only the enlarged view overlays. Wiring on body content MUST NOT bypass the existing sanitized render (event delegation on the rendered container).

Source: SDD change `blog-images` (archived 2026-09-04). Frontend-only; no API/Prisma/Zod changes.

## Requirements

### Requirement: Triggers

Clicking a carousel slide MUST open the lightbox at that slide. Clicking a body `figure > img`, `video`, or simulator iframe MUST open the lightbox with that media enlarged; the media MUST remain in the body.

#### Scenario: Open from carousel

- GIVEN the carousel is visible
- WHEN the active slide is clicked
- THEN the lightbox opens above the content at that slide
- AND the page behind is scroll-locked

#### Scenario: Open from body image

- GIVEN a body figure > img
- WHEN it is clicked
- THEN the lightbox shows the enlarged image
- AND the image remains in the body

#### Scenario: Open from body video

- GIVEN a body video with controls
- WHEN it is clicked
- THEN the lightbox shows the enlarged, playable video

#### Scenario: Open from simulator iframe

- GIVEN a simulator iframe in the body
- WHEN it is clicked
- THEN the lightbox shows the iframe inline
- AND its sandbox and src attributes are unchanged

### Requirement: Sanitization

Body lightbox wiring MUST use event delegation on the already-sanitized container. It MUST NOT add new `dangerouslySetInnerHTML` paths.

### Requirement: Close behaviors

The lightbox MUST close on: backdrop click (outside the media), ESC, and scroll (wheel or touch). While open, the underlying page MUST NOT scroll; the scroll attempt closes the lightbox instead. The scroll listener MUST be overlay-scoped and MUST NOT hijack page scroll after close.

#### Scenario: Close by backdrop

- GIVEN the lightbox is open
- WHEN the user clicks outside the media
- THEN the lightbox closes

#### Scenario: Close by scroll

- GIVEN the lightbox is open
- WHEN the user scrolls (wheel or touch)
- THEN the lightbox closes
- AND the page does not scroll

#### Scenario: Close by ESC

- GIVEN the lightbox is open
- WHEN ESC is pressed
- THEN it closes
- AND focus returns to the trigger

### Requirement: Dialog semantics

The lightbox MUST render `role="dialog"` + `aria-modal="true"` + a translated `aria-label`. Focus SHOULD move into the lightbox on open and return to the trigger on close. A visible close button SHOULD be provided.

### Requirement: Carousel navigation

When opened from the carousel, the lightbox MUST support ArrowLeft/ArrowRight and SHOULD provide prev/next controls. The carousel's active slide MUST stay in sync. A body-media lightbox is single-item (no navigation).

#### Scenario: Arrows in lightbox

- GIVEN the lightbox was opened from the carousel
- WHEN ArrowRight is pressed
- THEN the next slide is shown
- WHEN ArrowLeft is pressed
- THEN the previous slide is shown

### Requirement: Framing

Enlarged media MUST be constrained by explicit max-width/max-height (CSS Modules) and centered. Images use `object-fit: contain`. Videos keep their controls. Simulator iframes MUST keep `sandbox` and `src` unchanged (visual overlay only).

### Requirement: Video behavior

A body video in the lightbox SHOULD be playable. It SHOULD NOT autoplay under `prefers-reduced-motion: reduce`.

#### Scenario: Reduced motion

- GIVEN prefers-reduced-motion: reduce
- WHEN a body video opens in the lightbox
- THEN it does not autoplay

### Requirement: i18n

Lightbox strings (close, prev, next, counter) MUST have es and en keys in both sites.

## Test Requirements

- Vitest (jsdom) in BOTH sites; a ResizeObserver mock MUST be added to test setup.
- Lightbox: opens on carousel slide click; opens on body img, video and iframe click; closes on backdrop click, ESC, and wheel/touch scroll; arrow keys navigate the carousel-opened lightbox; `role="dialog"` + `aria-modal="true"` asserted; focus returns to trigger on close.
- Sanitization: existing BlogPostContent sanitization tests MUST keep passing; assert no new innerHTML injection paths were added.
- Gate: `pnpm -r run typecheck` MUST pass.