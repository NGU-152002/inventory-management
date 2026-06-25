import { createRootRoute, createRoute, createRouter, redirect } from "@tanstack/react-router";
import { AppShell } from "../components/AppShell";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { InventoryPage } from "../features/inventory/InventoryPage";
import { PurchasesPage } from "../features/purchases/PurchasesPage";
import { ProductionPage } from "../features/production/ProductionPage";
import { SalesPage } from "../features/sales/SalesPage";
import { WastePage } from "../features/waste/WastePage";
import { LoginPage } from "../features/auth/LoginPage";
import { getToken } from "../shared/auth/session";

const requireAuth = () => {
  if (!getToken()) {
    throw redirect({ to: "/login" });
  }
};

const rootRoute = createRootRoute({
  component: () => <AppShell />
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: requireAuth,
  component: DashboardPage
});

const inventoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/inventory",
  beforeLoad: requireAuth,
  component: InventoryPage
});

const purchasesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/purchases",
  beforeLoad: requireAuth,
  component: PurchasesPage
});

const productionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/production",
  beforeLoad: requireAuth,
  component: ProductionPage
});

const salesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sales",
  beforeLoad: requireAuth,
  component: SalesPage
});

const wasteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/waste",
  beforeLoad: requireAuth,
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
