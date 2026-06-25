// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AuthSession } from "@inventory-management/shared";
import { createAppRouter } from "../../../apps/desktop/src/routes/router";
import { clearSession, getSession, hasSession, setSession } from "../../../apps/desktop/src/shared/auth/session";

const sessionFixture: AuthSession = {
  token: "test-token",
  user: {
    _id: "user-1",
    email: "owner@inventory.local",
    name: "System Owner",
    role: "owner",
    branchIds: ["branch-1"],
    createdAt: "2026-06-25T00:00:00.000Z",
    updatedAt: "2026-06-25T00:00:00.000Z"
  },
  branches: [
    {
      _id: "branch-1",
      code: "MAIN",
      name: "Main Branch",
      createdAt: "2026-06-25T00:00:00.000Z",
      updatedAt: "2026-06-25T00:00:00.000Z"
    }
  ],
  activeBranchId: "branch-1"
};

function renderApp(initialPath: string) {
  const router = createAppRouter(initialPath);
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

  const view = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );

  return { router, queryClient, ...view };
}

beforeEach(() => {
  localStorage.clear();
  Object.defineProperty(window, "scrollTo", {
    value: vi.fn(),
    writable: true
  });
  vi.restoreAllMocks();
  vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === "string"
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;

    if (url.endsWith("/auth/login") && init?.method === "POST") {
      return new Response(JSON.stringify(sessionFixture), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (url.endsWith("/auth/me")) {
      return new Response(JSON.stringify({
        token: "",
        user: sessionFixture.user,
        branches: sessionFixture.branches,
        activeBranchId: sessionFixture.activeBranchId
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (url.endsWith(`/dashboard/${sessionFixture.activeBranchId}`)) {
      return new Response(JSON.stringify({
        branchId: sessionFixture.activeBranchId,
        lowStockCount: 0,
        inventoryValue: 0,
        todaysSales: 0,
        todaysWasteCost: 0
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (url.endsWith("/auth/logout") && init?.method === "POST") {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ message: `Unhandled request: ${url}` }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }));
});

afterEach(() => {
  cleanup();
  clearSession();
  vi.unstubAllGlobals();
});

describe("auth desktop flow", () => {
  it("redirects unauthenticated users from /dashboard to /login", async () => {
    const { router } = renderApp("/dashboard");

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Inventory Management Login" })).toBeInTheDocument();
      expect(router.state.location.pathname).toBe("/login");
    });
  });

  it("logs in from the login page, stores the session, and navigates to /dashboard", async () => {
    const user = userEvent.setup();
    const { router } = renderApp("/login");

    const emailInput = await screen.findByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");

    await user.clear(emailInput);
    await user.type(emailInput, sessionFixture.user.email);
    await user.clear(passwordInput);
    await user.type(passwordInput, "ChangeMe123!");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/dashboard");
      expect(screen.getByRole("heading", { name: "Today at a glance" })).toBeInTheDocument();
    });

    expect(hasSession()).toBe(true);
    expect(getSession()).toMatchObject({
      token: sessionFixture.token,
      user: {
        _id: sessionFixture.user._id,
        email: sessionFixture.user.email
      },
      activeBranchId: sessionFixture.activeBranchId
    });
  });

  it("redirects authenticated users away from /login to /dashboard", async () => {
    setSession(sessionFixture);
    const { router } = renderApp("/login");

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/dashboard");
      expect(screen.getByRole("heading", { name: "Today at a glance" })).toBeInTheDocument();
    });
  });

  it("logs out, clears the stored session, and redirects to /login", async () => {
    setSession(sessionFixture);
    const { router } = renderApp("/dashboard");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Logout" }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/login");
      expect(screen.getByRole("heading", { name: "Inventory Management Login" })).toBeInTheDocument();
    });

    expect(hasSession()).toBe(false);
    expect(getSession()).toBeNull();
  });
});
