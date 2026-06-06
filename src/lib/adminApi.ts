const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export type AdminUser = {
  id: string;
  email: string;
  phone?: string | null;
  full_name?: string | null;
  roles: string[];
  is_admin: boolean;
};

export function getAdminToken() {
  return localStorage.getItem("organic_admin_token");
}

export function setAdminSession(token: string, user: AdminUser) {
  localStorage.setItem("organic_admin_token", token);
  localStorage.setItem("organic_admin_user", JSON.stringify(user));
}

export function getStoredAdminUser(): AdminUser | null {
  const raw = localStorage.getItem("organic_admin_user");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAdminSession() {
  localStorage.removeItem("organic_admin_token");
  localStorage.removeItem("organic_admin_user");
}

export async function adminApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || response.statusText);
  }

  return response.json();
}

export { API_BASE_URL };
