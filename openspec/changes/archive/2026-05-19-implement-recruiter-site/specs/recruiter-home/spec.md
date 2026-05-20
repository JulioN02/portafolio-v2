# Recruiter Home Specification

## Purpose

Hero landing with profile toggle, tech stack carousel, and recent projects carousel.

## Requirements

### Requirement: Hero with ProfileToggle

The system SHALL render a hero section at `/` with a toggle switching between Profesional and Técnico profile text. Default state SHALL be "Profesional".

#### Scenario: Render default profile

- GIVEN user visits `/`
- WHEN hero section loads
- THEN "Profesional" text is displayed with toggle set to Profesional side

#### Scenario: Toggle to Técnico

- GIVEN user is on `/` with Profesional profile shown
- WHEN user clicks the toggle
- THEN text switches to "Técnico" content and toggle updates

### Requirement: TechStack Carousel

The system SHALL display an auto-rotating Embla carousel with 3 groups: Frontend, Backend, Complementary.

#### Scenario: Auto-rotation renders groups

- GIVEN user is on `/`
- WHEN tech stack section loads
- THEN three groups auto-rotate via carousel

#### Scenario: Manual navigation pauses auto-rotation

- GIVEN carousel is auto-rotating
- WHEN user clicks a dot or swipes
- THEN carousel navigates to selected group and pauses auto-rotation temporarily

### Requirement: RecentProjects Carousel

The system SHALL fetch `GET /api/projects/recent` and display up to 3 recent projects in a carousel.

#### Scenario: Projects load successfully

- GIVEN API returns 3 recent projects
- WHEN home page renders
- THEN carousel shows projects with title, description, and thumbnail

#### Scenario: Empty or error state

- GIVEN API returns empty array or error
- WHEN home page renders
- THEN section displays "No projects available" empty state
