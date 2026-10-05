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
    createdAt: string;
    updatedAt: string;
}
