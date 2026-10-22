import { getInMemoryUserToken } from "@/contexts/UserContext";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://priestservices.astroved.com';

export const getAuthToken = (): string | null => {
  const isValidToken = (t: any): t is string =>
    typeof t === 'string' && t.trim() !== '' && t !== 'undefined' && t !== 'null';

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

  if (typeof window === 'undefined') return null;

  // 3. Fallback: Check localStorage
  try {
    const localToken = localStorage.getItem('token');
    if (isValidToken(localToken)) return localToken.trim();

    const localAdminToken = localStorage.getItem('adminToken');
    if (isValidToken(localAdminToken)) return localAdminToken.trim();
  } catch {
    // localStorage might not be accessible
  }

  // 4. Fallback: Check document.cookie
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/(?:^|;\s*)(?:token|adminToken)=([^;]+)/);
    if (match && isValidToken(match[1])) {
      const decoded = decodeURIComponent(match[1]);
      if (isValidToken(decoded)) return decoded.trim();
    }
  }

  return null;
};

export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: 'include',
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'Something went wrong';
    try {
      const error = await response.json();
      errorMessage = error.message || error.error || errorMessage;
    } catch {
      // If it's not JSON, fallback to status text
      errorMessage = response.statusText;
    }

    if (response.status === 401 && typeof window !== 'undefined') {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('mockUser');
        document.cookie = 'token=; path=/; max-age=0;';
        document.cookie = 'mockUser=; path=/; max-age=0;';
        document.cookie = 'userLogin=false; path=/; max-age=0;';
        window.dispatchEvent(new Event('auth:unauthorized'));
      } catch {
        // ignore storage cleanup errors
      }
    }

    throw new Error(errorMessage);
  }

  // Handle empty responses (like 204 No Content)
  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

