import { env } from "./env";
import { getSessionToken } from "./session";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

interface RequestOptions extends RequestInit {
  timeout?: number;
}

export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { timeout = 10000, headers, ...restOptions } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const token = await getSessionToken();
  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const url = `${env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers: { ...defaultHeaders, ...headers },
      signal: controller.signal,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Handle unauthorized
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          window.location.href = "/auth/login";
        }
      }

      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }

      throw new ApiError(
        response.status,
        errorData.message || response.statusText || "An error occurred",
        errorData
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if ((error as Error).name === "AbortError") {
      throw new ApiError(408, "Request timeout");
    }
    throw new ApiError(500, (error as Error).message || "Network error");
  } finally {
    clearTimeout(id);
  }
}

