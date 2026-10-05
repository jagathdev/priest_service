"use client";

import { useState } from "react";
import { applyPromoCode } from "@/lib/promoCodes";

interface PromoCodeInputProps {
    orderAmount: number;
    serviceType: "POOJA" | "HOMA";
    packageId: string;
    userId?: string;
    onApplied?: (data: {
        promoCode: string;
        discountAmount: number;
        finalAmount: number;
    }) => void;
    onRemoved?: () => void;
}

export default function PromoCodeInput({
    orderAmount,
    serviceType,
    packageId,
    userId,
    onApplied,
    onRemoved,
}: PromoCodeInputProps) {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [applied, setApplied] = useState(false);
    const [discountAmount, setDiscountAmount] = useState(0);

    const handleApply = async () => {
        if (!code.trim()) {
            setError("Please enter a promo code");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const result = await applyPromoCode({
                code,
                orderAmount,
                serviceType,
                packageId,
                userId,
            });

            setApplied(true);
            setDiscountAmount(result.discountAmount);

            onApplied?.({
                promoCode: result.promoCode,
                discountAmount: result.discountAmount,
                finalAmount: result.finalAmount,
            });
        } catch (error) {
            setError(error instanceof Error ? error.message : "Invalid promo code");
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = () => {
        setCode("");
        setApplied(false);
        setDiscountAmount(0);
        setError("");
        onRemoved?.();
    };

    return (
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm mt-8">
            <h3 className="text-base font-extrabold text-stone-900 mb-4">
                Have a Promocode?
            </h3>

            {!applied ? (
                <div className="flex gap-2 sm:gap-3">
                    <input
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="Enter Promocode"
                        className="flex-1 min-w-0 rounded-xl border border-stone-200 px-3 sm:px-4 py-3 text-sm font-medium outline-none transition focus:border-[#00b050] shadow-sm"
                    />
                    <button
                        type="button"
                        onClick={handleApply}
                        disabled={loading}
                        className="shrink-0 rounded-xl bg-[#00b050] px-5 sm:px-8 py-3 text-sm font-bold text-white hover:bg-green-700 transition-colors disabled:opacity-50 shadow-sm"
                    >
                        {loading ? "..." : "Apply"}
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-between rounded-xl border border-[#00b050]/30 bg-green-50/50 px-5 py-4 shadow-sm">
                    <div>
                        <div className="font-extrabold text-[#00b050] flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                            {code} applied
                        </div>
                        <div className="text-xs font-bold text-stone-600 mt-1">
                            You saved <span className="text-[#00b050]">₹{discountAmount.toLocaleString("en-IN")}</span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="text-xs font-bold text-red-500 hover:text-red-600 underline"
                    >
                        Remove
                    </button>
                </div>
            )}

            {error && <p className="mt-3 text-xs font-semibold text-red-500">{error}</p>}
        </div>
    );
}
