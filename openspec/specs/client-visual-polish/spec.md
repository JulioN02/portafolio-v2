# Visual Polish Specification

## Requirements

### Requirement: Card Visual Hierarchy

Blog cards SHOULD use `--shadow-lg` on hover, `--font-size-*` typography scale, and `--spacing-*` for gaps. All entity cards (services, products, tools, success cases, blog) SHOULD have consistent hover: `translateY(-4px)` + `--shadow-lg` + `--transition-base`.

- GIVEN any entity card renders
- WHEN hovered
- THEN card lifts with `translateY(-4px)` and `--shadow-lg`

### Requirement: Detail Page Layout

Service/Product detail pages SHOULD have constrained content width (≤800px) for comfortable single-item viewing.

- GIVEN a detail page renders
- WHEN inspecting content container
- THEN max-width is ≤800px
