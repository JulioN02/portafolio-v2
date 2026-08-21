# Responsive Specification

## Purpose

Ensure all 3 frontends render correctly and are fully usable at 375px (mobile), 768px (tablet), and 1440px (desktop) breakpoints with no horizontal scroll, accessible touch targets, and touch-safe hover states.

## Requirements

### Requirement: Minimum Supported Breakpoints

All 3 frontends MUST render without visual breakage at 375px, 768px, and 1440px widths.

#### Scenario: Mobile layout at 375px

- GIVEN a viewport width of 375px
- WHEN any page is rendered
- THEN no content is clipped or overflowing
- AND all interactive elements are reachable by scrolling

#### Scenario: Tablet layout at 768px

- GIVEN a viewport width of 768px
- WHEN any page is rendered
- THEN a two-column layout is used where appropriate
- AND navigation items are fully visible

#### Scenario: Desktop layout at 1440px

- GIVEN a viewport width of 1440px
- WHEN any page is rendered
- THEN the layout uses the full width
- AND content is centered with appropriate max-width constraints

### Requirement: No Horizontal Scroll

No page in any frontend MUST cause horizontal scrolling at any viewport width between 375px and 1440px.

#### Scenario: Overflow hidden on body

- GIVEN any page at any breakpoint
- WHEN the page renders
- THEN `overflow-x: hidden` is set on the body or root element
- AND no child element exceeds viewport width

#### Scenario: Long content wraps instead of overflows

- GIVEN a code block, long URL, or unbreakable text string
- WHEN it exceeds the container width
- THEN CSS `word-break: break-word` or `overflow-wrap: break-word` is applied
- AND the content wraps without creating horizontal scroll

### Requirement: Touch Target Size

All interactive elements (buttons, links, inputs, icons) MUST have a minimum touch target of 44x44px on touch devices.

#### Scenario: Small icon buttons are touch-safe

- GIVEN an icon button with small visual size (e.g. 24x24px)
- WHEN viewed on a touch device
- THEN the clickable area is padded to at least 44x44px

#### Scenario: Form inputs are usable at 375px

- GIVEN a form at 375px viewport width
- WHEN the user taps any input
- THEN the input height is at least 44px
- AND adjacent inputs do not overlap

### Requirement: Hover States on Touch Devices

CSS hover states MUST NOT cause sticky hover artifacts on touch devices.

#### Scenario: Tap on mobile does not leave hover

- GIVEN a touch device user taps a styled element
- WHEN the tap ends
- THEN the element does not remain in `:hover` state
- AND `@media (hover: hover)` is used for hover styles
