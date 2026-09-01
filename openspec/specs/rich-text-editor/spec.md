# Rich Text Editor Specification

## Purpose

Extract and reuse a shared TipTap editor in `@jsoft/shared` with inline Image and Video nodes so media sits between paragraphs, plus a Simulator node placeholder. Adopted across Project, Product, Tool, and Blog admin forms. HTML is the storage format (TipTap getHTML); output is sanitized on render.

## Requirements

### Requirement: Shared Editor Component

`@jsoft/shared` MUST export a TipTap-based editor component accepting initial HTML and emitting HTML on change, with the same node set across all consumers.

#### Scenario: Editor initializes from HTML

- GIVEN a form loads existing rich content
- WHEN the shared editor mounts
- THEN the HTML is parsed and rendered for editing

#### Scenario: Editor emits HTML

- GIVEN an admin edits content
- WHEN the content changes
- THEN the editor emits serialized HTML (TipTap getHTML)

### Requirement: Inline Image Node

The editor MUST support inserting an Image node between paragraphs (not only as cover). The serialized HTML MUST use non-executable media markup (e.g. `<figure><img src=...></figure>`).

#### Scenario: Insert image between paragraphs

- GIVEN the editor with two paragraphs
- WHEN the admin inserts an image between them
- THEN the image node appears between the paragraphs and serializes to HTML

### Requirement: Inline Video Node

The editor MUST support inserting a Video node (local file or URL) between paragraphs, serialized to `<video>` markup.

#### Scenario: Insert video

- GIVEN the editor
- WHEN the admin inserts a video
- THEN a `<video>` node renders and serializes to HTML

### Requirement: Simulator Node Placeholder

The editor MUST expose a reserved Simulator node ("Insertar simulador") insertable between paragraphs. In this phase it SHALL render as a placeholder block; the simulator-embeds phase binds it to the simulator embed service.

#### Scenario: Insert simulator placeholder

- GIVEN the editor
- WHEN the admin inserts a simulator node
- THEN a placeholder block appears and serializes to a dedicated markup node

### Requirement: Adoption Across Forms

Project, Product, Tool, and Blog admin forms MUST use the shared editor for their rich content body fields.

#### Scenario: Project form uses shared editor

- GIVEN the admin Project form
- WHEN the rich body field renders
- THEN it uses the shared editor component

#### Scenario: Blog form uses shared editor

- GIVEN the admin Blog form
- WHEN the body field renders
- THEN it uses the shared editor component

### Requirement: Storage Compatibility

Editor output MUST remain HTML suitable for `DOMPurify.sanitize()` on render (see sanitization delta for the media allowlist).

#### Scenario: Output sanitizable

- GIVEN editor output containing images/videos
- WHEN passed through DOMPurify with the media allowlist
- THEN media nodes are preserved and scripts stripped

## Testing Note

Editor behavior is frontend-only (no api test impact). Typecheck per package (`pnpm -r run typecheck`) MUST pass after adoption.

## Risks

- Blast radius: shared component consumed by three frontends plus admin (medium); mitigate with phased adoption and per-phase typecheck.
- Serialized HTML must remain stable across TipTap upgrades.