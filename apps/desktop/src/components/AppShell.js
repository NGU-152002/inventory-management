import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, Outlet } from "@tanstack/react-router";
export function AppShell() {
    return (_jsxs("div", { className: "shell", children: [_jsxs("aside", { className: "sidebar", children: [_jsx("h1", { children: "Inventory Ops" }), _jsxs("nav", { children: [_jsx(Link, { to: "/", children: "Dashboard" }), _jsx(Link, { to: "/inventory", children: "Inventory" }), _jsx(Link, { to: "/purchases", children: "Purchases" }), _jsx(Link, { to: "/production", children: "Production" }), _jsx(Link, { to: "/sales", children: "Sales" }), _jsx(Link, { to: "/waste", children: "Waste" })] })] }), _jsx("main", { className: "content", children: _jsx(Outlet, {}) })] }));
}
