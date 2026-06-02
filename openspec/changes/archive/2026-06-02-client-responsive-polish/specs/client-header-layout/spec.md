# Header-Layout Specification

## Requirements

### Requirement: Single Source of Truth

Header height MUST be defined as `--header-height` on `:root` in variables.css. Layout main `padding-top` MUST reference `var(--header-height)`.

- GIVEN variables.css loads
- WHEN inspecting `:root`
- THEN `--header-height` is defined
- GIVEN Layout renders
- WHEN inspecting `.main` padding-top
- THEN it is `var(--header-height)`

### Requirement: Responsive Breakpoints

`--header-height` SHALL be: 80px (default), 70px (≤1024px), 64px (≤768px), 56px (≤480px).

- GIVEN viewport is ≤480px
- WHEN measuring header height
- THEN value is 56px
- GIVEN viewport is ≤768px and >480px
- THEN value is 64px
