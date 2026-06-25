import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../shared/api/client";
export function DashboardPage() {
    const branchId = "main-branch";
    const { data } = useQuery({
        queryKey: ["dashboard", branchId],
        queryFn: () => apiFetch(`/dashboard/${branchId}`)
    });
    return (_jsx("div", { className: "stack", children: _jsxs("div", { className: "panel", children: [_jsx("h2", { children: "Today at a glance" }), _jsxs("div", { className: "metric-grid", children: [_jsxs("div", { className: "metric", children: [_jsx("strong", { children: "Inventory Value" }), _jsx("div", { children: data?.inventoryValue ?? 0 })] }), _jsxs("div", { className: "metric", children: [_jsx("strong", { children: "Low Stock Items" }), _jsx("div", { children: data?.lowStockCount ?? 0 })] }), _jsxs("div", { className: "metric", children: [_jsx("strong", { children: "Sales Today" }), _jsx("div", { children: data?.todaysSales ?? 0 })] }), _jsxs("div", { className: "metric", children: [_jsx("strong", { children: "Waste Cost" }), _jsx("div", { children: data?.todaysWasteCost ?? 0 })] })] })] }) }));
}
