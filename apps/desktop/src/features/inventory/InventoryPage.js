import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../shared/api/client";
export function InventoryPage() {
    const branchId = "main-branch";
    const { data = [] } = useQuery({
        queryKey: ["inventory", branchId],
        queryFn: () => apiFetch(`/inventory/${branchId}/balances`)
    });
    return (_jsxs("div", { className: "panel", children: [_jsx("h2", { children: "Inventory" }), _jsxs("table", { className: "table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Item" }), _jsx("th", { children: "Batch" }), _jsx("th", { children: "Qty" }), _jsx("th", { children: "Avg Cost" }), _jsx("th", { children: "Expiry" })] }) }), _jsx("tbody", { children: data.map((row) => (_jsxs("tr", { children: [_jsx("td", { children: row.itemId }), _jsx("td", { children: row.batchNumber ?? "-" }), _jsx("td", { children: row.quantity }), _jsx("td", { children: row.averageCost }), _jsx("td", { children: row.expiryDate ?? "-" })] }, `${row.itemId}-${row.batchNumber ?? "none"}`))) })] })] }));
}
