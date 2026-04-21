// Admin bearer token storage. Held in sessionStorage so it's cleared when
// the tab closes. This is the shared secret used to hit the worker's
// mutation endpoints (POST/PUT/PATCH/DELETE /api/data-centers*, /api/sync,
// /api/neon/sync). The worker rejects mismatched or missing tokens with 401.

const STORAGE_KEY = "datasist.adminToken";

type Listener = (token: string | null) => void;
const listeners = new Set<Listener>();

export function getAdminToken(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string | null): void {
  try {
    if (token) sessionStorage.setItem(STORAGE_KEY, token);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* private-mode / storage disabled — ignore */
  }
  listeners.forEach((fn) => fn(token));
}

export function subscribeAdminToken(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function hasAdminToken(): boolean {
  return !!getAdminToken();
}
