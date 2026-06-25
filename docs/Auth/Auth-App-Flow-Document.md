# Auth App Flow Document

## Overview
This document describes the current and intended user flow for authentication, session handling, and branch context inside Inventory Management.

## Primary Actors
- Owner/Admin
- Branch Manager
- Inventory Staff
- Baker
- Cashier

## Startup Flow
1. User launches the desktop app.
2. Frontend loads the application shell.
3. Route guard checks whether a stored token exists.
4. If no token exists, user is redirected to `/login`.
5. If token exists, user can access authenticated routes.

## First-Time Backend Seed Flow
1. API starts.
2. MongoDB connection is established.
3. API ensures default branch exists:
   - `main-branch`
   - `Main Branch`
   - `MAIN`
4. API checks for owner account using `ADMIN_EMAIL`.
5. If missing, API creates seeded owner user with hashed password and default branch assignment.

## Login Flow
1. User enters email and password on login screen.
2. Frontend submits `POST /auth/login`.
3. API validates payload.
4. API finds user by email.
5. API verifies bcrypt password hash.
6. API loads assigned branches.
7. API selects `activeBranchId`.
8. API signs JWT.
9. API returns auth session payload.
10. Frontend stores token and session in local storage.
11. Frontend navigates user to dashboard.

## Session Load Flow
1. Frontend reads stored auth session.
2. API client reads stored token for bearer auth.
3. Dashboard, inventory, and purchase flows read `activeBranchId` from session.
4. App shell displays current user and active branch.

## Authenticated API Flow
1. Frontend sends bearer token in `Authorization` header.
2. Fastify JWT middleware validates token.
3. `request.userContext` is populated.
4. Protected route continues.

## Current User Lookup Flow
1. Frontend calls `GET /auth/me` when session revalidation is needed.
2. API reloads current user from MongoDB.
3. API reloads user branch assignments.
4. API returns user, branches, and active branch context.

## Logout Flow
1. User clicks logout in app shell.
2. Frontend clears local token and stored session.
3. User is redirected to `/login`.

## Branch Context Flow
1. User session includes `branchIds` and `branches`.
2. `activeBranchId` is selected automatically from assigned branches.
3. Frontend uses active branch for branch-scoped pages.
4. Current implementation does not yet expose manual branch switching.

## Failure Flows
### Invalid Login
1. User submits wrong email/password.
2. API returns `401 Invalid credentials`.
3. Frontend shows login error.

### Missing User on `/auth/me`
1. Token is valid but DB user no longer exists.
2. API returns `404 User not found`.
3. Frontend should eventually clear session and redirect to login.

### Missing Branch Assignment
1. User exists but branch data is incomplete.
2. Session falls back to first available branch ID if possible.
3. Frontend may show limited context until branch management is completed.

## Future Auth Flow Requirements
- Branch switching from UI
- Refresh token or session renewal flow
- Password change/reset flow
- User and branch administration flows
- Role-based permission checks per route and UI action
- Auth session expiry handling in frontend
