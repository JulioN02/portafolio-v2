# Blog Image Carousel Specification

## Purpose

Unified image carousel for blog post detail pages (client-site and recruiter-site): the cover image renders first, followed by the media gallery, in a single Embla carousel. Every slide is fully visible and centered (`object-fit: contain`, explicit max sizing via CSS Modules) with no cropping. Autoplay animates the current slide out to the LEFT while the next enters FROM the RIGHT, with an accessible pause control. Overview (BlogCard) thumbnails adopt the same contain/centered framing.

Source: SDD change `blog-images` (archived 2026-09-04). Frontend-only; no API/Prisma/Zod changes.

## Requirements

### Requirement: Data source and order

The carousel MUST render `coverImage` as slide 1 and each `mediaGallery` item in array order after it. The cover MUST be the active slide on article entry. `coverImage` is required in the schema, so the carousel MUST render at least one slide whenever the post renders.

#### Scenario: Single image

- GIVEN a post with coverImage and no mediaGallery
- WHEN the article renders
- THEN one static slide shows the cover fully visible and centered
- AND autoplay does not run
- AND prev/next controls are not shown

#### Scenario: Multiple images

- GIVEN a post with coverImage and 2 mediaGallery images
- WHEN the article renders
- THEN the slide order is cover, gallery[0], gallery[1]

### Requirement: Framing

Every slide image MUST be fully visible (no crop) via `object-fit: contain` and MUST be centered on both axes inside a fixed-aspect frame with a neutral background. Slide image sizing MUST be explicit (max-width/max-height) via CSS Modules to override the global `img { max-width:100%; height:auto; display:block }` rule.

#### Scenario: Mixed orientations

- GIVEN portrait, landscape and square slides
- WHEN the carousel renders
- THEN each image is fully visible and centered with no cropping

### Requirement: Single slide behavior

With exactly one slide (cover only), the carousel MUST render static: autoplay MUST NOT run and prev/next controls MUST be hidden.

### Requirement: Autoplay

The carousel MUST auto-advance (default interval ~5s, configurable in code). The transition MUST animate the current slide out to the LEFT while the next enters FROM the RIGHT. The user MUST be able to pause via the pause control. It MAY pause on hover.

#### Scenario: Autoplay direction

- GIVEN autoplay running with more than one slide
- WHEN the interval elapses
- THEN the current slide animates out to the LEFT while the next enters FROM the RIGHT

#### Scenario: Pause/resume

- GIVEN autoplay running
- WHEN the user clicks pause
- THEN advancing stops AND `aria-pressed` is true
- WHEN the user clicks again
- THEN advancing resumes AND `aria-pressed` is false

### Requirement: Pause control

The carousel MUST expose a visible pause/resume button. `aria-pressed` MUST reflect the current state. Its accessible label MUST come from i18n (es and en).

#### Scenario: Pause accessibility

- GIVEN a screen reader
- THEN the pause button announces its translated label and pressed state via `aria-pressed`

### Requirement: BlogCard framing

Overview cards MUST show the full cover image, centered, with no crop (`object-fit: contain` in the fixed-aspect frame) on both sites.

### Requirement: i18n

Every new user-facing string (pause/play labels, gallery title, gallery-image alt template) MUST have keys in BOTH es and en in BOTH sites. The hardcoded client-site "Galería" MUST be replaced with an i18n key (recruiter-site already has `blogPostContent.galleryTitle`; keysets MUST stay in sync).

### Requirement: Keyboard

The carousel SHOULD support ArrowLeft/ArrowRight to change slides when focused.

#### Scenario: Keyboard navigation

- GIVEN the carousel is focused
- WHEN ArrowRight is pressed
- THEN the next slide activates

### Requirement: Reduced motion

Under `prefers-reduced-motion: reduce`, autoplay MUST NOT run.

#### Scenario: Reduced motion

- GIVEN matchMedia reports prefers-reduced-motion: reduce
- WHEN the carousel renders
- THEN autoplay never starts

### Requirement: Parity

Behavior MUST be equivalent in client-site and recruiter-site; a shared component in `@jsoft/shared` MAY be used.

## Test Requirements

- Vitest (jsdom) in BOTH sites; a ResizeObserver mock MUST be added to test setup (embla requires it).
- Carousel: renders cover first; gallery order; single-slide static (no autoplay, no prev/next); autoplay advances with fake timers (direction asserted via slide index/transition class); pause toggles `aria-pressed` and halts advancing; resume restarts; prefers-reduced-motion (matchMedia mock) disables autoplay.
- Gate: `pnpm -r run typecheck` MUST pass.