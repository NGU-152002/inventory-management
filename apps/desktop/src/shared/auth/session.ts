import type { AuthSession } from "@inventory-management/shared";

const AUTH_TOKEN_KEY = "auth_token";
const AUTH_SESSION_KEY = "auth_session";
const LEGACY_TOKEN_KEY = "inventory_token";
const LEGACY_SESSION_KEY = "inventory_session";
const API_URL = "http://localhost:4000";

function readFirst(keys: string[]) {
  for (const key of keys) {
    const value = localStorage.getItem(key);
    if (value) {
      return value;
    }
  }
  return null;
}

function clearLegacyKeys() {
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(LEGACY_SESSION_KEY);
}

export function getToken() {
  const token = readFirst([AUTH_TOKEN_KEY, LEGACY_TOKEN_KEY]);
  if (token && !localStorage.getItem(AUTH_TOKEN_KEY)) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  }
  return token;
}

export function setSession(session: AuthSession) {
  localStorage.setItem(AUTH_TOKEN_KEY, session.token);
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  clearLegacyKeys();
}

export function getSession(): AuthSession | null {
  const raw = readFirst([AUTH_SESSION_KEY, LEGACY_SESSION_KEY]);
  if (!raw) {
    return null;
  }

  const session = JSON.parse(raw) as AuthSession;
  if (!localStorage.getItem(AUTH_SESSION_KEY)) {
    localStorage.setItem(AUTH_SESSION_KEY, raw);
    localStorage.removeItem(LEGACY_SESSION_KEY);
  }
  return session;
}

export function hasSession() {
  return Boolean(getToken() && getSession());
}

export function clearSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_SESSION_KEY);
  clearLegacyKeys();
}

export function getActiveBranchId() {
  return getSession()?.activeBranchId ?? null;
}

export async function validateSession() {
  const token = getToken();
  const session = getSession();

  if (!token || !session) {
    clearSession();
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      clearSession();
      return null;
    }

    const sessionState = await response.json() as Omit<AuthSession, "token"> & { token?: string };
    const nextSession: AuthSession = {
      token,
      user: sessionState.user,
      branches: sessionState.branches,
      activeBranchId: sessionState.activeBranchId
    };

    setSession(nextSession);
    return nextSession;
  } catch {
    clearSession();
    return null;
  }
}

export async function logoutSession() {
  const token = getToken();

  try {
    if (token) {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  } finally {
    clearSession();
  }
}
