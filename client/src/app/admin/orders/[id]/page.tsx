"use client";

import React, { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  CheckCircleIcon,
  UserIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  GiftIcon,
  ClockIcon,
  ArrowPathIcon,
  PrinterIcon,
  ShareIcon,
  CheckIcon,
  ShieldCheckIcon,
  VideoCameraIcon,
  XMarkIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; dot: string; border: string }
> = {
  created: {
    label: "Created",
    bg: "bg-slate-50",
    text: "text-slate-700",
    dot: "bg-slate-400",
    border: "border-slate-200",
  },
  confirmed: {
    label: "Confirmed",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    border: "border-emerald-200",
  },
  scheduled: {
    label: "Puja Scheduled",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    border: "border-amber-200",
  },
  performed: {
    label: "Performed",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    dot: "bg-indigo-500",
    border: "border-indigo-200",
  },
  completed: {
    label: "Completed",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    border: "border-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
    border: "border-rose-200",
  },
  refunded: {
    label: "Refunded",
    bg: "bg-purple-50",
    text: "text-purple-700",
    dot: "bg-purple-500",
    border: "border-purple-200",
  },
};

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status updating state
  const [selectedStatus, setSelectedStatus] = useState<string>("created");
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [videoLink, setVideoLink] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const getAdminToken = () => {
    try {
      const match = document.cookie.match(/(?:^|;\s*)adminToken=([^;]*)/);
      if (match) return match[1];
      return localStorage.getItem("adminToken") || "";
    } catch {
      return "";
    }
  };

  const fetchOrderDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
      const token = getAdminToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${baseUrl}/api/admin/orders/${orderId}`, {
        headers,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to load order details");
      }

      const resData = await res.json();
      if (resData.success && resData.data) {
        const ord = resData.data;
        setOrder(ord);
        setSelectedStatus(ord.orderStatus || "created");
        if (ord.scheduledDate) {
          setScheduledDate(new Date(ord.scheduledDate).toISOString().split("T")[0]);
        }
        setVideoLink(ord.videoLink || "");
      }
    } catch (err: any) {
      setError(err.message || "Could not retrieve order details");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleUpdateOrder = async () => {
    setIsUpdating(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
      const token = getAdminToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${baseUrl}/api/admin/orders/${order._id}`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify({
          orderStatus: selectedStatus,
          scheduledDate: scheduledDate || null,
          videoLink: videoLink.trim(),
        }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.message || "Failed to update order");
      }

      showToast("Order status & video link updated successfully!", "success");
      setOrder(resData.data);
    } catch (err: any) {
      showToast(err.message || "Failed to update order", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Not Scheduled";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Not Scheduled";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-6 md:p-12 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-bold text-gray-500">Loading order details...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-6 md:p-12 max-w-xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <ClockIcon className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Order Not Found</h2>
        <p className="text-xs text-gray-500">{error || "The requested order details could not be found."}</p>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-emerald-700 transition"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Orders
        </Link>
      </div>
    );
  }

  const currentStatusObj = STATUS_CONFIG[selectedStatus.toLowerCase()] || STATUS_CONFIG.created;
  const serviceName = order.serviceName || order.itemName || "Navagraha Shanti Puja";
  const devoteeName = order.devoteeName || order.customerName || "Devotee";
  const basePrice = order.pricing?.basePrice || order.originalAmount || 0;
  const extraParticipantAmount = order.pricing?.extraParticipantAmount || 0;
  const extraParticipantCount = order.pricing?.extraParticipantCount || 0;
  const totalAmount = order.pricing?.total || 0;
  const isPaid = order.paymentStatus === "paid" || order.paymentStatus === "captured" || order.paymentStatus === "successful";
  const isScheduledState = Boolean(
    selectedStatus === "scheduled" ||
    selectedStatus === "performed" ||
    selectedStatus === "completed" ||
    scheduledDate ||
    order.scheduledDate
  );
  const displayScheduledDate = scheduledDate || order.scheduledDate;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1550px] mx-auto min-h-screen">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-bold transition-all ${toastMsg.type === "success"
            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
            : "bg-red-50 text-red-800 border-red-200"
            }`}
        >
          <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg.message}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 shadow-2xs mb-2 transition"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Order Details</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            View complete order information and share with the service team.
          </p>
        </div>

        {/* Action Buttons: Share & Print */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `Order ${order.orderNumber}`,
                  text: `Order details for ${devoteeName} - ${serviceName}`,
                  url: window.location.href,
                }).catch(() => { });
              } else {
                navigator.clipboard.writeText(window.location.href);
                showToast("Order link copied to clipboard!");
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#14395C] text-white hover:bg-[#0e2740] text-xs font-bold shadow-sm transition active:scale-95"
          >
            <ShareIcon className="w-4 h-4" />
            Share with Service Team
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 shadow-2xs transition active:scale-95"
            title="Print order"
          >
            <PrinterIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5-Column Metric Header Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* Card 1: Order ID */}
        <div className="bg-white rounded-2xl border border-gray-150 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold">#</span>
            <span className="text-[11px] font-semibold text-gray-500">Order ID</span>
          </div>
          <span className="font-mono font-bold text-gray-900 text-xs sm:text-sm block truncate mb-1.5">
            {order.orderNumber}
          </span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${currentStatusObj.bg} ${currentStatusObj.text} border ${currentStatusObj.border}`}
          >
            {currentStatusObj.label}
          </span>
        </div>

        {/* Card 2: Order Date */}
        <div className="bg-white rounded-2xl border border-gray-150 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <CalendarDaysIcon className="w-4 h-4 text-blue-500" />
            <span className="text-[11px] font-semibold text-gray-500">Order Date</span>
          </div>
          <span className="font-bold text-gray-900 text-xs sm:text-sm block">
            {formatDate(order.createdAt)}
          </span>
          <span className="text-[10px] text-gray-400 font-medium block mt-0.5">
            {formatTime(order.createdAt)}
          </span>
        </div>

        {/* Card 3: Payment Status */}
        <div className="bg-white rounded-2xl border border-gray-150 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <CreditCardIcon className="w-4 h-4 text-emerald-500" />
            <span className="text-[11px] font-semibold text-gray-500">Payment Status</span>
          </div>
          <span className="font-bold text-emerald-700 text-xs sm:text-sm block capitalize">
            {isPaid ? "Paid" : (order.paymentStatus || "Pending")}
          </span>
          <span className="text-[11px] font-extrabold text-gray-800 block mt-0.5">
            ₹ {totalAmount.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Card 4: Booking Type */}
        <div className="bg-white rounded-2xl border border-gray-150 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <SparklesIcon className="w-4 h-4 text-purple-500" />
            <span className="text-[11px] font-semibold text-gray-500">Booking Type</span>
          </div>
          <span className="font-bold text-gray-900 text-xs sm:text-sm block">
            {order.serviceType || "Puja"}
          </span>
          <span className="text-[10px] text-gray-500 font-medium block mt-0.5">
            ({order.packageId || "Individual"})
          </span>
        </div>

        {/* Card 5: Total Amount */}
        <div className="bg-white rounded-2xl border border-gray-150 p-4 shadow-xs col-span-2 md:col-span-1">
          <span className="text-[11px] font-semibold text-gray-500 block mb-2">Total Amount</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight block">
            ₹ {totalAmount.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Row 2: 3 Cards (User Info, Order Summary, Important Details) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* User Information */}
        <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-gray-100 text-gray-900 font-bold text-xs sm:text-sm">
            <UserIcon className="w-4 h-4 text-blue-600" />
            <span>User Information</span>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Name</span>
              <span className="font-bold text-gray-900">{devoteeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="font-medium text-gray-900">{order.customer?.email || "devotee@astroved.com"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Mobile Number</span>
              <span className="font-bold text-gray-900">
                {order.mobileNumber?.startsWith("+") ? order.mobileNumber : `+91 ${order.mobileNumber || "9876543210"}`}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">User ID</span>
              <span className="font-mono text-gray-800 text-[11px] font-bold">
                {order.customer?._id || order.customer || "USR001245"}
              </span>
            </div>
            {/* User Address */}
            <div className="pt-2 border-t border-gray-100">
              <span className="text-gray-500 block mb-1">User Address</span>
              {(() => {
                const addrs = order.customer?.addresses;
                const defAddr = Array.isArray(addrs) && addrs.length > 0 ? (addrs.find((a: any) => a.isDefault) || addrs[0]) : null;
                if (!defAddr) {
                  return <span className="text-gray-400 italic">No saved address</span>;
                }
                const parts = [
                  defAddr.addressLine1,
                  defAddr.addressLine2,
                  defAddr.city,
                  defAddr.state,
                  defAddr.pincode,
                  defAddr.country
                ].filter(Boolean);
                return (
                  <span className="text-gray-800 font-medium leading-relaxed block text-[11px]">
                    {parts.join(", ")}
                  </span>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-gray-100 text-gray-900 font-bold text-xs sm:text-sm">
            <SparklesIcon className="w-4 h-4 text-purple-600" />
            <span>Order Summary</span>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-start gap-2">
              <span className="text-gray-500 shrink-0">Puja Name</span>
              <span className="font-bold text-gray-900 text-right truncate max-w-[200px]">{serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Temple / Venue</span>
              <span className="font-medium text-gray-800">{order.templeLocation || "Tamil Nadu"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Puja Date</span>
              <span className="font-bold text-emerald-700">
                {order.scheduledDate ? formatDate(order.scheduledDate) : "To Be Scheduled"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Participants</span>
              <span className="font-bold text-gray-900">
                {order.participants?.length || 1} (Additional: {extraParticipantCount})
              </span>
            </div>
          </div>
        </div>

        {/* Important Details */}
        <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-gray-100 text-gray-900 font-bold text-xs sm:text-sm">
            <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
            <span>Important Details</span>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Gotra (All Participants)</span>
              <span className="font-bold text-gray-900">
                {order.doesNotKnowGotra ? "Does not know Gotra" : (order.gotra || "Not Provided")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Special Request</span>
              <span className="text-gray-700 italic truncate max-w-[180px]">{order.wish || "–"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Booking Source</span>
              <span className="font-bold text-gray-800">Website</span>
            </div>
            <div className="flex justify-between items-start gap-2">
              <span className="text-gray-500 shrink-0">Order Notes</span>
              <span className="text-[11px] text-gray-600 text-right">
                Please perform on the specified date and send prasad details.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Participants Details Table */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-xs overflow-hidden">
        <div className="p-4 sm:px-6 sm:py-3.5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs sm:text-sm font-bold text-gray-900">Participants Details</h3>
          </div>
          <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
            {order.participants?.length || 1} Participant{(order.participants?.length || 1) > 1 ? "s" : ""}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/70 border-b border-gray-150 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 pl-6 pr-3 w-12">#</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Gotra</th>
                <th className="py-3 px-4">Do Not Know Gotra</th>
                <th className="py-3 px-4">Gender</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {order.participants && order.participants.length > 0 ? (
                order.participants.map((p: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50/60 transition">
                    <td className="py-3.5 pl-6 pr-3 font-bold text-gray-400">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">{p.name}</td>
                    <td className="py-3.5 px-4 font-semibold text-gray-800">
                      {p.doesNotKnowGotra ? "–" : (p.gotra || order.gotra || "Not specified")}
                    </td>
                    <td className="py-3.5 px-4">
                      {p.doesNotKnowGotra ? (
                        <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md">Yes</span>
                      ) : (
                        <span className="text-gray-500">No</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">Male</td>
                  </tr>
                ))
              ) : (
                <tr className="hover:bg-gray-50/60 transition">
                  <td className="py-3.5 pl-6 pr-3 font-bold text-gray-400">1</td>
                  <td className="py-3.5 px-4 font-bold text-gray-900">{devoteeName}</td>
                  <td className="py-3.5 px-4 font-semibold text-gray-800">{order.gotra || "–"}</td>
                  <td className="py-3.5 px-4">{order.doesNotKnowGotra ? "Yes" : "No"}</td>
                  <td className="py-3.5 px-4 text-gray-600">Male</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 4: Order Items & Charges + Order Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Order Items & Charges Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-150 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 sm:px-6 sm:py-3.5 border-b border-gray-100 flex items-center gap-2">
              <CreditCardIcon className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs sm:text-sm font-bold text-gray-900">Order Items &amp; Charges</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/70 border-b border-gray-150 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 pl-6 pr-4">Item</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Price</th>
                    <th className="py-3 pr-6 pl-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {/* Base Puja Item */}
                  <tr className="hover:bg-gray-50/50">
                    <td className="py-3.5 pl-6 pr-4 font-bold text-gray-900">{serviceName}</td>
                    <td className="py-3.5 px-4 text-center">1</td>
                    <td className="py-3.5 px-4 text-right">₹ {basePrice.toLocaleString("en-IN")}</td>
                    <td className="py-3.5 pr-6 pl-4 text-right font-bold text-gray-900">
                      ₹ {basePrice.toLocaleString("en-IN")}
                    </td>
                  </tr>

                  {/* Extra Participants Fee */}
                  {extraParticipantAmount > 0 && (
                    <tr className="hover:bg-gray-50/50">
                      <td className="py-3.5 pl-6 pr-4 text-gray-800">
                        Extra Participants Fee ({extraParticipantCount})
                      </td>
                      <td className="py-3.5 px-4 text-center">{extraParticipantCount}</td>
                      <td className="py-3.5 px-4 text-right">₹ 300</td>
                      <td className="py-3.5 pr-6 pl-4 text-right font-bold text-gray-900">
                        ₹ {extraParticipantAmount.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  )}

                  {/* Offerings */}
                  {order.offerings && order.offerings.map((off: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="py-3.5 pl-6 pr-4 text-gray-800">{off.name}</td>
                      <td className="py-3.5 px-4 text-center">1</td>
                      <td className="py-3.5 px-4 text-right">₹ {(off.priceINR || 0).toLocaleString("en-IN")}</td>
                      <td className="py-3.5 pr-6 pl-4 text-right font-bold text-gray-900">
                        ₹ {(off.priceINR || 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}

                  {/* Free Pandit & Recording Fee standard lines */}
                  <tr className="hover:bg-gray-50/50 text-gray-500">
                    <td className="py-3 pl-6 pr-4">Pooja / Homa Video Recording Fee</td>
                    <td className="py-3 px-4 text-center">1</td>
                    <td className="py-3 px-4 text-right">₹ 500</td>
                    <td className="py-3 pr-6 pl-4 text-right font-semibold text-emerald-600">Free</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 text-gray-500">
                    <td className="py-3 pl-6 pr-4">Pandit &amp; Convenience Fee</td>
                    <td className="py-3 px-4 text-center">1</td>
                    <td className="py-3 px-4 text-right">₹ 175</td>
                    <td className="py-3 pr-6 pl-4 text-right font-semibold text-emerald-600">Free</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 sm:px-6 bg-gray-50/70 border-t border-gray-150 flex items-center justify-between text-sm font-extrabold text-gray-900">
            <span>Total Amount</span>
            <span className="text-emerald-700 text-base">₹ {totalAmount.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Order Timeline (1 Col) - 5 Distinct Step Progression or Cancellation & Refund Status */}
        <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs flex flex-col justify-between">
          <div>
            {(() => {
              const normStatus = (selectedStatus || order.orderStatus || "").toLowerCase();
              const isCancelled = normStatus === "cancelled" || normStatus === "refunded" || normStatus === "refund";
              const isRefunded = normStatus === "refunded" || order.paymentStatus === "refunded" || (order as any).refundStatus === "refunded" || (order as any).refundStatus === "completed";
              const isConfirmed = normStatus !== "created" && !isCancelled;
              const isScheduled = normStatus === "scheduled" || normStatus === "performed" || normStatus === "completed" || Boolean(displayScheduledDate);
              const isPerformed = normStatus === "performed" || normStatus === "completed";
              const isVideoDelivered = normStatus === "completed" || Boolean(videoLink || order.videoLink);
              const refundAmount = (order as any).refundAmount || (order as any).refundedAmount || order.totalAmount || order.amount;

              if (isCancelled) {
                return (
                  <div>
                    {/* Header */}
                    <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
                      <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                        <XMarkIcon className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span className="text-gray-900 font-bold text-xs sm:text-sm">Cancellation &amp; Refund Status</span>
                    </div>

                    {/* Cancellation & Refund Timeline */}
                    <div className="space-y-4 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-4 before:w-0.5 before:bg-red-400">
                      {/* Step 1: Booking Confirmed */}
                      <div className="relative">
                        <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-[#1c2c5c] text-white flex items-center justify-center shadow-xs">
                          <CheckIcon className="w-3 h-3 stroke-[3]" />
                        </div>
                        <div className="p-3 border border-gray-150 rounded-xl bg-gray-50/70">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Step 1</span>
                          <h4 className="text-xs font-bold text-gray-900">Booking Confirmed</h4>
                          <p className="text-[10px] text-gray-500 mt-0.5">{formatDate(order.createdAt)} • Payment received</p>
                        </div>
                      </div>

                      {/* Step 2: Booking Cancelled */}
                      <div className="relative">
                        <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xs">
                          <XMarkIcon className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <div className="p-3 border border-red-200 rounded-xl bg-red-50/50">
                          <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">Step 2</span>
                          <h4 className="text-xs font-bold text-red-900">Booking Cancelled</h4>
                          <p className="text-[10px] text-red-600 mt-0.5">{(order as any).cancellationReason || "Booking cancelled upon request"}</p>
                        </div>
                      </div>

                      {/* Step 3: Refund Status */}
                      <div className="relative">
                        <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full text-white flex items-center justify-center shadow-xs ${isRefunded ? "bg-emerald-600" : "bg-amber-500"}`}>
                          {isRefunded ? (
                            <CheckIcon className="w-3 h-3 stroke-[3]" />
                          ) : (
                            <ArrowPathIcon className="w-3 h-3 stroke-[2.5] animate-spin" />
                          )}
                        </div>
                        <div className={`p-3 border rounded-xl ${isRefunded ? "border-emerald-200 bg-emerald-50/60" : "border-amber-200 bg-amber-50/50"}`}>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Step 3</span>
                          <h4 className={`text-xs font-bold flex items-center gap-1.5 ${isRefunded ? "text-emerald-900" : "text-amber-900"}`}>
                            <span>{isRefunded ? "Refund Successful" : "Refund in Progress"}</span>
                            {isRefunded && refundAmount && (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                                ₹{refundAmount.toLocaleString("en-IN")}
                              </span>
                            )}
                          </h4>
                          <p className={`text-[10px] mt-0.5 ${isRefunded ? "text-emerald-700" : "text-amber-700"}`}>
                            {isRefunded
                              ? "Refund has been processed and successfully credited to your account."
                              : "Refund is initiated and will be credited to your original payment method in 3–5 business days."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div>
                  <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100 text-gray-900 font-bold text-xs sm:text-sm">
                    <ClockIcon className="w-4 h-4 text-blue-600" />
                    <span>Order Timeline</span>
                  </div>

                  <div className="space-y-4 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                    {/* Step 1: Booking Confirmed */}
                    <div className="relative">
                      <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#1c2c5c] text-white flex items-center justify-center shadow-xs">
                        <CheckIcon className="w-3 h-3 stroke-[3]" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Step 1</span>
                        <h4 className="text-xs font-bold text-gray-900">Booking Confirmed</h4>
                        <p className="text-[10px] text-gray-500">{formatDate(order.createdAt)} • Payment received</p>
                      </div>
                    </div>

                    {/* Step 2: Sankalpam Details Submitted */}
                    <div className="relative">
                      <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white shadow-xs ${isConfirmed ? "bg-[#1c2c5c]" : "bg-gray-200 text-gray-400"
                        }`}>
                        {isConfirmed ? (
                          <CheckIcon className="w-3 h-3 stroke-[3]" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Step 2</span>
                        <h4 className={`text-xs font-bold ${isConfirmed ? "text-gray-900" : "text-gray-400"}`}>
                          Sankalpam Details Submitted
                        </h4>
                        <p className="text-[10px] text-gray-500">Devotee names &amp; gotra noted</p>
                      </div>
                    </div>

                    {/* Step 3: Puja Scheduled */}
                    <div className="relative">
                      <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white shadow-xs ${isScheduled ? "bg-amber-500" : "bg-gray-200 text-gray-400"
                        }`}>
                        {isScheduled ? (
                          <CheckIcon className="w-3 h-3 stroke-[3]" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Step 3</span>
                        <h4 className={`text-xs font-bold ${isScheduled ? "text-gray-900" : "text-gray-400"}`}>
                          Puja Scheduled
                        </h4>
                        <p className={`text-[10px] font-medium ${isScheduled ? "text-amber-700 font-bold" : "text-gray-400"}`}>
                          {displayScheduledDate ? `Muhurat: ${formatDate(displayScheduledDate)}` : "Date to be scheduled"}
                        </p>
                      </div>
                    </div>

                    {/* Step 4: Puja Performed */}
                    <div className="relative">
                      <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white shadow-xs ${isPerformed ? "bg-indigo-600" : "bg-gray-200 text-gray-400"
                        }`}>
                        {isPerformed ? (
                          <CheckIcon className="w-3 h-3 stroke-[3]" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Step 4</span>
                        <h4 className={`text-xs font-bold ${isPerformed ? "text-gray-900" : "text-gray-400"}`}>
                          Puja Performed
                        </h4>
                        <p className="text-[10px] text-gray-500">
                          {isPerformed ? "Sacred rituals completed by priests" : "Rituals to be performed by Vedic pandits"}
                        </p>
                      </div>
                    </div>

                    {/* Step 5: Video Delivered */}
                    <div className="relative">
                      <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white shadow-xs ${isVideoDelivered ? "bg-emerald-600" : "bg-gray-200 text-gray-400"
                        }`}>
                        {isVideoDelivered ? (
                          <CheckIcon className="w-3 h-3 stroke-[3]" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Step 5</span>
                        <h4 className={`text-xs font-bold ${isVideoDelivered ? "text-gray-900" : "text-gray-400"}`}>
                          Video Delivered
                        </h4>
                        <p className={`text-[10px] font-medium ${isVideoDelivered ? "text-emerald-700 font-bold" : "text-gray-400"}`}>
                          {isVideoDelivered ? "Recording link delivered" : "Available after puja is performed"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Row 5: Admin Controls (Status, Puja Scheduled Date, Puja Video / Photos Link) */}
      <div className="bg-white rounded-2xl border border-gray-150 p-5 sm:p-6 shadow-xs">
        <h3 className="text-sm font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100 flex items-center gap-2">
          <SparklesIcon className="w-4 h-4 text-emerald-600" />
          Admin Controls &amp; Video Delivery Link
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Status Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">Order Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 outline-none focus:border-emerald-500 shadow-2xs cursor-pointer"
            >
              <option value="created">Created</option>
              <option value="confirmed">Confirmed</option>
              <option value="scheduled">Puja Scheduled</option>
              <option value="performed">Performed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Scheduled Date */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">Scheduled Puja Date</label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => {
                const newDate = e.target.value;
                setScheduledDate(newDate);
                // When admin sets or changes the scheduled date, automatically advance status to "scheduled" if it is currently "created" or "confirmed"
                if (newDate && (selectedStatus === "created" || selectedStatus === "confirmed")) {
                  setSelectedStatus("scheduled");
                }
              }}
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-bold text-gray-900 outline-none focus:border-emerald-500 shadow-2xs cursor-pointer"
            />
          </div>

          {/* Video Link */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
              <VideoCameraIcon className="w-4 h-4 text-purple-600" />
              Puja Video &amp; Photos Link
            </label>
            <input
              type="url"
              value={videoLink}
              onChange={(e) => setVideoLink(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-900 outline-none focus:border-emerald-500 shadow-2xs"
            />
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[11px] text-gray-500">
            Note: Adding a video link allows the devotee to watch their ritual video directly from their <strong>Bookings</strong> page.
          </p>
          <button
            type="button"
            disabled={isUpdating}
            onClick={handleUpdateOrder}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95 disabled:opacity-60"
          >
            <ArrowPathIcon className={`w-4 h-4 ${isUpdating ? "animate-spin" : ""}`} />
            {isUpdating ? "Saving Changes..." : "Apply Updates"}
          </button>
        </div>
      </div>

      {/* For Service Team Footer Callout */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
        <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0">!</span>
        <div className="text-xs">
          <span className="font-bold text-amber-900 block mb-0.5">For Service Team</span>
          <p className="text-amber-800">
            Please share the above details (User Name, Participant Name, Gotra, Order Details, Puja Date, etc.) with the service team for smooth execution of the puja.
          </p>
        </div>
      </div>
    </div>
  );
}
