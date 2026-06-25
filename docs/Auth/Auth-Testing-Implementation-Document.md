# Auth Testing Implementation Document

## Objective
Define how automated testing should be implemented for the authentication module so login, session validation, logout, seeded users, and route protection remain reliable as the system grows.

## Testing Goals
- Verify the auth API contract end-to-end.
- Prevent regressions in login, logout, and protected route access.
- Validate Mongo-backed seed behavior.
- Verify session revocation behavior.
- Create a base testing pattern that can later extend to users, branches, and permissions.

## Scope
### In Scope
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`
- JWT verification flow
- revoked session handling
- seeded owner user creation
- seeded default branch creation
- desktop route protection behavior related to auth session state

### Out of Scope For Initial Implementation
- password reset
- refresh tokens
- multi-factor authentication
- permission matrix tests
- branch switch tests
- E2E desktop packaging tests

## Recommended Testing Layers

### 1. Unit Tests
Use unit tests for isolated auth logic that does not need a running HTTP server.

#### Target Functions
- user mapping from Mongo document to API-safe response
- branch mapping from Mongo document to API-safe response
- session id creation
- session revocation lookup helpers
- auth input validation helpers if extracted later

#### Purpose
- fast feedback
- low setup cost
- precise behavior checks

### 2. API Integration Tests
This is the primary testing layer for auth.

#### What To Cover
- successful login with seeded owner credentials
- rejected login for wrong password
- rejected login for unknown email
- `/auth/me` returns current user for valid token
- `/auth/me` returns `401` without token
- `/auth/logout` revokes active session
- revoked token can no longer access `/auth/me`
- seed logic creates owner and default branch once

#### Purpose
- validates Fastify routes, JWT plugin, Mongo persistence, and auth store together
- gives high confidence with relatively low maintenance cost

### 3. Desktop Auth UI Tests
Implement after API integration tests are stable.

#### What To Cover
- login form submits credentials
- token and session are stored locally after success
- unauthenticated user is redirected to `/login`
- authenticated user is redirected away from `/login`
- logout clears local session and redirects to `/login`

#### Purpose
- verifies route guards and session bootstrap behavior in the React/TanStack desktop app

## Recommended Tooling

### API
- `vitest`
- `mongodb-memory-server`
- Fastify `app.inject()` for HTTP-level tests

### Desktop
- `vitest`
- `@testing-library/react`
- `@testing-library/user-event`
- `msw`
- `jsdom`

### Later Optional Upgrade
- `testcontainers` for MongoDB and Redis integration closer to production

## Test Architecture

### API Test Structure
Recommended files:
- `apps/api/src/app.ts`
- `apps/api/src/index.ts`
- `apps/api/test/setup.ts`
- `apps/api/test/auth.integration.test.ts`
- `apps/api/test/auth.unit.test.ts`

### Desktop Test Structure
Recommended files:
- `apps/desktop/src/features/auth/LoginPage.test.tsx`
- `apps/desktop/src/routes/router.auth.test.tsx`
- `apps/desktop/src/shared/auth/session.test.ts`

## Required Refactor Before Testing

### 1. Extract App Bootstrap
Current runtime startup should be split into:
- `buildApp()`
- `start()`

#### Reason
Tests must create the Fastify app without opening a real network port.

### 2. Isolate Infrastructure Setup
Create test-safe setup helpers for:
- Mongo connection
- Redis connection or Redis mock strategy
- auth seeding

### 3. Make Environment Handling Test-Friendly
The test runner should be able to provide test values for:
- `JWT_SECRET`
- `MONGODB_URI`
- `REDIS_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

## Data Strategy

### MongoDB Strategy
Use `mongodb-memory-server` for initial API auth tests.

#### Benefits
- isolated per test run
- no dependency on developer local Mongo setup
- fast enough for auth integration coverage

### Redis Strategy
For auth tests, Redis is not the main subject.

#### Initial Recommendation
- use a lightweight mock for Redis client if auth paths do not require real Redis behavior
- or connect to a disposable test Redis only if startup currently depends on it strictly

### Seed Strategy
Each test suite should:
1. start with a clean database
2. run `ensureAuthSeed()`
3. log in with seeded owner credentials when needed

## Initial Test Cases

### Login
#### Success
- given valid seeded owner credentials
- when `POST /auth/login` is called
- then response is `200`
- and response contains `token`, `user`, `branches`, `activeBranchId`
- and `user._id` is present
- and `branches[0]._id` is present

#### Invalid Password
- given a valid seeded email and wrong password
- when `POST /auth/login` is called
- then response is `401`

#### Unknown Email
- given an unknown email
- when `POST /auth/login` is called
- then response is `401`

### Current Session
#### Valid Token
- given a token from login
- when `GET /auth/me` is called with bearer token
- then response is `200`
- and the returned user matches the login session

#### Missing Token
- when `GET /auth/me` is called without auth header
- then response is `401`

### Logout
#### Session Revocation
- given a token from login
- when `POST /auth/logout` is called
- then response is `200`
- and later `GET /auth/me` with the same token returns `401`

### Seed Behavior
#### Idempotent Seed
- when `ensureAuthSeed()` is executed multiple times
- then only one default branch exists for the configured branch code
- and only one owner exists for the configured admin email

## Desktop Auth Test Cases

### Login Page
- renders email and password fields
- shows error on failed login
- stores session on successful login
- navigates to `/dashboard` after successful login

### Route Guard
- `/dashboard` redirects to `/login` when session is absent
- `/login` redirects to `/dashboard` when session is valid
- invalid stored session is cleared and redirected to `/login`

### Logout
- clicking logout calls logout API
- local session is cleared even if API logout fails
- app redirects to `/login`

## Assertion Rules
- assert HTTP status codes explicitly
- assert response body shape explicitly
- assert token invalidation behavior explicitly
- assert no duplicate seed records after repeated seeding
- assert `_id` and timestamp presence on auth entities returned by the API if they are part of the contract

## Non-Functional Testing Requirements
- tests must run locally with one command
- tests must be deterministic
- tests must not depend on production services
- auth integration tests should finish within a few seconds
- failed tests must identify the route and behavior clearly

## Scripts
Recommended scripts for `apps/api/package.json`:
- `test`
- `test:watch`
- `test:coverage`

Recommended scripts for `apps/desktop/package.json`:
- `test`
- `test:watch`
- `test:coverage`

## CI Execution Plan
Run in CI on every push and pull request.

### Minimum CI Set
1. install dependencies
2. run shared typecheck
3. run API typecheck
4. run desktop typecheck
5. run API auth tests
6. run desktop auth tests when added

## Coverage Priorities

### Phase 1
- API auth integration tests
- seed behavior tests

### Phase 2
- desktop login and route-guard tests

### Phase 3
- permission and branch-switch tests
- edge cases like expired or malformed token handling

## Risks
- current startup flow is tightly coupled to runtime boot and must be refactored for testability
- mixed infrastructure setup can make tests brittle if Mongo and Redis are not isolated cleanly
- if database state is not reset per suite, auth tests will become flaky

## Recommended First Implementation Slice
1. Extract `buildApp()` from API startup.
2. Add `vitest` and `mongodb-memory-server` to `apps/api`.
3. Create auth integration tests for login, `/me`, and logout.
4. Add a clean test setup for seeded owner login.
5. Add a single command to run API auth tests.

## Acceptance Criteria
- developers can run auth tests locally with one command
- auth integration tests cover login, `/me`, logout, and seed flow
- revoked tokens are automatically verified by tests
- tests pass without using production Mongo or Redis
- auth test failures clearly indicate the broken behavior
