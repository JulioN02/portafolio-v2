# Console Clean Specification

## Purpose

Eliminate all non-intentional console warnings and errors across all 3 frontends, including React key warnings, missing alt text, a11y violations, and unhandled promise rejections.

## Requirements

### Requirement: No React Key Warnings

Every list rendered with `.map()` or equivalent iteration MUST include a unique `key` prop on the returned element.

#### Scenario: List with stable keys

- GIVEN a `.map()` iteration over an array of items with unique `id` fields
- WHEN the list renders
- THEN each element has `key={item.id}`
- AND the browser console shows no "missing key" warnings

#### Scenario: No index-as-key for dynamic lists

- GIVEN a list whose items can be reordered, added, or removed
- WHEN the list renders
- THEN the key is NOT the array index
- AND a stable unique identifier is used instead

### Requirement: No Missing Alt Text

Every `<img>` element MUST have a non-empty `alt` attribute, or `alt=""` for decorative images.

#### Scenario: Decorative image has empty alt

- GIVEN an image used solely for decoration (e.g. background icon)
- WHEN it renders
- THEN `alt=""` is present
- AND the browser devtools show no missing-alt warning

#### Scenario: Informative image has descriptive alt

- GIVEN an image that conveys information (e.g. project screenshot)
- WHEN it renders
- THEN `alt` contains a meaningful description of the image content

### Requirement: No Unhandled Promise Rejections

All async operations MUST have a `.catch()` or try/catch handler. Every `console.error` MUST be intentional.

#### Scenario: API call errors are caught

- GIVEN an async API call that rejects
- WHEN the promise rejects
- THEN the catch handler logs an intentional `console.error` with context
- AND no "Unhandled Promise Rejection" warning appears

#### Scenario: Event handler errors are handled

- GIVEN a button onClick that performs an async operation
- WHEN the operation throws
- THEN the error is caught and logged intentionally
- AND the UI shows a user-friendly message

### Requirement: No a11y Violations Detectable by DevTools

All 3 frontends MUST pass basic a11y checks detectable by browser devtools (Lighthouse, Accessibility panel).

#### Scenario: Form inputs have associated labels

- GIVEN a form input element
- WHEN it renders
- THEN it has an associated `<label>` or `aria-label` attribute

#### Scenario: Interactive elements have focus indicators

- GIVEN any focusable element (button, link, input)
- WHEN it receives focus
- THEN a visible focus ring or outline is displayed
