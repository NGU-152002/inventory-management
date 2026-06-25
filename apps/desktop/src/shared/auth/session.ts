import type { AuthSession } from "@inventory-management/shared";

const TOKEN_KEY = "inventory_token";
const SESSION_KEY = "inventory_session";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setSession(session: AuthSession) {
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession(): AuthSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) as AuthSession : null;
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
}

export function getActiveBranchId() {
  return getSession()?.activeBranchId ?? null;
}
