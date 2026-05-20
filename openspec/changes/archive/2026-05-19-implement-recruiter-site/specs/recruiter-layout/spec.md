# Recruiter Layout Specification

## Purpose

Global header navigation and footer shared across all recruiter site pages.

## Requirements

### Requirement: Header Navigation

The system SHALL render a header with navigation links: Inicio `/`, Proyectos `/proyectos`, Blog `/blog`, Contacto `/contacto`. The active route SHALL be visually highlighted.

#### Scenario: Navigate via header

- GIVEN user is on any recruiter page
- WHEN user clicks a nav link
- THEN router navigates to the target route

#### Scenario: Active route highlighted

- GIVEN user navigates to `/proyectos`
- WHEN header renders
- THEN "Proyectos" link is visually highlighted

### Requirement: Footer

The system SHALL render a footer with the current year copyright and social icons (WhatsApp, LinkedIn, GitHub, email).

#### Scenario: Render footer

- GIVEN any recruiter page renders
- WHEN footer renders
- THEN it contains copyright notice and social link icons
