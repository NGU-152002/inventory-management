import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../shared/api/client";
import { getActiveBranchId } from "../../shared/auth/session";

type Balance = {
  itemId: string;
  batchNumber?: string;
  quantity: number;
  averageCost: number;
  expiryDate?: string;
};

export function InventoryPage() {
  const branchId = getActiveBranchId();
  const { data = [] } = useQuery({
    queryKey: ["inventory", branchId],
    enabled: Boolean(branchId),
    queryFn: () => apiFetch<Balance[]>(`/inventory/${branchId}/balances`)
  });

  return (
    <div className="panel">
      <h2>Inventory</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Batch</th>
            <th>Qty</th>
            <th>Avg Cost</th>
            <th>Expiry</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={`${row.itemId}-${row.batchNumber ?? "none"}`}>
              <td>{row.itemId}</td>
              <td>{row.batchNumber ?? "-"}</td>
              <td>{row.quantity}</td>
              <td>{row.averageCost}</td>
              <td>{row.expiryDate ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
