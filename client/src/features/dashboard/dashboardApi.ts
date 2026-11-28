import { DashboardStatsResponse } from "./types";

export const getAdminToken = (): string => {
  if (typeof document === "undefined") return "";
  try {
    const match = document.cookie.match(/(?:^|;\s*)adminToken=([^;]*)/);
    if (match && match[1]) return decodeURIComponent(match[1]);
    const local = localStorage.getItem("adminToken");
    if (local) return local;
  } catch {
    // Ignore storage errors
  }
  return "";
};

export interface FetchDashboardStatsParams {
  startDate?: string;
  endDate?: string;
}

export const fetchDashboardMetrics = async (
  params?: FetchDashboardStatsParams
): Promise<DashboardStatsResponse> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
  const token = getAdminToken();

  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.set("startDate", params.startDate);
  if (params?.endDate) queryParams.set("endDate", params.endDate);

  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : "";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseUrl}/api/analytics/visitor-stats${queryStr}`, {
    headers,
    credentials: "include",
    cache: "no-store",
  });

  const resData = await res.json();
  if (!res.ok || !resData.success || !resData.data) {
    throw new Error(resData.message || "Failed to load dashboard metrics");
  }

  return resData.data as DashboardStatsResponse;
};
