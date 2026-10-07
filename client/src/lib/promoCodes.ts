import type { PromoCode } from "@/types/promoCode";

const API_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://priestservices.astroved.com";

export async function getPromoCodes() {
    const response = await fetch(`${API_URL}/api/promos`, { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to fetch promo codes");
    return result.data as PromoCode[];
}

export async function createPromoCode(data: Partial<PromoCode>) {
    const response = await fetch(`${API_URL}/api/promos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to create promo code");
    return result.data;
}

export async function updatePromoCode(id: string, data: Partial<PromoCode>) {
    const response = await fetch(`${API_URL}/api/promos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to update promo code");
    return result.data;
}

export async function deletePromoCode(id: string) {
    const response = await fetch(`${API_URL}/api/promos/${id}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to delete promo code");
    return result;
}

export async function togglePromoCode(id: string, isActive: boolean) {
    const response = await fetch(`${API_URL}/api/promos/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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
    const response = await fetch(`${API_URL}/api/promos/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to apply promo code");
    return result.data;
}
