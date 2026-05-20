# Error Boundaries Specification

## Purpose

Ensure every page in all 3 frontends (client-site, recruiter-site, admin-panel) is wrapped by an ErrorBoundary so that a component crash shows a friendly fallback UI instead of a white screen.

## Requirements

### Requirement: Per-Page ErrorBoundary Wrapper

Every route/page component in all 3 frontends MUST be wrapped with an ErrorBoundary component.

#### Scenario: API failure shows fallback

- GIVEN a page that depends on an API call
- WHEN the API call throws an unhandled error
- THEN the ErrorBoundary catches the error
- AND the fallback UI renders with "Algo salió mal" and a "Reintentar" button
- AND the error is logged to `console.error`

#### Scenario: Navigation still works after error

- GIVEN a page has crashed and shows the ErrorBoundary fallback
- WHEN the user clicks browser back or a navigation link
- THEN the new page renders normally
- AND the error state does not persist across routes

### Requirement: Top-Level Router ErrorBoundary

The root router outlet in each frontend MUST include an ErrorBoundary as a safety net for uncaught errors at the route level.

#### Scenario: Root boundary catches render crash

- GIVEN a severe rendering error in a deeply nested component
- WHEN no per-page boundary catches it
- THEN the top-level boundary renders the fallback UI

### Requirement: Fallback UI Specification

The ErrorBoundary fallback UI MUST show a user-friendly message with a retry action.

#### Scenario: Fallback retry recovers on transient error

- GIVEN the fallback UI is displayed due to a network error
- WHEN the user clicks "Reintentar"
- THEN the boundary resets its state
- AND the children re-render

#### Scenario: Fallback logs error details

- GIVEN any error is caught by an ErrorBoundary
- WHEN the boundary catches it
- THEN the error object and component stack are logged to `console.error`

### Requirement: ErrorBoundary Implementation

The ErrorBoundary MUST be implemented as a class component (React 16+ lifecycle) in `@jsoft/shared` or duplicated per frontend.

#### Scenario: Class component with getDerivedStateFromError

- GIVEN an ErrorBoundary class component
- WHEN `getDerivedStateFromError` is called
- THEN it returns `{ hasError: true }`
- AND `componentDidCatch` logs the error and stack info
