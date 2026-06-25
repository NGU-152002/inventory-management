import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { apiFetch } from "../../shared/api/client";
export function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("owner@inventory.local");
    const [password, setPassword] = useState("ChangeMe123!");
    const [error, setError] = useState(null);
    async function handleSubmit(event) {
        event.preventDefault();
        try {
            const response = await apiFetch("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password })
            });
            localStorage.setItem("inventory_token", response.token);
            navigate({ to: "/" });
        }
        catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : "Login failed");
        }
    }
    return (_jsx("div", { className: "content", children: _jsxs("div", { className: "panel", style: { maxWidth: 420, margin: "72px auto" }, children: [_jsx("h2", { children: "Inventory Management Login" }), _jsxs("form", { className: "stack", onSubmit: handleSubmit, children: [_jsx("input", { value: email, onChange: (event) => setEmail(event.target.value), placeholder: "Email" }), _jsx("input", { value: password, onChange: (event) => setPassword(event.target.value), placeholder: "Password", type: "password" }), _jsx("button", { type: "submit", children: "Sign In" }), error ? _jsx("p", { children: error }) : null] })] }) }));
}
