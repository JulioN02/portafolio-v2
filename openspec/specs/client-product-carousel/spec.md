# ProductCarousel Specification

## Requirements

### Requirement: Design Token Colors & Fonts

ProductCarousel MUST replace hardcoded values (`#888`, `#1a1a2e`, `2rem`) with `--color-*` and `--font-size-*` tokens.

- GIVEN ProductCarousel renders
- WHEN inspecting any color or font-size
- THEN all values reference CSS custom properties from variables.css

### Requirement: 2-Column Breakpoint at 640px

Grid SHALL include a 2-column breakpoint at 640px: 5 cols (≥1024px) → 3 cols (≥640px) → 2 cols (≥640px) → 1 col (<640px). Current jump from 5→3→1 MUST be smoothed.

- GIVEN viewport is 640px
- WHEN grid renders
- THEN `grid-template-columns` is `repeat(2, 1fr)`
