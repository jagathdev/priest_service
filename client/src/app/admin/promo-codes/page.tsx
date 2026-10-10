"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PromoCode } from "@/types/promoCode";
import { getPromoCodes, togglePromoCode } from "@/lib/promoCodes";

export default function PromoCodesPage() {
    const [promos, setPromos] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadPromos = async () => {
        try {
            setLoading(true);
            const data = await getPromoCodes();
            setPromos(data);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to load promo codes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPromos();
    }, []);

    const handleToggle = async (promo: PromoCode) => {
        try {
            await togglePromoCode(promo._id, !promo.isActive);
            await loadPromos();
        } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to update status");
        }
    };

    const getStatus = (promo: PromoCode) => {
        const now = new Date();
        if (!promo.isActive) return "Inactive";
        if (now < new Date(promo.startDate)) return "Scheduled";
        if (now > new Date(promo.endDate)) return "Expired";
        if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) return "Limit Reached";
        return "Active";
    };

    if (loading) {
        return <div className="p-6">Loading promo codes...</div>;
    }

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#2d2a6e]">Promo Codes</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage discounts and promotional offers</p>
                </div>
                <Link
                    href="/admin/promo-codes/create"
                    className="flex items-center gap-2 rounded-lg bg-[#6b62ff] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#5a52db] transition-colors shadow-sm"
                >
                    + Add New
                </Link>
            </div>

            {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-600 border border-red-100">
                    {error}
                </div>
            )}

            <div className="overflow-hidden rounded-xl bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-gray-100">
                <table className="w-full">
                    <thead className="border-b border-gray-100 bg-gray-50/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Promo Info</th>
                            <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Discount</th>
                            <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Validity</th>
                            <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Usage</th>
                            <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {promos.map((promo) => {
                            const statusText = getStatus(promo);
                            const isActiveStyle = promo.isActive ? "bg-[#eaf7f1] text-success" : "bg-red-50 text-red-600";
                            return (
                                <tr key={promo._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-800">{promo.code}</div>
                                        <div className="text-xs text-gray-500 mt-1 max-w-[200px] truncate">{promo.description}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
                                            {promo.discountType === "PERCENTAGE"
                                                ? `${promo.discountValue}% OFF`
                                                : `₹${promo.discountValue} OFF`}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium text-gray-600">
                                        <div className="flex flex-col gap-1">
                                            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> {new Date(promo.startDate).toLocaleDateString("en-IN", { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> {new Date(promo.endDate).toLocaleDateString("en-IN", { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium text-gray-600">
                                        {promo.usedCount} <span className="text-gray-400">/</span> {promo.usageLimit ?? "∞"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${isActiveStyle}`}>
                                            {statusText}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleToggle(promo)}
                                                className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                                            >
                                                {promo.isActive ? "Mark Inactive" : "Mark Active"}
                                            </button>
                                            <Link
                                                href={`/admin/promo-codes/${promo._id}/edit`}
                                                className="flex items-center justify-center rounded-md border border-gray-200 bg-white p-1.5 text-gray-600 hover:bg-gray-50 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {promos.length === 0 && (
                    <div className="p-10 text-center text-gray-500">
                        No promo codes found.
                    </div>
                )}
            </div>
        </div>
    );
}
