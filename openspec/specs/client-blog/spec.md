# Blog Empty State Specification

## Requirements

### Requirement: Differentiated Empty States

Blog MUST distinguish "no content" from "no search results". When search/category params yield 0 results: SHOW "No se encontraron artículos con los filtros seleccionados" with a reset link. When no params and no posts: SHOW "No hay artículos publicados aún".

- GIVEN `?search=x` or `?category=x` and API returns []
- WHEN Blog renders
- THEN message is "No se encontraron artículos con los filtros seleccionados"
- AND a reset/clear filters link is present
- GIVEN no search or category params and API returns []
- WHEN Blog renders
- THEN message is "No hay artículos publicados aún"
- AND no reset link is shown
