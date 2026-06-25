# App Flow Document

## User Entry Flow
1. User launches the desktop application.
2. User reaches the login screen.
3. User signs in with credentials.
4. App loads branch-aware dashboard and navigation.

## Primary Navigation
- Dashboard
- Inventory
- Purchases
- Production
- Sales
- Waste

## Dashboard Flow
1. User opens Dashboard.
2. Frontend requests branch summary from API.
3. API resolves dashboard summary from cache or inventory balances.
4. User sees current inventory value, low-stock count, and key metrics.

## Inventory Flow
1. User opens Inventory.
2. Frontend requests branch balances.
3. API returns current item/batch balances.
4. User reviews quantity, average cost, and expiry data.

## Purchase Receipt Flow
1. User navigates to Purchases.
2. User enters or selects supplier and receipt details.
3. User adds receipt lines with item, quantity, cost, batch, and expiry.
4. Frontend submits receipt to API.
5. API validates payload.
6. Use case creates receipt record.
7. Inventory balance increases.
8. Stock ledger entry is created for each line.
9. Dashboard/inventory cache is invalidated.
10. Success response is shown to user.
11. If offline path is used later, request enters local queue and syncs later.

## Production Flow
1. User navigates to Production.
2. User selects product and production quantity.
3. Recipe defines ingredient consumption.
4. Frontend submits production order.
5. API validates order and recipe data.
6. Use case creates production order record.
7. Ingredient stock decreases.
8. Finished goods stock increases.
9. Ledger entries are written for both consume and output movements.
10. Cache is invalidated.
11. User receives completion response.

## Sales Flow
1. User navigates to Sales.
2. User records sold products and quantities.
3. Frontend submits sale.
4. API validates payload.
5. Use case creates sale record.
6. Finished goods stock decreases.
7. Ledger entries are written.
8. Cache is invalidated.
9. User receives confirmation.

## Waste Flow
1. User navigates to Waste.
2. User selects item, quantity, optional batch, and reason.
3. Frontend submits waste entry.
4. API validates payload.
5. Use case creates waste record.
6. Stock decreases.
7. Ledger entry is written.
8. Cache is invalidated.
9. User receives confirmation.

## Authentication Flow
1. User submits credentials.
2. API validates credentials.
3. JWT is issued.
4. Desktop client stores token locally.
5. Future API requests include bearer token.

## Error Flow
### Config Error
- API loads env file.
- If required env vars are missing, Pino logs config error and startup stops.

### Mongo Connection Error
- API logs `MongoDB connection failed`.
- Startup stops before server listen.

### Redis Connection Error
- API logs `Redis connection failed`.
- Startup stops before server listen.

### Domain Error
- Example: insufficient stock.
- Use case throws domain error.
- Route maps error to HTTP response.
- Frontend should show actionable error message.

## Offline Queue Flow
### Current State
- Queue foundation exists in desktop app.
- Purchases sample flow can enqueue failed request locally.

### Intended Future Flow
1. User action fails due to connectivity.
2. Action is stored locally.
3. Sync worker retries when connection is restored.
4. Server accepts or rejects action.
5. UI reflects synced or failed state.

## Admin and Future Flows
- User/role management
- Branch management
- Product and recipe master data
- Advanced reports
- Audit/history screens
