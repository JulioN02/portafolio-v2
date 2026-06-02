# Carousel Specification

## Requirements

### Requirement: Responsive slidesToShow

`slidesToShow` MUST adapt via `matchMedia`: 1 slide (<640px), 2 (640–1023px), 3–4 (≥1024px).

- GIVEN viewport is <640px
- WHEN Carousel renders
- THEN `--slides-to-show` is 1
- GIVEN viewport is 640–1023px
- THEN `--slides-to-show` is 2

### Requirement: Design System Controls

Navigation buttons MUST use `--color-blue-ui` (default) and `--color-blue-medium` (hover) instead of `--color-primary`.

- GIVEN Carousel controls render
- WHEN inspecting button background
- THEN default uses `--color-blue-ui`, hover uses `--color-blue-medium`
