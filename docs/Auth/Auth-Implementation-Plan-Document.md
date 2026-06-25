# Auth Implementation Plan Document

## Objective
Evolve the current bootstrap authentication layer into a complete user, role, and branch management subsystem that supports secure access, branch-aware sessions, and future permission enforcement.

## Current State Summary
### Implemented
- MongoDB-backed users and branches
- Default owner and default branch seed logic
- bcrypt password verification
- JWT-based session creation
- Session payload with user and branch context
- Desktop local session persistence
- Route guard redirect to login

### Gaps
- No user CRUD APIs
- No branch CRUD APIs
- No branch switch API/UI
- No refresh token or logout invalidation strategy
- No password reset/change flow
- No full permission matrix enforcement
- No admin UI for auth management

## Delivery Phases

### Phase 1: Auth Stabilization
- Keep current login and `/auth/me` behavior stable
- Add integration tests for login, `/me`, and seed flow
- Improve error handling and auth-related logs
- Ensure session bootstrap on app reload is reliable

### Phase 2: User and Branch Management
- Add backend CRUD APIs for users
- Add backend CRUD APIs for branches
- Add admin-facing validation rules for branch assignment
- Support activating/deactivating users

### Phase 3: Session and Branch Context Maturity
- Add explicit branch switch endpoint
- Update frontend to allow branch switching
- Refresh active session state after branch switch
- Enforce branch-scoped behavior consistently in backend modules

### Phase 4: Security Hardening
- Add password change flow
- Add password reset strategy
- Add login throttling/rate limiting
- Add session expiration handling
- Add logout invalidation or token revocation design
- Add auth audit logging

### Phase 5: Authorization Completion
- Define role-permission matrix
- Add route-level permission guards
- Add UI-level feature gating
- Align backend enforcement with frontend visibility

## Work Breakdown
### Backend
- auth service and repository cleanup
- user CRUD endpoints
- branch CRUD endpoints
- branch-switch session flow
- permission guard middleware
- auth integration tests

### Frontend
- session bootstrap on app load
- branch selector UI
- auth admin pages for users and branches
- password/profile flows
- better auth error and expiry handling

### Data Layer
- Mongo indexes for users and branches
- uniqueness rules for email and branch code
- active/inactive flags and audit metadata where needed

## Acceptance Milestones
### Milestone 1
- Login and `/auth/me` are stable and tested.
- Seeded owner and branch behavior is reliable.
- Desktop app can restore session and protect routes.

### Milestone 2
- Admin can create and manage users and branches.
- Users can be assigned to one or more branches.

### Milestone 3
- User can switch active branch cleanly.
- Branch context is enforced consistently across the app.

### Milestone 4
- Password and session lifecycle flows are implemented.
- Auth security controls are production-ready.

### Milestone 5
- Roles and permissions control actual feature access end-to-end.

## Risks and Dependencies
- MongoDB availability is required for auth.
- Current session model is simple and must expand carefully.
- Branch switching affects nearly every branch-scoped module.
- Permission enforcement requires coordination across backend and frontend.

## Recommended Immediate Next Steps
1. Add auth integration tests.
2. Implement user CRUD APIs.
3. Implement branch CRUD APIs.
4. Add branch-switch session behavior.
5. Introduce permission guard middleware.
