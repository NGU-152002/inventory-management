import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { AuthSession } from "@inventory-management/shared";
import { apiFetch } from "../../shared/api/client";
import { setSession } from "../../shared/auth/session";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("owner@inventory.local");
  const [password, setPassword] = useState("ChangeMe123!");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const response = await apiFetch<AuthSession>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      setSession(response);
      navigate({ to: "/" });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Login failed");
    }
  }

  return (
    <div className="content">
      <div className="panel" style={{ maxWidth: 420, margin: "72px auto" }}>
        <h2>Inventory Management Login</h2>
        <form className="stack" onSubmit={handleSubmit}>
          <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            type="password"
          />
          <button type="submit">Sign In</button>
          {error ? <p>{error}</p> : null}
        </form>
      </div>
    </div>
  );
}
