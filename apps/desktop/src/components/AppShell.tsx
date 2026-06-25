import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { clearSession, getSession } from "../shared/auth/session";

export function AppShell() {
  const navigate = useNavigate();
  const session = getSession();

  function handleLogout() {
    clearSession();
    navigate({ to: "/login" });
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <h1>Inventory Ops</h1>
        <p>{session?.user.name ?? "Guest"}</p>
        <p>{session?.branches.find((branch) => branch.id === session.activeBranchId)?.name ?? "No branch"}</p>
        <nav>
          <Link to="/">Dashboard</Link>
          <Link to="/inventory">Inventory</Link>
          <Link to="/purchases">Purchases</Link>
          <Link to="/production">Production</Link>
          <Link to="/sales">Sales</Link>
          <Link to="/waste">Waste</Link>
        </nav>
        <button onClick={handleLogout} type="button">Logout</button>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
