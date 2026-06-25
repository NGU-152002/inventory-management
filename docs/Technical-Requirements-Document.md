# Technical Requirements Document

## System Overview
The system is implemented as a monorepo with:
- `apps/desktop`: Tauri desktop app with React + TypeScript
- `apps/api`: Fastify API with TypeScript
- `packages/shared`: shared schemas and contracts

## Architecture
### Frontend
- Tauri v2 desktop shell
- React + TypeScript
- TanStack Query for server state
- TanStack Router for navigation
- SQLite-backed offline queue foundation through Tauri SQL plugin

### Backend
- Fastify API
- MongoDB as system of record
- Redis for cache and future queue/coordination use
- Pino for structured logging
- Zod validation via shared package

### Shared Package
- Shared DTOs and schemas for roles, items, suppliers, receipts, production, sales, waste, balances, and dashboard summaries

## Design and Pattern Requirements
### Mandatory Patterns
- Clean architecture boundary for core business logic
- Route handlers as transport adapters only
- Use-case/application services for business actions
- Repository interfaces for persistence abstractions
- Infrastructure adapters for MongoDB and Redis
- Centralized domain rules for stock operations

### Current Inventory Core Pattern Target
- Domain layer:
  - stock movement model
  - balance transition rules
  - inventory domain errors
- Application layer:
  - receive goods
  - complete production order
  - record sale
  - record waste
  - query balances
  - query dashboard summary
- Infrastructure layer:
  - Mongo repositories
  - Redis dashboard cache
  - Mongo transaction manager

## Backend Technical Requirements
### Runtime and Tooling
- Node.js compatible with current project tooling
- TypeScript strict mode
- ESM modules

### API Requirements
- Existing endpoints must stay stable during refactor unless explicitly versioned.
- Request validation must occur before use-case execution.
- Domain errors must map consistently to HTTP responses.
- Connection startup must log Mongo and Redis failures separately.

### Database Requirements
- MongoDB collections for:
  - items
  - suppliers
  - goods receipts
  - production orders
  - sales
  - waste entries
  - inventory balances
  - stock ledger
- Inventory writes must keep balance and ledger updates transactionally consistent.
- Batch and branch data must be included where relevant.

### Redis Requirements
- Cache dashboard summary by branch.
- Invalidate cache after stock-affecting mutations.
- Redis failures must be logged through Pino.

### Security Requirements
- JWT-based authentication
- Branch-aware authorization in backend
- Secrets loaded from `apps/api/.env`
- Example env files must not contain real credentials

## Frontend Technical Requirements
### UI Requirements
- Desktop-first layout
- Feature-based module structure
- API integration via typed client layer
- Inventory views must reflect backend balances accurately
- Operational pages must evolve from placeholders into real validated forms

### Offline Foundation
- Local queue storage for offline actions
- Queue entry model must support endpoint, method, payload, and timestamp
- Future sync engine must replay queued actions deterministically

## Logging Requirements
- Backend logs must use Pino consistently.
- Dev terminal must prefix process output by source (`api`, `frontend`).
- Mongo, Redis, config, and startup failures must be individually identifiable.

## Testing Requirements
- Type checks must pass for shared, API, and desktop packages.
- Inventory core needs unit and integration tests for:
  - purchase receipt movement
  - production consumption/output
  - sale deduction
  - waste deduction
  - negative stock rejection
- Route integration tests should verify stable endpoint behavior.

## Deployment and Environment Requirements
- Local development supports `npm run dev` for API and frontend together.
- API requires `apps/api/.env` with:
  - `JWT_SECRET`
  - `MONGODB_URI`
  - `REDIS_URL`
- Tauri desktop build requires frontend build output and Rust toolchain.
