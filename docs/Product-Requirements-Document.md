# Product Requirements Document

## Product Overview
Inventory Management is a desktop-first inventory and operations application for a multi-branch retail production business. The current target business model is a bakery-style operation with raw materials, production, finished goods, wastage, purchasing, and branch-level inventory control, but the product naming is now domain-neutral.

The application is intended to run as a Tauri desktop app with a React frontend and a shared backend API. It must support inventory accuracy, branch operations, and clear operational visibility for owners and branch staff.

## Product Goal
The primary goal is to help the business control stock, reduce wastage, manage production, and maintain branch-level traceability from purchase to sale.

## Target Users
- Owner/Admin
- Branch Manager
- Inventory Staff
- Production Staff
- Cashier

## Business Problems
- Manual stock tracking causes mismatches and loss of traceability.
- Production consumption is not consistently tied to ingredient stock.
- Finished goods, wastage, and expiry are difficult to monitor across branches.
- Branch managers need faster visibility into current stock and shortages.
- Purchase receipts, sales, and waste should all affect stock in one auditable flow.

## Success Criteria
- Users can record stock-affecting operations without manual recalculation.
- Inventory balances remain consistent with purchase, production, sales, and waste history.
- Branch-level dashboard and inventory views are available from one system.
- Staff can perform core workflows with minimal training.
- Owner can trace inventory movement through a unified ledger.

## MVP Scope
### In Scope
- Authentication and role-based access
- Branch-aware inventory balances
- Item and supplier management
- Goods receipt / stock inward
- Production posting from recipe-based consumption
- Sales entry
- Waste entry
- Dashboard summary
- Inventory balance and stock movement tracking
- Offline queue foundation for desktop operations

### Out of Scope for MVP
- Full POS billing
- Accounting integration
- Customer management
- Forecasting and AI recommendations
- Complete mobile-native experience
- Advanced approval workflows

## Functional Requirements
### Authentication and Access
- Users must sign in to the application.
- Access must be role-aware and branch-aware.
- Only authorized users can post inventory-affecting transactions.

### Inventory Management
- Maintain inventory balances by branch, item, and optional batch.
- Prevent negative stock by default.
- Maintain a ledger entry for each stock movement.

### Purchasing
- Users can record goods receipts with item, quantity, cost, batch, and expiry.
- Receipt posting must increase stock automatically.

### Production
- Users can post production orders tied to recipe inputs and finished output.
- Production posting must decrease ingredient stock and increase finished stock.

### Sales
- Users can record sales entries for finished goods.
- Sales posting must reduce finished stock.

### Waste
- Users can record wastage by item, quantity, batch, and reason.
- Waste posting must reduce stock and retain traceability.

### Dashboard and Reports
- Show low-stock count, inventory value, and branch-level inventory summary.
- Provide current inventory balance view by branch.
- Expand later into valuation, wastage, and operational reports.

## Non-Functional Requirements
- Desktop-first responsive UI
- Role-based security
- Branch-level data isolation in backend logic
- Auditability of all stock movements
- Consistent logging for backend operations
- Configurable environment-based deployment
- Scalable architecture for additional modules and branches

## Current Product Status
### Implemented
- Monorepo structure
- Desktop shell and routing
- Backend API modules
- Shared schemas and types
- Unified stock movement concept
- Pino-based backend logging
- Combined local dev runner

### Not Yet Implemented Fully
- DB-backed users and roles
- Full master-data UI
- Complete production, sales, and waste UI forms
- Full branch management
- Rich dashboard/reporting
- End-to-end offline sync and replay

## Risks
- Current frontend still contains placeholder operational pages.
- Auth is not yet production-ready.
- Some backend modules are still scaffold-level outside the inventory core.
- Multi-branch and offline behavior require more explicit workflow refinement.
