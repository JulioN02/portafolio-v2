# Admin Auth Specification

## Purpose

Authentication system for admin-panel using JWT stored in localStorage with ProtectedRoute wrapper.

## Requirements

### Requirement: Admin Login

The system SHALL provide a login page at `/admin/login` where admin users MUST authenticate with email and password. On success, the JWT token MUST be stored in localStorage and user SHALL be redirected to `/admin/dashboard`.

#### Scenario: Successful login

- GIVEN user is on `/admin/login` page
- WHEN user enters valid email/password and clicks "Login"
- THEN system stores JWT in localStorage, redirects to `/admin/dashboard`

#### Scenario: Failed login

- GIVEN user is on `/admin/login` page
- WHEN user enters invalid credentials
- THEN system displays error message, token is NOT stored

#### Scenario: Already authenticated

- GIVEN user has valid JWT in localStorage
- WHEN user navigates to `/admin/login`
- THEN system redirects to `/admin/dashboard` automatically

### Requirement: Protected Routes

The system SHALL wrap all admin routes (except `/admin/login`) with ProtectedRoute component that checks for valid JWT. If token is missing or expired, user MUST be redirected to `/admin/login`.

#### Scenario: Access protected route with valid token

- GIVEN user has valid JWT in localStorage
- WHEN user navigates to `/admin/dashboard`
- THEN system renders the dashboard page normally

#### Scenario: Access protected route without token

- GIVEN user has no JWT in localStorage
- WHEN user navigates to `/admin/dashboard`
- THEN system redirects to `/admin/login`

#### Scenario: Token expired handling

- GIVEN user has expired JWT in localStorage
- WHEN user makes API request returning 401
- THEN system removes token, redirects to `/admin/login`

### Requirement: Logout

The system SHALL provide logout functionality that removes JWT from localStorage and redirects to login page.

#### Scenario: User logs out

- GIVEN user is authenticated on any admin page
- WHEN user clicks "Logout" in header/sidebar
- THEN system removes JWT, redirects to `/admin/login`
