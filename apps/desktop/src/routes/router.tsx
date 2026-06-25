import { createMemoryHistory, createRootRoute, createRoute, createRouter, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "../components/AppShell";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { InventoryPage } from "../features/inventory/InventoryPage";
import { PurchasesPage } from "../features/purchases/PurchasesPage";
import { ProductionPage } from "../features/production/ProductionPage";
import { SalesPage } from "../features/sales/SalesPage";
import { WastePage } from "../features/waste/WastePage";
import { LoginPage } from "../features/auth/LoginPage";
import { hasSession, validateSession } from "../shared/auth/session";

const rootRoute = createRootRoute({
  component: Outlet
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: async () => {
    const session = await validateSession();
    throw redirect({ to: session ? "/dashboard" : "/login" });
  }
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  beforeLoad: async () => {
    if (!hasSession()) {
      return;
    }

    const session = await validateSession();
    if (session) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: LoginPage
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app",
  beforeLoad: async () => {
    const session = await validateSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
  },
  component: AppShell
});

const dashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/dashboard",
  component: DashboardPage
});

const inventoryRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/inventory",
  component: InventoryPage
});

const purchasesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/purchases",
  component: PurchasesPage
});

const productionRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/production",
  component: ProductionPage
});

const salesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/sales",
  component: SalesPage
});

const wasteRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/waste",
  component: WastePage
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  appRoute.addChildren([
    dashboardRoute,
    inventoryRoute,
    purchasesRoute,
    productionRoute,
    salesRoute,
    wasteRoute
  ])
]);

export function createAppRouter(initialPath = "/") {
  return createRouter({
    routeTree,
    defaultPreload: "intent",
    history: createMemoryHistory({
      initialEntries: [initialPath]
    })
  });
}

export const router = createAppRouter();
