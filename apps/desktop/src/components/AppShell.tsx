import { useState } from "react";
import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { getSession, logoutSession } from "../shared/auth/session";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/inventory", label: "Inventory" },
  { to: "/purchases", label: "Purchases" },
  { to: "/production", label: "Production" },
  { to: "/sales", label: "Sales" },
  { to: "/waste", label: "Waste" }
] as const;

export function AppShell() {
  const navigate = useNavigate();
  const session = getSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  async function handleLogout() {
    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      await logoutSession();
      navigate({ to: "/login" });
    } catch {
      setLogoutError("Logout failed. Session was cleared locally.");
      navigate({ to: "/login" });
    } finally {
      setIsLoggingOut(false);
    }
  }

  const activeBranch = session?.branches.find((branch) => branch._id === session.activeBranchId);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <p className="sidebar-kicker">Operations Console</p>
          <h1>Inventory Ops</h1>
        </div>

        <section className="user-card">
          <div className="user-avatar">{session?.user.name?.slice(0, 1).toUpperCase() ?? "G"}</div>
          <div className="user-meta">
            <strong>{session?.user.name ?? "Guest"}</strong>
            <p>{session?.user.role ?? "No role"}</p>
          </div>
          <span className="branch-badge">{activeBranch?.code ?? "N/A"}</span>
        </section>

        <p className="branch-name">{activeBranch?.name ?? "No branch assigned"}</p>

        <nav aria-label="Primary" className="sidebar-nav">
          <ul className="sidebar-nav-list">
            {navItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  activeProps={{ className: "nav-link nav-link-active" }}
                  inactiveProps={{ className: "nav-link" }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-button" disabled={isLoggingOut} onClick={handleLogout} type="button">
            {isLoggingOut ? "Signing out..." : "Logout"}
          </button>
          {logoutError ? <p className="logout-error">{logoutError}</p> : null}
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
