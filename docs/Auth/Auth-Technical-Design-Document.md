# Auth Technical Design Document

## Purpose
This document defines the technical design of the auth subsystem in Inventory Management, including runtime behavior, storage model, API contracts, session handling, and future technical extensions.

## Current Components
### Backend
- Fastify
- MongoDB collections for `users` and `branches`
- bcrypt password verification
- JWT session tokens
- Pino logging
- Zod schema validation via shared package

### Frontend
- React login flow
- Local storage session persistence
- API client bearer token injection
- Route guard based on stored token

## Current Data Structures
### Branch
- `id: string`
- `name: string`
- `code: string`

### User
- `id: string`
- `email: string`
- `name: string`
- `role: owner | branch_manager | inventory_staff | baker | cashier`
- `branchIds: string[]`

### Stored User
- all `User` fields
- `passwordHash: string`

### Auth Session
- `token: string`
- `user: User`
- `branches: Branch[]`
- `activeBranchId: string`

## Backend Technical Flow
### Seed Logic
Implemented in auth store layer.

Behavior:
- ensure default branch exists
- ensure default owner exists
- hash password using bcrypt before insert

### Login Endpoint
- validate payload with Zod
- query MongoDB user by lowercased email
- compare password using bcrypt
- load branches via branch IDs
- compute `activeBranchId`
- sign JWT with user context
- return validated session object

### `/auth/me` Endpoint
- require JWT auth
- load user by ID from DB
- load branches from DB
- return validated session response

## JWT Design
### Current Payload
- `id`
- `email`
- `name`
- `role`
- `branchIds`
- `activeBranchId`

### Current Constraints
- no refresh token
- no token revocation list
- no rotation strategy
- no backend logout invalidation

## Frontend Technical Flow
### Session Storage
Stored locally in two parts:
- token key for API authorization
- full session object for branch/user UI context

### Route Protection
- route guard checks token presence
- unauthenticated user is redirected to `/login`

### Active Branch Usage
- dashboard reads active branch from stored session
- inventory reads active branch from stored session
- purchases sample flow reads active branch from stored session

## Security Design
### Implemented
- password hashing with bcrypt
- JWT-authenticated protected routes
- env-based secret loading
- current user lookup against DB

### Not Yet Implemented
- login rate limiting
- refresh token design
- session revocation
- password change/reset flows
- brute-force protection
- MFA
- audit events for login and auth failures

## Design Constraints
- current auth is a bootstrap auth system, not full IAM
- branch selection is derived automatically, not user-selectable
- role enum exists, but permission matrix is not enforced globally yet
- frontend trusts stored session structure and needs stronger bootstrap/revalidation flow later

## Recommended Next Technical Steps
1. Add user CRUD APIs.
2. Add branch CRUD APIs.
3. Add explicit branch-switch endpoint and session update strategy.
4. Add permission guards by role and branch.
5. Add refresh/logout/session invalidation model.
6. Add auth integration tests.

## Testing Targets
- seeded owner creation
- login success
- login invalid password
- `/auth/me` success with valid JWT
- `/auth/me` user missing
- branch resolution for multi-branch user
- frontend session persistence and logout behavior
