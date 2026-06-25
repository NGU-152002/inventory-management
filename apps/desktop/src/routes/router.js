import { jsx as _jsx } from "react/jsx-runtime";
import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { AppShell } from "../components/AppShell";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { InventoryPage } from "../features/inventory/InventoryPage";
import { PurchasesPage } from "../features/purchases/PurchasesPage";
import { ProductionPage } from "../features/production/ProductionPage";
import { SalesPage } from "../features/sales/SalesPage";
import { WastePage } from "../features/waste/WastePage";
import { LoginPage } from "../features/auth/LoginPage";
const rootRoute = createRootRoute({
    component: () => _jsx(AppShell, {})
});
const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: DashboardPage
});
const inventoryRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/inventory",
    component: InventoryPage
});
const purchasesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/purchases",
    component: PurchasesPage
});
const productionRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/production",
    component: ProductionPage
});
const salesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/sales",
    component: SalesPage
});
const wasteRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/waste",
    component: WastePage
});
const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/login",
    component: LoginPage
});
const routeTree = rootRoute.addChildren([
    dashboardRoute,
    inventoryRoute,
    purchasesRoute,
    productionRoute,
    salesRoute,
    wasteRoute,
    loginRoute
]);
export const router = createRouter({
    routeTree,
    defaultPreload: "intent"
});
