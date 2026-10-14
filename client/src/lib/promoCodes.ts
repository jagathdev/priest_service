import type { PromoCode } from "@/types/promoCode";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";

const getAdminAuthHeaders = (): Record<string, string> => {
    if (typeof window === "undefined") return {};
    const match = document.cookie.match(/(?:^|;\s*)(?:adminToken|token)=([^;]+)/);
    const cookieToken = match ? decodeURIComponent(match[1]) : null;
    const localToken = localStorage.getItem("adminToken") || localStorage.getItem("token");
    const token = cookieToken || localToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function getPromoCodes() {
    const response = await fetch(`${API_URL}/api/promos`, {
        cache: "no-store",
        headers: {
            ...getAdminAuthHeaders(),
        },
        credentials: "include",
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to fetch promo codes");
    return result.data as PromoCode[];
}

export async function createPromoCode(data: Partial<PromoCode>) {
    const response = await fetch(`${API_URL}/api/promos`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAdminAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to create promo code");
    return result.data;
}

export async function updatePromoCode(id: string, data: Partial<PromoCode>) {
    const response = await fetch(`${API_URL}/api/promos/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...getAdminAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to update promo code");
    return result.data;
}

export async function deletePromoCode(id: string) {
    const response = await fetch(`${API_URL}/api/promos/${id}`, {
        method: "DELETE",
        headers: {
            ...getAdminAuthHeaders(),
        },
        credentials: "include",
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to delete promo code");
    return result;
}

export async function togglePromoCode(id: string, isActive: boolean) {
    const response = await fetch(`${API_URL}/api/promos/${id}/status`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            ...getAdminAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({ isActive }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to update status");
    return result.data;
}

export async function applyPromoCode(data: {
    code: string;
    orderAmount: number;
    serviceType: "POOJA" | "HOMA";
    packageId: string;
    userId?: string;
}) {
    let token = null;
    if (typeof window !== "undefined") {
        token = localStorage.getItem("token") || localStorage.getItem("adminToken");
        if (!token) {
            const match = document.cookie.match(/(?:^|;\s*)(?:token|adminToken)=([^;]+)/);
            if (match) token = decodeURIComponent(match[1]);
        }
    }

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/api/promos/apply`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to apply promo code");
    return result.data;
}
