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
        <div className="w-full mt-6">
            <div className="mb-2 font-semibold text-[#f16335]">
                Have a Promocode?
            </div>

            {!applied ? (
                <div className="flex gap-2">
                    <input
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="Enter Promocode"
                        className="flex-1 rounded-md border border-gray-200 px-4 py-2.5 focus:outline-none focus:border-[#f16335]"
                    />
                    <button
                        type="button"
                        onClick={handleApply}
                        disabled={loading}
                        className="rounded-md bg-[#00a850] px-8 py-2.5 font-bold text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? "..." : "Apply"}
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-between rounded-md border border-green-200 bg-green-50 px-4 py-3">
                    <div>
                        <div className="font-semibold text-green-700">
                            ✓ {code} applied
                        </div>
                        <div className="text-sm text-green-600">
                            You saved ₹{discountAmount.toLocaleString("en-IN")}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="text-sm font-semibold text-red-600 hover:text-red-700 underline"
                    >
                        Remove
                    </button>
                </div>
            )}

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
    );
}
