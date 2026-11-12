export type DiscountType = "PERCENTAGE" | "FIXED";
export type ApplicableService = "ALL" | "POOJA" | "HOMA";

export interface PromoCode {
    _id: string;
    code: string;
    description: string;
    discountType: DiscountType;
    discountValue: number;
    maxDiscount: number | null;
    minimumOrderAmount: number;
    startDate: string;
    endDate: string;
    usageLimit: number | null;
    usedCount: number;
    usageLimitPerUser: number;
    applicableServices: ApplicableService;
    applicablePackages: string[];
    isActive: boolean;
    ordersCount?: number;
    totalRevenue?: number;
    totalDiscount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface PromoCodeUsageRecord {
    _id: string;
    discountAmount: number;
    createdAt: string;
    user: {
        _id: string | null;
        name: string;
        mobileNumber: string;
        email: string;
    };
    order: {
        _id: string;
        orderNumber: string;
        customerName: string;
        mobileNumber: string;
        totalAmount: number;
        discountAmount: number;
        paymentStatus: string;
        orderStatus: string;
        itemName: string;
        createdAt: string;
    } | null;
}

export interface PromoCodeUsageResponse {
    success: boolean;
    promo: {
        _id: string;
        code: string;
        discountType: DiscountType;
        discountValue: number;
        totalOrders: number;
        totalRevenue: number;
        totalDiscountGiven: number;
    };
    count: number;
    data: PromoCodeUsageRecord[];
}
