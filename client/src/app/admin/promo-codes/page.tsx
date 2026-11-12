"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Edit2,
    Trash2,
    Loader2,
    Users,
    TrendingUp,
    IndianRupee,
    Phone,
    X,
    Tag,
    ShoppingBag,
} from "lucide-react";
import type { PromoCode, PromoCodeUsageRecord, PromoCodeUsageResponse } from "@/types/promoCode";
import { getPromoCodes, togglePromoCode, deletePromoCode, getPromoCodeUsageDetails } from "@/lib/promoCodes";

export default function PromoCodesPage() {
    const [promos, setPromos] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState("");

    // Modal state for promo code devotee usage
    const [selectedPromo, setSelectedPromo] = useState<PromoCode | null>(null);
    const [usageModalOpen, setUsageModalOpen] = useState(false);
    const [usageLoading, setUsageLoading] = useState(false);
    const [usageData, setUsageData] = useState<PromoCodeUsageResponse | null>(null);
    const [usageError, setUsageError] = useState("");

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

    const handleDelete = async (promo: PromoCode) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete promo code "${promo.code}"?`);
        if (!confirmDelete) return;

        try {
            setDeletingId(promo._id);
            await deletePromoCode(promo._id);
            setPromos((prev) => prev.filter((p) => p._id !== promo._id));
        } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to delete promo code");
        } finally {
            setDeletingId(null);
        }
    };

    const handleOpenUsageModal = async (promo: PromoCode) => {
        setSelectedPromo(promo);
        setUsageModalOpen(true);
        setUsageLoading(true);
        setUsageError("");
        try {
            const data = await getPromoCodeUsageDetails(promo._id);
            setUsageData(data);
        } catch (err) {
            setUsageError(err instanceof Error ? err.message : "Failed to load usage details");
        } finally {
            setUsageLoading(false);
        }
    };

    const handleCloseUsageModal = () => {
        setUsageModalOpen(false);
        setSelectedPromo(null);
        setUsageData(null);
        setUsageError("");
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
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex items-center gap-3 text-gray-500 font-semibold text-sm">
                    <Loader2 className="w-5 h-5 animate-spin text-[#6b62ff]" />
                    Loading promo codes & revenue details...
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#2d2a6e]">Promo Codes</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage discounts, view generated amounts, and track customer usage
                    </p>
                </div>
                <Link
                    href="/admin/promo-codes/create"
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#6b62ff] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#5a52db] transition-colors shadow-sm"
                >
                    + Add New
                </Link>
            </div>

            {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-600 border border-red-100">
                    {error}
                </div>
            )}

            <div className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] border border-gray-100">
                <table className="w-full table-auto">
                    <thead className="border-b border-gray-100 bg-gray-50/70">
                        <tr>
                            <th className="px-4 py-3.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                Promo Code
                            </th>
                            <th className="px-3 py-3.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                Discount
                            </th>
                            <th className="px-3 py-3.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                Validity
                            </th>
                            <th className="px-3 py-3.5 text-center text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                Orders
                            </th>
                            <th className="px-3 py-3.5 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                Revenue
                            </th>
                            <th className="px-3 py-3.5 text-center text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                Usage
                            </th>
                            <th className="px-3 py-3.5 text-center text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-4 py-3.5 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {promos.map((promo) => {
                            const statusText = getStatus(promo);
                            const isActiveStyle = promo.isActive
                                ? "bg-[#eaf7f1] text-[#0d9263]"
                                : "bg-red-50 text-red-600";
                            const ordersCount = promo.ordersCount ?? promo.usedCount ?? 0;
                            const revenue = promo.totalRevenue ?? 0;

                            return (
                                <tr key={promo._id} className="hover:bg-gray-50/60 transition-colors">
                                    <td className="px-4 py-3.5">
                                        <div className="font-extrabold text-[#2d2a6e] flex items-center gap-1.5 text-sm">
                                            <Tag className="w-3.5 h-3.5 text-[#6b62ff] shrink-0" />
                                            <span>{promo.code}</span>
                                        </div>
                                        {promo.description && (
                                            <div className="text-[11px] text-gray-400 mt-0.5 max-w-[140px] truncate">
                                                {promo.description}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-3 py-3.5 whitespace-nowrap">
                                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
                                            {promo.discountType === "PERCENTAGE"
                                                ? `${promo.discountValue}% OFF`
                                                : `₹${promo.discountValue} OFF`}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3.5 text-[11px] font-medium text-gray-600 whitespace-nowrap">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="flex items-center gap-1 text-gray-700">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>
                                                {new Date(promo.startDate).toLocaleDateString("en-IN", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </span>
                                            <span className="flex items-center gap-1 text-gray-500">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
                                                {new Date(promo.endDate).toLocaleDateString("en-IN", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </span>
                                        </div>
                                    </td>
                                    {/* Orders Count & Quick Modal Button */}
                                    <td className="px-3 py-3.5 text-center whitespace-nowrap">
                                        <button
                                            type="button"
                                            onClick={() => handleOpenUsageModal(promo)}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors text-xs font-bold"
                                            title="Click to view devotees & order details"
                                        >
                                            <Users className="w-3 h-3 shrink-0" />
                                            <span>{ordersCount}</span>
                                        </button>
                                    </td>
                                    {/* Total Generated Revenue */}
                                    <td className="px-3 py-3.5 text-right whitespace-nowrap">
                                        <div className="font-extrabold text-xs text-[#111827]">
                                            ₹{revenue.toLocaleString("en-IN")}
                                        </div>
                                        {(promo.totalDiscount ?? 0) > 0 && (
                                            <div className="text-[10px] font-medium text-emerald-600">
                                                -₹{(promo.totalDiscount ?? 0).toLocaleString("en-IN")}
                                            </div>
                                        )}
                                    </td>
                                    {/* Usage count */}
                                    <td className="px-3 py-3.5 text-center text-xs font-medium text-gray-600 whitespace-nowrap">
                                        <span className="font-bold text-gray-800">{promo.usedCount}</span>
                                        <span className="text-gray-400 mx-0.5">/</span>
                                        <span className="text-gray-500">{promo.usageLimit ?? "∞"}</span>
                                    </td>
                                    <td className="px-3 py-3.5 text-center whitespace-nowrap">
                                        <span
                                            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${isActiveStyle}`}
                                        >
                                            {statusText}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenUsageModal(promo)}
                                                title="View Devotees"
                                                className="flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 px-2 py-1 text-[11px] font-bold text-purple-700 hover:bg-purple-100 transition-colors"
                                            >
                                                <Users className="w-3.5 h-3.5" />
                                                <span>Users</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleToggle(promo)}
                                                className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                                            >
                                                {promo.isActive ? "Active" : "Inactive"}
                                            </button>
                                            <Link
                                                href={`/admin/promo-codes/${promo._id}/edit`}
                                                title="Edit"
                                                className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-1 text-gray-600 hover:bg-gray-50 transition-colors"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" strokeWidth={2} />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(promo)}
                                                disabled={deletingId === promo._id}
                                                title="Delete"
                                                className="flex items-center justify-center rounded-lg border border-red-200 bg-white p-1 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                                            >
                                                {deletingId === promo._id ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                                                ) : (
                                                    <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {promos.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        No promo codes found. Click &quot; Add New &quot; to create one.
                    </div>
                )}
            </div>

            {/* USERS & GENERATED AMOUNT DETAILS MODAL */}
            {usageModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6 backdrop-blur-sm animate-fadeIn">
                    <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 bg-[#f8fafc] px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6b62ff]/10 text-[#6b62ff]">
                                    <Tag className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-extrabold text-[#2d2a6e]">
                                            Promo Code: {selectedPromo?.code}
                                        </h2>
                                        <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
                                            {selectedPromo?.discountType === "PERCENTAGE"
                                                ? `${selectedPromo?.discountValue}% OFF`
                                                : `₹${selectedPromo?.discountValue} OFF`}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Devotees & Orders who used this promo code
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseUsageModal}
                                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Summary Metric Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-5 sm:p-6 bg-[#fbfbfe] border-b border-gray-100">
                            <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                                    <ShoppingBag className="w-4 h-4 text-purple-600" />
                                    Total Orders Made
                                </div>
                                <div className="mt-1.5 text-2xl font-black text-[#2d2a6e]">
                                    {usageData?.promo?.totalOrders ?? (selectedPromo?.ordersCount || 0)}
                                </div>
                                <p className="text-[11px] text-gray-400 mt-0.5">Orders with this discount</p>
                            </div>

                            <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                                    Generated Amount
                                </div>
                                <div className="mt-1.5 text-2xl font-black text-emerald-600">
                                    ₹{(usageData?.promo?.totalRevenue ?? (selectedPromo?.totalRevenue || 0)).toLocaleString("en-IN")}
                                </div>
                                <p className="text-[11px] text-gray-400 mt-0.5">Total collected revenue</p>
                            </div>

                            <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                                    <IndianRupee className="w-4 h-4 text-blue-600" />
                                    Total Discount Given
                                </div>
                                <div className="mt-1.5 text-2xl font-black text-blue-600">
                                    ₹{(usageData?.promo?.totalDiscountGiven ?? (selectedPromo?.totalDiscount || 0)).toLocaleString("en-IN")}
                                </div>
                                <p className="text-[11px] text-gray-400 mt-0.5">Savings passed to devotees</p>
                            </div>
                        </div>

                        {/* Modal Body / Devotee List */}
                        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
                            {usageLoading ? (
                                <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
                                    <Loader2 className="w-7 h-7 animate-spin text-[#6b62ff]" />
                                    <p className="text-sm font-semibold">Fetching devotees & order details...</p>
                                </div>
                            ) : usageError ? (
                                <div className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600 border border-red-100">
                                    {usageError}
                                </div>
                            ) : !usageData || usageData.data.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-3">
                                        <Users className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-base font-bold text-gray-700">No Orders Yet</h3>
                                    <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
                                        No customer has made an order using promo code{" "}
                                        <span className="font-bold text-[#2d2a6e]">{selectedPromo?.code}</span> yet.
                                    </p>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-gray-200 overflow-hidden">
                                    <table className="w-full text-left table-auto">
                                        <thead className="bg-gray-50/90 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                            <tr>
                                                <th className="px-3 py-2.5 text-center">#</th>
                                                <th className="px-3 py-2.5">Devotee Name</th>
                                                <th className="px-3 py-2.5">Mobile Number</th>
                                                <th className="px-3 py-2.5">Order Number</th>
                                                <th className="px-3 py-2.5">Pooja / Service</th>
                                                <th className="px-3 py-2.5 text-right">Discount</th>
                                                <th className="px-3 py-2.5 text-right">Order Amount</th>
                                                <th className="px-3 py-2.5 text-right">Date & Time</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-[11px]">
                                            {usageData.data.map((record: PromoCodeUsageRecord, idx: number) => {
                                                const rawPhone =
                                                    record.order?.mobileNumber ||
                                                    record.user?.mobileNumber ||
                                                    "-";
                                                const cleanPhone = rawPhone.replace(/\D/g, "");
                                                const whatsappUrl =
                                                    cleanPhone.length >= 10
                                                        ? `https://wa.me/${cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`}`
                                                        : null;

                                                return (
                                                    <tr key={record._id || idx} className="hover:bg-gray-50/70 transition-colors">
                                                        <td className="px-3 py-2.5 text-center font-bold text-gray-400">
                                                            {idx + 1}
                                                        </td>
                                                        <td className="px-3 py-2.5">
                                                            <div className="font-bold text-gray-900 leading-tight">
                                                                {record.order?.customerName ||
                                                                    record.user?.name ||
                                                                    "Devotee"}
                                                            </div>
                                                            {record.user?.email && record.user.email !== "-" && (
                                                                <div className="text-[10px] text-gray-400 truncate max-w-[130px]">
                                                                    {record.user.email}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2.5 whitespace-nowrap">
                                                            <div className="flex items-center gap-1.5">
                                                                <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                                                                <span className="font-semibold text-gray-700">
                                                                    {rawPhone}
                                                                </span>
                                                                {whatsappUrl && (
                                                                    <a
                                                                        href={whatsappUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-[9px] font-extrabold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200"
                                                                        title="Chat on WhatsApp"
                                                                    >
                                                                        WA
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2.5 font-mono font-bold text-[#6b62ff] whitespace-nowrap">
                                                            {record.order?.orderNumber || "-"}
                                                        </td>
                                                        <td className="px-3 py-2.5 text-gray-600 max-w-[140px] truncate" title={record.order?.itemName || "Puja Service"}>
                                                            {record.order?.itemName || "Puja Service"}
                                                        </td>
                                                        <td className="px-3 py-2.5 text-right font-bold text-emerald-600 whitespace-nowrap">
                                                            -₹{Number(record.discountAmount || 0).toLocaleString("en-IN")}
                                                        </td>
                                                        <td className="px-3 py-2.5 text-right font-black text-[#2d2a6e] whitespace-nowrap">
                                                            ₹{Number(record.order?.totalAmount || 0).toLocaleString("en-IN")}
                                                        </td>
                                                        <td className="px-3 py-2.5 text-right text-gray-500 whitespace-nowrap">
                                                            {record.createdAt ? (
                                                                <div className="flex flex-col items-end">
                                                                    <span className="font-semibold text-gray-700">
                                                                        {new Date(record.createdAt).toLocaleDateString("en-IN", {
                                                                            day: "numeric",
                                                                            month: "short",
                                                                            year: "numeric",
                                                                        })}
                                                                    </span>
                                                                    <span className="text-[10px] text-gray-400">
                                                                        {new Date(record.createdAt).toLocaleTimeString("en-IN", {
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                            hour12: true,
                                                                        })}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                "-"
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-3 text-xs text-gray-500">
                            <div>
                                Total records:{" "}
                                <span className="font-bold text-gray-800">
                                    {usageData?.count ?? 0}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseUsageModal}
                                className="rounded-xl bg-[#2d2a6e] px-5 py-2 font-bold text-white hover:bg-[#201d54] transition-colors shadow-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
