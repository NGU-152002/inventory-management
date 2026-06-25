import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../shared/api/client";
import { getActiveBranchId } from "../../shared/auth/session";

type Summary = {
  branchId: string;
  lowStockCount: number;
  inventoryValue: number;
  todaysSales: number;
  todaysWasteCost: number;
};

export function DashboardPage() {
  const branchId = getActiveBranchId();
  const { data } = useQuery({
    queryKey: ["dashboard", branchId],
    enabled: Boolean(branchId),
    queryFn: () => apiFetch<Summary>(`/dashboard/${branchId}`)
  });

  return (
    <div className="stack">
      <div className="panel">
        <h2>Today at a glance</h2>
        <div className="metric-grid">
          <div className="metric">
            <strong>Inventory Value</strong>
            <div>{data?.inventoryValue ?? 0}</div>
          </div>
          <div className="metric">
            <strong>Low Stock Items</strong>
            <div>{data?.lowStockCount ?? 0}</div>
          </div>
          <div className="metric">
            <strong>Sales Today</strong>
            <div>{data?.todaysSales ?? 0}</div>
          </div>
          <div className="metric">
            <strong>Waste Cost</strong>
            <div>{data?.todaysWasteCost ?? 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
