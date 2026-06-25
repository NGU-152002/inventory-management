# Auth Functionality Document

## Purpose
This document defines the authentication, user, role, and branch-context functionality for Inventory Management as currently implemented in the repository. It describes the live auth behavior, the underlying data model, the API contract, desktop session behavior, and the known gaps that must still be completed before the auth system is production-ready.

## Scope
This document covers:
- login and authenticated session behavior
- MongoDB-backed users and branches
- seeded default owner and default branch behavior
- JWT issuance and session payload shape
- frontend session storage and usage
- current limitations and next auth requirements

This document does not cover detailed permission enforcement for every inventory module.

## Current Auth Architecture
### Backend
Auth is implemented in the Fastify API and uses:
- MongoDB for user and branch persistence
- bcrypt for password hash verification
- JWT for authenticated API access
- shared Zod schemas for response/session shape

Relevant backend files:
- `apps/api/src/modules/auth/routes.ts`
- `apps/api/src/modules/auth/store.ts`
- `apps/api/src/index.ts`
- `packages/shared/src/index.ts`

### Frontend
Desktop auth/session behavior is implemented in the Tauri React app and uses:
- login page to call the API
- local storage for token and session persistence
- branch-aware session lookup for operational screens
- route redirects for unauthenticated access

Relevant frontend files:
- `apps/desktop/src/features/auth/LoginPage.tsx`
- `apps/desktop/src/shared/auth/session.ts`
- `apps/desktop/src/shared/api/client.ts`
- `apps/desktop/src/routes/router.tsx`

## Current Functional Behavior
### Startup Seed Behavior
On API startup, the system ensures minimum auth data exists.

Behavior:
1. Connect to MongoDB.
2. Ensure a default branch exists:
   - `id`: `main-branch`
   - `name`: `Main Branch`
   - `code`: `MAIN`
3. Check whether a user exists for `ADMIN_EMAIL` from env.
4. If not, create a default owner user using:
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - role `owner`
   - branch assignment `["main-branch"]`
5. Store the password as a bcrypt hash.

This provides a minimal bootstrap path for development and first-time setup.

### Login Flow
Endpoint: `POST /auth/login`

Behavior:
1. Validate request payload with Zod.
2. Find user by email in MongoDB.
3. Compare submitted password with stored bcrypt hash.
4. Load the user’s assigned branches.
5. Choose `activeBranchId` from the first available branch.
6. Sign a JWT containing user fields plus `activeBranchId`.
7. Return a session payload containing:
   - `token`
   - `user`
   - `branches`
   - `activeBranchId`

If email or password is invalid, the API returns `401 Invalid credentials`.

### Authenticated Session Lookup
Endpoint: `GET /auth/me`

Behavior:
1. Require valid bearer token.
2. Read authenticated user context from JWT.
3. Reload the user from MongoDB.
4. Reload assigned branches from MongoDB.
5. Return the current session shape with:
   - `user`
   - `branches`
   - `activeBranchId`

Current note:
- the response currently includes `token: ""` because `/me` is used as a session lookup, not a token refresh endpoint.

### Frontend Session Behavior
After successful login:
1. Desktop app stores the returned `token` separately.
2. Desktop app stores the full auth session in local storage.
3. API client reads the stored token for authenticated requests.
4. Dashboard, Inventory, and Purchases pages read `activeBranchId` from session.
5. Route guards redirect unauthenticated users to `/login`.
6. Logout clears both token and session from local storage.

## Data Model
### User
Current shared user shape:
- `id: string`
- `email: string`
- `name: string`
- `role: owner | branch_manager | inventory_staff | baker | cashier`
- `branchIds: string[]`

### Stored User
MongoDB-backed stored user extends the shared user model with:
- `passwordHash: string`

### Branch
Current branch shape:
- `id: string`
- `name: string`
- `code: string`

### Auth Session
Current auth session shape:
- `token: string`
- `user: User`
- `branches: Branch[]`
- `activeBranchId: string`

## Current API Contract
### POST `/auth/login`
Request body:
```json
{
  "email": "owner@inventory.local",
  "password": "ChangeMe123!"
}
```

Successful response:
```json
{
  "token": "<jwt>",
  "user": {
    "id": "...",
    "email": "owner@inventory.local",
    "name": "System Owner",
    "role": "owner",
    "branchIds": ["main-branch"]
  },
  "branches": [
    {
      "id": "main-branch",
      "name": "Main Branch",
      "code": "MAIN"
    }
  ],
  "activeBranchId": "main-branch"
}
```

Failure cases:
- `401` invalid email/password
- `400` invalid request payload

### GET `/auth/me`
Headers:
- `Authorization: Bearer <jwt>`

Successful response:
```json
{
  "token": "",
  "user": {
    "id": "...",
    "email": "owner@inventory.local",
    "name": "System Owner",
    "role": "owner",
    "branchIds": ["main-branch"]
  },
  "branches": [
    {
      "id": "main-branch",
      "name": "Main Branch",
      "code": "MAIN"
    }
  ],
  "activeBranchId": "main-branch"
}
```

Failure cases:
- `401` invalid or missing token
- `404` user not found

## Branch Context Rules
- A user may belong to multiple branches using `branchIds`.
- Login returns the full set of assigned branches.
- `activeBranchId` is currently derived automatically from the first branch.
- The desktop app uses `activeBranchId` as the current working branch for live inventory views.
- Current backend branch enforcement is partial and must be strengthened across all branch-scoped routes.

## Security Behavior
### Implemented
- Passwords are stored hashed with bcrypt.
- JWT is required for protected API routes.
- Auth seed values come from environment configuration.
- Auth session data is shaped and validated through shared schemas.

### Not Yet Implemented
- refresh token flow
- backend logout invalidation
- password reset flow
- password change flow
- account lockout or throttling
- auth audit trail for login attempts
- session expiration/renewal UX on frontend

## Roles
Current supported roles:
- `owner`
- `branch_manager`
- `inventory_staff`
- `baker`
- `cashier`

Current note:
- role values exist in the shared model, but a full permission matrix is not yet implemented in the backend or frontend.

## Current Limitations
The auth system is functional but not yet complete for production use.

Known gaps:
- no user CRUD APIs
- no branch CRUD APIs
- no branch switching endpoint
- no admin UI for user or branch management
- no refresh token or long-session strategy
- no centralized permission enforcement per module/action
- `/auth/me` is not a true token refresh mechanism
- seeded owner/bootstrap behavior is still developer-oriented

## Immediate Next Requirements
### Backend
- add user management APIs
- add branch management APIs
- add branch-switching endpoint
- enforce branch access consistently in all branch-scoped modules
- formalize permission checks by role

### Frontend
- add current-user/session bootstrapping on app load
- add branch switcher UI
- add admin screens for users and branches
- surface auth/session expiration cleanly

### Security and Operations
- add refresh/logout strategy
- add rate limiting for login
- add password lifecycle flows
- add auth-related audit logging

## Operational Notes
### Required Environment Values
Auth currently depends on:
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- valid MongoDB connectivity

### Local Development Behavior
- API startup seeds the default owner and branch if missing.
- Developers can log in using the seeded owner credentials from env.
- Desktop session is stored locally and reused by current screens.

## Summary
The current auth implementation has moved beyond a hardcoded env-only login and now supports:
- MongoDB-backed users
- seeded owner bootstrap
- branch-aware session payloads
- frontend session persistence
- role and branch association in shared types

The next milestone is to evolve this from bootstrap auth into a full user and branch management system with proper permission control and session lifecycle handling.
