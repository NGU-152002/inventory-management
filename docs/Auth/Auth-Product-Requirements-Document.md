# Auth Product Requirements Document

## Product Overview
The Auth subsystem for Inventory Management is responsible for identifying users, validating credentials, establishing authenticated sessions, and attaching branch-aware context to each user session. It is the entry point for all protected business workflows in the application.

## Product Goal
The goal of the auth subsystem is to ensure that every protected action in the application is performed by a known user with an assigned role and valid branch context.

## Target Users
- Owner/Admin
- Branch Manager
- Inventory Staff
- Baker
- Cashier
- Future system administrators managing users and branches

## Business Problems Solved
- Prevent anonymous access to inventory and operational workflows.
- Tie business actions to a specific user identity.
- Provide branch-aware session context for multi-branch operations.
- Enable future role-based permissions and admin management.

## Success Criteria
- User can sign in successfully with valid credentials.
- Invalid credentials are rejected consistently.
- Authenticated session returns user identity and branch context.
- Frontend can use session data to scope dashboard and inventory views.
- Application routes requiring auth are inaccessible without a session.

## Current MVP Scope
### In Scope
- Login with email and password
- MongoDB-backed user lookup
- bcrypt password verification
- JWT issuance
- Session payload with `user`, `branches`, and `activeBranchId`
- Seeded default owner and default branch
- Session persistence in desktop app
- Logout by clearing local session

### Out of Scope for Current Auth MVP
- User creation UI
- Branch management UI
- Branch switching UI
- Password reset/change
- Refresh tokens
- Token revocation/logout invalidation on backend
- MFA
- Permission matrix enforcement by route/action

## Functional Requirements
### Authentication
- User must be able to log in with email and password.
- System must validate credentials against stored user records.
- Passwords must be stored as bcrypt hashes.
- System must issue JWT on successful login.

### Session Context
- Login response must include:
  - token
  - user profile
  - assigned branches
  - active branch ID
- Frontend must persist session and token locally.
- Frontend must attach bearer token to protected API requests.

### Branch Association
- User may belong to one or more branches.
- Session must resolve all assigned branches.
- System must choose an active branch for current session use.

### Protected Access
- Protected routes must require valid JWT.
- Unauthenticated users must be redirected to login in desktop app.
- API must reject invalid or missing tokens.

### Bootstrap Behavior
- On first startup, system must ensure:
  - default branch exists
  - default owner user exists
- Seeded owner credentials come from environment configuration.

## Non-Functional Requirements
- Secure password handling
- Consistent auth validation and error messaging
- Session model compatible with future role/branch expansion
- Branch-aware auth payloads
- Backend logging for auth seed and startup behavior
- Low-friction development setup for first-time bootstrapping

## Current Limitations
- No user administration interface
- No branch administration interface
- No backend logout invalidation
- No password lifecycle management
- No refresh token flow
- No explicit branch switching
- No complete permission enforcement by role yet

## Next Product Requirements
- User management screens and APIs
- Branch management screens and APIs
- Explicit branch switching
- Role/permission matrix
- Password reset and change flow
- Session renewal/logout strategy
- Auth audit logging and login throttling
