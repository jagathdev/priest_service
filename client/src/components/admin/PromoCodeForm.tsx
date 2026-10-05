"use client";

import { useState } from "react";
import { createPromoCode, updatePromoCode } from "@/lib/promoCodes";
import type { PromoCode } from "@/types/promoCode";

interface PromoCodeFormProps {
    promo?: PromoCode;
}

export default function PromoCodeForm({ promo }: PromoCodeFormProps) {
    const isEdit = Boolean(promo);

    const [code, setCode] = useState(promo?.code || "");
    const [description, setDescription] = useState(promo?.description || "");
    const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">(
        promo?.discountType || "PERCENTAGE"
    );
    const [discountValue, setDiscountValue] = useState(String(promo?.discountValue || ""));
    const [maxDiscount, setMaxDiscount] = useState(
        promo?.maxDiscount !== null && promo?.maxDiscount !== undefined
            ? String(promo.maxDiscount)
            : ""
    );
    const [minimumOrderAmount, setMinimumOrderAmount] = useState(
        String(promo?.minimumOrderAmount || 0)
    );
    const [startDate, setStartDate] = useState(
        promo ? promo.startDate.slice(0, 10) : ""
    );
    const [endDate, setEndDate] = useState(
        promo ? promo.endDate.slice(0, 10) : ""
    );
    const [usageLimit, setUsageLimit] = useState(
        promo?.usageLimit !== null && promo?.usageLimit !== undefined
            ? String(promo.usageLimit)
            : ""
    );
    const [usageLimitPerUser, setUsageLimitPerUser] = useState(
        String(promo?.usageLimitPerUser || 1)
    );
    const [applicableServices, setApplicableServices] = useState(
        promo?.applicableServices || "ALL"
    );
    const [isActive, setIsActive] = useState(promo?.isActive ?? true);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (discountType === "PERCENTAGE" && Number(discountValue) > 100) {
            alert("Percentage discount cannot exceed 100%");
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            alert("Start date cannot be after end date");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                code,
                description,
                discountType,
                discountValue: Number(discountValue),
                maxDiscount: maxDiscount ? Number(maxDiscount) : null,
                minimumOrderAmount: Number(minimumOrderAmount || 0),
                startDate,
                endDate,
                usageLimit: usageLimit ? Number(usageLimit) : null,
                usageLimitPerUser: Number(usageLimitPerUser || 1),
                applicableServices,
                applicablePackages: [],
                isActive,
            };

            if (isEdit && promo) {
                await updatePromoCode(promo._id, payload);
            } else {
                await createPromoCode(payload);
            }

            window.location.href = "/admin/promo-codes";
        } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to save promo code");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl space-y-8 pb-10">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
                <div className="border-b border-gray-100 pb-4 mb-6">
                    <h2 className="text-lg font-bold text-[#2d2a6e]">Basic Details</h2>
                    <p className="text-xs font-medium text-gray-500 mt-1">Core information about this promo code</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="mb-2 block text-xs font-bold text-[#2d2a6e]">Promo Code <span className="text-red-500">*</span></label>
                        <input
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="e.g. PUJA10"
                            required
                            disabled={isEdit}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold outline-none focus:border-[#069e5d] focus:ring-1 focus:ring-[#069e5d] transition-all disabled:bg-gray-50 disabled:text-gray-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-xs font-bold text-[#2d2a6e]">Applicable Service <span className="text-red-500">*</span></label>
                        <select
                            value={applicableServices}
                            onChange={(e) => setApplicableServices(e.target.value as "ALL" | "POOJA" | "HOMA")}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-[#069e5d] focus:ring-1 focus:ring-[#069e5d] transition-all"
                        >
                            <option value="ALL">All Services</option>
                            <option value="POOJA">Pooja Only</option>
                            <option value="HOMA">Homa Only</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-xs font-bold text-[#2d2a6e]">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g. 10% discount for all Puja bookings"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium outline-none focus:border-[#069e5d] focus:ring-1 focus:ring-[#069e5d] transition-all min-h-[100px]"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
                <div className="border-b border-gray-100 pb-4 mb-6">
                    <h2 className="text-lg font-bold text-[#2d2a6e]">Discount Logic</h2>
                    <p className="text-xs font-medium text-gray-500 mt-1">Configure how much and when the discount applies</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="mb-2 block text-xs font-bold text-[#2d2a6e]">Discount Type <span className="text-red-500">*</span></label>
                        <select
                            value={discountType}
                            onChange={(e) => setDiscountType(e.target.value as "PERCENTAGE" | "FIXED")}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-[#069e5d] focus:ring-1 focus:ring-[#069e5d] transition-all"
                        >
                            <option value="PERCENTAGE">Percentage (%)</option>
                            <option value="FIXED">Fixed Amount (₹)</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-2 block text-xs font-bold text-[#2d2a6e]">Discount Value <span className="text-red-500">*</span></label>
                        <div className="relative">
                            {discountType === "FIXED" && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>}
                            {discountType === "PERCENTAGE" && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</span>}
                            <input
                                type="number"
                                min="0"
                                value={discountValue}
                                onChange={(e) => setDiscountValue(e.target.value)}
                                required
                                placeholder={discountType === "PERCENTAGE" ? "10" : "500"}
                                className={`w-full rounded-xl border border-gray-200 py-3 text-sm font-semibold outline-none focus:border-[#069e5d] focus:ring-1 focus:ring-[#069e5d] transition-all ${discountType === "FIXED" ? "pl-8 pr-4" : "pl-4 pr-8"}`}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {discountType === "PERCENTAGE" && (
                        <div>
                            <label className="mb-2 block text-xs font-bold text-[#2d2a6e]">Maximum Discount (₹)</label>
                            <input
                                type="number"
                                min="0"
                                value={maxDiscount}
                                onChange={(e) => setMaxDiscount(e.target.value)}
                                placeholder="e.g. 1000"
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold outline-none focus:border-[#069e5d] focus:ring-1 focus:ring-[#069e5d] transition-all"
                            />
                            <p className="mt-1.5 text-[10px] font-bold text-gray-400">Leave empty for no upper limit</p>
                        </div>
                    )}
                    <div>
                        <label className="mb-2 block text-xs font-bold text-[#2d2a6e]">Minimum Order Amount (₹)</label>
                        <input
                            type="number"
                            min="0"
                            value={minimumOrderAmount}
                            onChange={(e) => setMinimumOrderAmount(e.target.value)}
                            placeholder="e.g. 500"
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold outline-none focus:border-[#069e5d] focus:ring-1 focus:ring-[#069e5d] transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
                <div className="border-b border-gray-100 pb-4 mb-6">
                    <h2 className="text-lg font-bold text-[#2d2a6e]">Validity & Limits</h2>
                    <p className="text-xs font-medium text-gray-500 mt-1">Control who can use this code and when</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="mb-2 block text-xs font-bold text-[#2d2a6e]">Start Date <span className="text-red-500">*</span></label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-[#069e5d] focus:ring-1 focus:ring-[#069e5d] transition-all"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-xs font-bold text-[#2d2a6e]">End Date <span className="text-red-500">*</span></label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-[#069e5d] focus:ring-1 focus:ring-[#069e5d] transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="mb-2 block text-xs font-bold text-[#2d2a6e]">Total Usage Limit</label>
                        <input
                            type="number"
                            min="0"
                            value={usageLimit}
                            onChange={(e) => setUsageLimit(e.target.value)}
                            placeholder="e.g. 100"
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold outline-none focus:border-[#069e5d] focus:ring-1 focus:ring-[#069e5d] transition-all"
                        />
                        <p className="mt-1.5 text-[10px] font-bold text-gray-400">Total times this code can be used by anyone</p>
                    </div>
                    <div>
                        <label className="mb-2 block text-xs font-bold text-[#2d2a6e]">Usage Per User</label>
                        <input
                            type="number"
                            min="1"
                            value={usageLimitPerUser}
                            onChange={(e) => setUsageLimitPerUser(e.target.value)}
                            placeholder="e.g. 1"
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold outline-none focus:border-[#069e5d] focus:ring-1 focus:ring-[#069e5d] transition-all"
                        />
                    </div>
                </div>
                
                <div className="pt-4 mt-4 border-t border-gray-100">
                    <label className="flex items-center gap-3 cursor-pointer w-fit group">
                        <div className={`w-11 h-6 rounded-full transition-colors flex items-center p-1 ${isActive ? "bg-[#069e5d]" : "bg-gray-300"}`}>
                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${isActive ? "translate-x-5" : "translate-x-0"}`}></div>
                        </div>
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="hidden"
                        />
                        <span className={`text-sm font-bold ${isActive ? "text-[#069e5d]" : "text-gray-500"}`}>
                            {isActive ? "Code is Active" : "Code is Inactive"}
                        </span>
                    </label>
                </div>
            </div>

            <div className="flex items-center gap-4 mt-8 pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-[#069e5d] hover:bg-[#058a51] px-8 py-3.5 text-sm font-bold text-white shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
                >
                    {loading && (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                    {loading ? "Saving..." : isEdit ? "Update Promo Code" : "Create Promo Code"}
                </button>
                <button
                    type="button"
                    onClick={() => (window.location.href = "/admin/promo-codes")}
                    className="rounded-xl border border-gray-200 bg-white px-8 py-3.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
