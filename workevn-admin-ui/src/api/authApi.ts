const API_BASE = import.meta.env.VITE_ADMIN_API_URL ?? "/api";
const AUTH_STORAGE_KEY = "workevn-admin-token";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export async function loginAdmin(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Unable to sign in. Please check your credentials.");
  }

  return response.json();
}

export async function fetchCurrentUser(token: string): Promise<{ user: AuthUser }> {
  const response = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Failed to load authenticated user");
  }

  return response.json();
}

export async function logoutAdmin(token: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) throw new Error("Logout failed");
  return response.json();
}

export async function forgotPassword(email: string): Promise<{ success: boolean; resetToken?: string }> {
  const response = await fetch(`${API_BASE}/auth/forgot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });

  if (!response.ok) throw new Error("Failed to request password reset");
  return response.json();
}

export async function resetPassword(token: string, password: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/auth/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password })
  });

  if (!response.ok) throw new Error("Failed to reset password");
  return response.json();
}

export { AUTH_STORAGE_KEY };
