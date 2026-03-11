import { supabase } from "./supabase";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
  timeoutMs = 5000,
): Promise<T> {
  const authHeaders = await getAuthHeaders();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
        ...init.headers,
      },
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    let message: string;
    try {
      const body = await response.json();
      message = body.message ?? body.error ?? response.statusText;
    } catch {
      message = response.statusText;
    }
    throw new ApiError(response.status, response.statusText, message);
  }

  // 204 No Content
  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

// Auth module

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  monthlyIncome: number | null;
  currency: string;
}

/** Validates the current Supabase session against the backend and returns the user profile. */
export async function fetchSession(): Promise<AuthUser> {
  return apiFetch<AuthUser>("/api/auth/me");
}
