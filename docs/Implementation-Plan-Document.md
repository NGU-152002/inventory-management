# Implementation Plan Document

## Objective
Deliver Inventory Management as a production-ready desktop operations system by evolving the current scaffold into a fully usable branch-aware inventory platform.

## Current State Summary
### Implemented
- Desktop shell and routing
- Fastify backend with module scaffolding
- Shared schemas and DTOs
- Inventory core clean-architecture slice
- Pino logging and combined dev runner
- Environment-based API startup

### Gaps
- Real auth/user persistence
- Master-data workflows
- Full operational UI forms
- Rich reporting
- Complete offline sync
- Backend architectural consistency outside inventory core

## Delivery Phases

### Phase 1: Foundation Hardening
- Finalize API startup/config behavior
- Stabilize Mongo and Redis connectivity
- Keep logging and local dev workflows reliable
- Add DB index/bootstrap/seed scripts
- Remove deprecated inventory service after verification

### Phase 2: Backend Core Completion
- Implement DB-backed users and role-based access
- Add branches and branch assignment persistence
- Move items and suppliers onto repository/use-case pattern
- Add products and recipe modules with backend contracts
- Add inventory ledger query endpoints

### Phase 3: Frontend Operational Completion
- Build real forms for:
  - purchases
  - production
  - sales
  - waste
- Replace hardcoded branch context with authenticated user/branch context
- Add master-data screens for items, suppliers, products, recipes
- Improve dashboard and inventory views

### Phase 4: Reporting and Traceability
- Implement audit/history views
- Add stock valuation and movement reporting
- Add low-stock and expiry reporting
- Add branch comparison and operational summaries

### Phase 5: Offline and Desktop Maturity
- Implement queue replay and sync handling
- Add retry and conflict resolution UI
- Improve desktop packaging and release process
- Add health/diagnostic tooling for branch deployments

## Work Breakdown
### Backend
- Auth and user persistence
- Branch domain model
- Product and recipe domain model
- Repository/use-case migration for remaining modules
- Error mapping and test coverage

### Frontend
- Auth session and branch context
- Typed feature hooks
- CRUD forms and validation
- Better inventory tables and dashboard widgets
- Sync state and offline status handling

### Infrastructure
- Mongo indexes and collection setup
- Redis cache policies
- Environment documentation
- Build and packaging scripts

## Acceptance Milestones
### Milestone 1
- API starts cleanly with valid env
- Inventory core flows compile and run
- Dev runner works with labeled process logs

### Milestone 2
- User can sign in with DB-backed auth
- User can manage items and suppliers
- User can post purchase, production, sale, and waste through actual UI forms

### Milestone 3
- Branch-aware inventory is usable end-to-end
- Dashboard and reports reflect operational data
- Stock ledger is visible and traceable

### Milestone 4
- Offline queue replay works for approved flows
- Desktop app is ready for internal deployment

## Risks and Dependencies
- Mongo Atlas connectivity and IP/network configuration
- Redis availability for cache behavior
- Auth redesign affects frontend session flow
- Offline sync requires careful conflict rules
- Current placeholder frontend pages may hide integration gaps until forms are implemented

## Recommended Immediate Next Steps
1. Implement DB-backed auth and users.
2. Add branches, products, and recipes as persistent backend modules.
3. Build real purchase/production/sales/waste forms in the frontend.
4. Refactor items and suppliers to the same backend pattern as inventory core.
5. Add basic ledger and dashboard regression tests.
