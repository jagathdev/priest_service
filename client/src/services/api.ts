import { getInMemoryUserToken } from "@/contexts/UserContext";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  tokenType?: "admin" | "user";
}

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Universal token resolver preserving backward compatibility across
 * In-memory UserContext, document.cookie, and localStorage fallback.
 */
export const getAuthToken = (): string | null => {
  const isValidToken = (t: any): t is string =>
    typeof t === "string" && t.trim() !== "" && t !== "undefined" && t !== "null";

  // 1. Check in-memory UserContext token
  try {
    const memoryToken = getInMemoryUserToken();
    if (isValidToken(memoryToken)) return memoryToken.trim();
  } catch {
    // context not ready
  }

  // 2. Check environment variable token if provided
  const envAdminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN;
  if (isValidToken(envAdminToken)) return envAdminToken.trim();

  if (typeof window === "undefined") return null;

  // 3. Admin-specific preference when on /admin routes (check cookie only)
  const isAdminRoute =
    typeof window !== "undefined" && window.location.pathname.startsWith("/admin");
  if (isAdminRoute) {
    const adminMatch = document.cookie.match(/(?:^|;\s*)adminToken=([^;]+)/);
    if (adminMatch && isValidToken(adminMatch[1])) {
      const decoded = decodeURIComponent(adminMatch[1]);
      if (isValidToken(decoded)) return decoded.trim();
    }
  }

  // 4. Fallback: Check localStorage for user token
  try {
    const localToken = localStorage.getItem("token");
    if (isValidToken(localToken)) return localToken.trim();
  } catch {
    // localStorage might not be accessible
  }

  // 5. Fallback: Check document.cookie
  if (typeof document !== "undefined") {
    const adminMatch = document.cookie.match(/(?:^|;\s*)adminToken=([^;]+)/);
    if (adminMatch && isValidToken(adminMatch[1]) && isAdminRoute) {
      const decoded = decodeURIComponent(adminMatch[1]);
      if (isValidToken(decoded)) return decoded.trim();
    }

    const match =
      document.cookie.match(/(?:^|;\s*)token=([^;]+)/) ||
      document.cookie.match(/(?:^|;\s*)adminToken=([^;]+)/);
    if (match && isValidToken(match[1])) {
      const decoded = decodeURIComponent(match[1]);
      if (isValidToken(decoded)) return decoded.trim();
    }
  }

  return null;
};

export function getBaseApiUrl(): string {
  return API_BASE_URL;
}

/**
 * Enterprise universal API fetcher supporting options, query params, and credentials
 */
export async function apiClient<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, headers = {}, ...customConfig } = options;
  const baseUrl = getBaseApiUrl();

  let url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        searchParams.append(key, String(val));
      }
    });
    const qs = searchParams.toString();
    if (qs) {
      url += (url.includes("?") ? "&" : "?") + qs;
    }
  }

  const token = getAuthToken();

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const config: RequestInit = {
    credentials: "include",
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...(headers as Record<string, string>),
    },
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    let errorData: any = null;
    try {
      errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      errorMessage = response.statusText;
    }

    if (response.status === 401 && typeof window !== "undefined") {
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("mockUser");
        document.cookie = "token=; path=/; max-age=0;";
        document.cookie = "mockUser=; path=/; max-age=0;";
        document.cookie = "userLogin=false; path=/; max-age=0;";
        window.dispatchEvent(new Event("auth:unauthorized"));
      } catch {
        // ignore
      }
    }

    throw new ApiError(errorMessage, response.status, errorData);
  }

  // Handle empty responses (204 No Content)
  const text = await response.text();
  if (!text || !text.trim()) return {} as T;

  try {
    return JSON.parse(text) as T;
  } catch (err) {
    console.error("[api.ts] Failed to parse response text as JSON:", err, text.slice(0, 200));
    return {} as T;
  }
}
