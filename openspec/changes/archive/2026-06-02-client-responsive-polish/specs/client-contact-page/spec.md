# Contact Page Specification

## Requirements

### Requirement: Inline SVG Icons

Contact detail icons MUST use inline SVGs instead of emoji (📧📱📍), matching Footer pattern.

- GIVEN Contact page renders
- WHEN inspecting email/WhatsApp/location items
- THEN each icon is an inline `<svg>`, not an emoji character

### Requirement: SVG Accessibility & Theme

SVGs MUST include `aria-label` and use `currentColor` or `--color-*` tokens for fill/stroke.

- GIVEN any detail SVG renders
- THEN it has `aria-label` (e.g., "Correo electrónico")
- AND fill/stroke uses `currentColor` or design token
