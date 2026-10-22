"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useUser } from "@/contexts/UserContext";
import { request } from "@/lib/api-client";

const formatBookingId = (order: any) => {
  if (order?.orderNumber) {
    const clean = String(order.orderNumber).trim();
    if (clean.startsWith("#")) {
      const numOnly = clean.slice(1);
      return numOnly.length > 8 ? `#${numOnly.slice(-6).toUpperCase()}` : clean;
    }
    if (clean.includes("-")) {
      const parts = clean.split("-");
      return `#${parts[parts.length - 1]}`;
    }
    if (clean.length > 8) {
      return `#${clean.slice(-6).toUpperCase()}`;
    }
    return `#${clean}`;
  }
  if (order?._id) {
    return `#${String(order._id).slice(-6).toUpperCase()}`;
  }
  return "#200627";
};

const formatCardDate = (dateVal: any, fallback = "25 Sept 2026") => {
  if (!dateVal) return fallback;
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return fallback;
  const day = d.getDate();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

export default function BookingsTab() {
  const { user } = useUser();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [filter, setFilter] = useState("All");

  const fetchOrders = useCallback(async () => {
    if (!user?._id && !user?.id) return;
    try {
      const data = await request<any>(`/api/orders/user/${user._id || user.id}`);
      if (data.success) {
        setOrders(data.data);

        // Also update selectedOrder if it exists to reflect new status
        setSelectedOrder((prev: any) => {
          if (!prev) return null;
          const updated = data.data.find((o: any) => o._id === prev._id);
          return updated || prev;
        });
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Polling logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const hasPending = orders.some((o) => o.paymentStatus === "pending" || o.orderStatus === "pending");

    if (hasPending) {
      interval = setInterval(() => {
        if (document.visibilityState === "visible") {
          fetchOrders();
        }
      }, 20000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [orders, fetchOrders]);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div className="h-7 w-36 bg-stone-200/80 rounded-lg animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 w-16 bg-stone-200/80 rounded-full animate-pulse" />
            <div className="h-8 w-20 bg-stone-200/80 rounded-full animate-pulse" />
            <div className="h-8 w-24 bg-stone-200/80 rounded-full animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`booking-skeleton-${i}`}
              className="bg-white rounded-2xl sm:rounded-3xl border border-[#E2E8F0] p-4 sm:p-6 shadow-xs animate-pulse flex flex-col justify-between"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-3">
                <div className="h-4 w-24 bg-stone-200/80 rounded-md" />
                <div className="h-4 w-28 bg-stone-200/80 rounded-md" />
              </div>

              <hr className="border-stone-100 my-2" />

              {/* Service Info */}
              <div className="flex items-start gap-3 sm:gap-4 my-2">
                <div className="w-20 h-16 sm:w-28 sm:h-20 bg-stone-200/80 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 w-3/4 bg-stone-200/80 rounded-md" />
                  <div className="h-3 w-1/2 bg-stone-100 rounded-md" />
                </div>
              </div>

              {/* Progress Stepper Skeleton */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex justify-between items-center px-4">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 rounded-full bg-stone-200/80" />
                  <div className="w-12 h-2.5 bg-stone-200/80 rounded-md" />
                </div>
                <div className="flex-1 h-0.5 bg-stone-200/70 mx-2" />
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 rounded-full bg-stone-100" />
                  <div className="w-16 h-2.5 bg-stone-100 rounded-md" />
                </div>
                <div className="flex-1 h-0.5 bg-stone-200/70 mx-2" />
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 rounded-full bg-stone-100" />
                  <div className="w-14 h-2.5 bg-stone-100 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (selectedOrder) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-3.5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button onClick={() => setSelectedOrder(null)} className="flex items-center text-sm font-bold text-stone-500 hover:text-primary transition-colors">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back to Bookings
        </button>

        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#5c1b1c] font-serif mb-1 sm:mb-2">Puja Booking Details</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-stone-100 text-stone-600 px-3 py-1 rounded-full">Booking ID <span className="text-[#2563eb] font-extrabold">{formatBookingId(selectedOrder)}</span></span>
          </div>
        </div>

        {(() => {
          const isCancelled = selectedOrder.orderStatus === 'cancelled';
          const isRefunded = selectedOrder.paymentStatus === 'refunded' || selectedOrder.refundStatus === 'refunded' || selectedOrder.refundStatus === 'completed' || selectedOrder.orderStatus === 'refunded';
          const refundAmount = selectedOrder.refundAmount || selectedOrder.refundedAmount || selectedOrder.totalamount || selectedOrder.amount || selectedOrder.price;

          return (
            <div className={`border rounded-xl p-4 sm:p-6 relative overflow-hidden ${isRefunded ? 'bg-emerald-50/40 border-emerald-200' : isCancelled ? 'bg-red-50/40 border-red-200' : 'bg-[#fdfaf8] border-orange-100'
              }`}>
              <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                <div>
                  {isRefunded ? (
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block"></span>
                      REFUND SUCCESSFUL
                    </span>
                  ) : isCancelled ? (
                    <span className="text-[10px] font-extrabold text-danger bg-red-100 px-2.5 py-1 rounded-md uppercase tracking-wider">• CANCELLED</span>
                  ) : selectedOrder.orderStatus === 'completed' ? null : (
                    <span className="text-[10px] font-extrabold text-[#f15a29] bg-orange-100 px-2.5 py-1 rounded-md uppercase tracking-wider">• {selectedOrder.orderStatus}</span>
                  )}
                </div>
                <span className={`text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shrink-0 ${isRefunded ? 'bg-emerald-600' : isCancelled ? 'bg-danger' : selectedOrder.orderStatus === 'completed' ? 'bg-emerald-600' : 'bg-[#5c1b1c]'
                  }`}>
                  {isRefunded ? 'REFUNDED' : selectedOrder.orderStatus}
                </span>
              </div>

              <div className="mb-4 sm:mb-6">
                <h3 className={`text-lg sm:text-xl font-bold font-serif leading-snug ${isRefunded ? 'text-emerald-950' : isCancelled ? 'text-red-950' : 'text-[#5c1b1c]'
                  }`}>
                  {selectedOrder.itemName || selectedOrder.pooja}
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
                  {isRefunded
                    ? "Your order was cancelled and the refund was successfully processed."
                    : isCancelled
                      ? "This booking has been cancelled and rituals will not be performed."
                      : "Performed with personalized sankalpam in your family's name."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-6">
                {selectedOrder.temple && (
                  <div className="flex gap-2.5 sm:gap-3 items-start">
                    <svg className="w-5 h-5 text-[#f15a29] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-stone-400 uppercase">Temple</p>
                      <p className="text-xs sm:text-sm font-semibold text-stone-800 break-words">{selectedOrder.temple}</p>
                    </div>
                  </div>
                )}
                <div className="flex gap-2.5 sm:gap-3 items-start">
                  <svg className="w-5 h-5 text-[#f15a29] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-stone-400 uppercase">Puja Date</p>
                    <p className="text-xs sm:text-sm font-semibold text-stone-800">
                      {selectedOrder.scheduledDate
                        ? formatCardDate(selectedOrder.scheduledDate, "")
                        : "Date to be scheduled"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-2.5">
                {isRefunded ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 rounded-full px-4 py-2 shadow-2xs">
                    <svg className="w-3.5 h-3.5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Refund Successful {refundAmount ? `(₹${refundAmount})` : ''} • Credited to Account
                  </span>
                ) : isCancelled ? (
                  <span className="inline-flex items-center text-xs font-bold text-red-700 bg-red-100/70 border border-red-200 rounded-full px-4 py-2 shadow-2xs">
                    Booking cancelled • Refund initiated
                  </span>
                ) : (
                  <span className="inline-flex items-center text-xs font-bold text-stone-600 bg-white border border-stone-200 rounded-full px-4 py-2 shadow-sm">
                    Video available after the puja
                  </span>
                )}
              </div>
            </div>
          );
        })()}

        {/* Devotee Details */}
        <div className="border border-stone-200 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#5c1b1c] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <h4 className="font-bold text-stone-800">Devotee Details</h4>
          </div>
          <div className="flex flex-wrap gap-2 mb-5 sm:mb-6">
            {(selectedOrder.participants || []).map((p: any, i: number) => (
              <span key={i} className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-stone-50 border border-stone-200 rounded-full text-xs font-bold text-stone-700 capitalize">
                {p.name}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-stone-100">
            {selectedOrder.gotra && (
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Gotra</p>
                <p className="text-xs sm:text-sm font-semibold text-stone-800">{selectedOrder.gotra}</p>
              </div>
            )}
            {selectedOrder.wish && (
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Sankalpam</p>
                <p className="text-xs sm:text-sm font-semibold text-stone-800">{selectedOrder.wish}</p>
              </div>
            )}
          </div>
        </div>

        {/* Journey Timeline */}
        <div className="border border-stone-200 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-5 sm:mb-6">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedOrder.orderStatus === 'cancelled' || selectedOrder.orderStatus === 'refunded' || selectedOrder.paymentStatus === 'refunded' ? 'bg-danger' : 'bg-[#5c1b1c]'}`}>
              {selectedOrder.orderStatus === 'cancelled' || selectedOrder.orderStatus === 'refunded' || selectedOrder.paymentStatus === 'refunded' ? (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              )}
            </div>
            <h4 className="font-bold text-stone-800">
              {selectedOrder.orderStatus === 'cancelled' || selectedOrder.orderStatus === 'refunded' || selectedOrder.paymentStatus === 'refunded' ? 'Cancellation & Refund Status' : 'Puja Journey'}
            </h4>
          </div>

          {selectedOrder.orderStatus === 'cancelled' || selectedOrder.orderStatus === 'refunded' || selectedOrder.paymentStatus === 'refunded' ? (
            /* Cancelled / Refunded Timeline */
            <div className="space-y-6 sm:space-y-8 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-danger before:via-danger before:to-stone-200">
              {/* Step 1: Booking Confirmed */}
              <div className="relative flex items-center justify-end md:justify-between md:odd:flex-row-reverse group is-active">
                <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-primary text-white shadow shrink-0 z-10">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div className="w-[calc(100%-2.5rem)] sm:w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-3 sm:p-4 border border-stone-100 rounded-xl bg-stone-50">
                  <div className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider mb-0.5 sm:mb-1">Step 1</div>
                  <h5 className="font-bold text-stone-800 text-xs sm:text-sm">Booking Confirmed</h5>
                  <p className="text-[11px] sm:text-xs text-stone-500 font-medium mt-0.5 sm:mt-1">{formatCardDate(selectedOrder.createdAt, "Recent")} • Payment received</p>
                </div>
              </div>

              {/* Step 2: Order Cancelled */}
              <div className="relative flex items-center justify-end md:justify-between md:odd:flex-row-reverse group is-active">
                <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-danger text-white shadow shrink-0 z-10">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </div>
                <div className="w-[calc(100%-2.5rem)] sm:w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-3 sm:p-4 border border-red-100 rounded-xl bg-red-50/50">
                  <div className="text-[10px] font-extrabold text-danger uppercase tracking-wider mb-0.5 sm:mb-1">Step 2</div>
                  <h5 className="font-bold text-red-900 text-xs sm:text-sm">Booking Cancelled</h5>
                  <p className="text-[11px] sm:text-xs text-red-700 font-medium mt-0.5 sm:mt-1">
                    {selectedOrder.cancellationReason || "Booking cancelled upon request"}
                  </p>
                </div>
              </div>

              {/* Step 3: Refund Status */}
              {(() => {
                const isRefunded = selectedOrder.paymentStatus === 'refunded' || selectedOrder.orderStatus === 'refunded' || selectedOrder.refundStatus === 'refunded' || selectedOrder.refundStatus === 'completed' || selectedOrder.orderStatus === 'refund';
                const refundAmount = selectedOrder.refundAmount || selectedOrder.refundedAmount || selectedOrder.totalamount || selectedOrder.amount || selectedOrder.price;
                return (
                  <div className="relative flex items-center justify-end md:justify-between md:odd:flex-row-reverse group is-active">
                    <div className={`absolute left-0 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full border-4 border-white shadow shrink-0 z-10 ${isRefunded ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`}>
                      {isRefunded ? (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      )}
                    </div>
                    <div className={`w-[calc(100%-2.5rem)] sm:w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-3 sm:p-4 border rounded-xl ${isRefunded ? 'border-emerald-200 bg-emerald-50/60' : 'border-amber-100 bg-amber-50/40'}`}>
                      <div className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider mb-0.5 sm:mb-1">Step 3</div>
                      <h5 className={`text-xs sm:text-sm font-extrabold flex items-center gap-1.5 ${isRefunded ? 'text-emerald-900' : 'text-stone-800'}`}>
                        <span>{isRefunded ? "Refund Successful" : "Refund in Progress"}</span>
                        {isRefunded && refundAmount && (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                            ₹{refundAmount}
                          </span>
                        )}
                      </h5>
                      <p className={`text-[11px] sm:text-xs font-medium mt-0.5 sm:mt-1 ${isRefunded ? 'text-emerald-700' : 'text-stone-600'}`}>
                        {isRefunded
                          ? "Refund has been processed and successfully credited to your account."
                          : "Refund is initiated and will be credited to your original payment method in 3–5 business days."}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            /* Standard Journey Timeline */
            <div className={`space-y-6 sm:space-y-8 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 ${selectedOrder.orderStatus === 'completed' ? 'before:bg-primary' : selectedOrder.orderStatus === 'performed' ? 'before:bg-gradient-to-b before:from-primary before:via-primary before:to-stone-200' : selectedOrder.orderStatus === 'scheduled' ? 'before:bg-gradient-to-b before:from-primary before:via-stone-200 before:to-stone-200' : 'before:bg-gradient-to-b before:from-primary before:via-stone-200 before:to-stone-200'}`}>

              <div className="relative flex items-center justify-end md:justify-between md:odd:flex-row-reverse group is-active">
                <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-primary text-white shadow shrink-0 z-10">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div className="w-[calc(100%-2.5rem)] sm:w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-3 sm:p-4 border border-stone-100 rounded-xl bg-stone-50">
                  <div className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider mb-0.5 sm:mb-1">Step 1</div>
                  <h5 className="font-bold text-stone-800 text-xs sm:text-sm">Booking Confirmed</h5>
                  <p className="text-[11px] sm:text-xs text-stone-500 font-medium mt-0.5 sm:mt-1">{formatCardDate(selectedOrder.createdAt, "Recent")} • Payment received</p>
                </div>
              </div>

              <div className="relative flex items-center justify-end md:justify-between md:odd:flex-row-reverse group is-active">
                <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-primary text-white shadow shrink-0 z-10">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div className="w-[calc(100%-2.5rem)] sm:w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-3 sm:p-4 border border-stone-100 rounded-xl bg-stone-50">
                  <div className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider mb-0.5 sm:mb-1">Step 2</div>
                  <h5 className="font-bold text-stone-800 text-xs sm:text-sm">Sankalpam Details Submitted</h5>
                  <p className="text-[11px] sm:text-xs text-stone-500 font-medium mt-0.5 sm:mt-1">Devotee names & gotra noted</p>
                </div>
              </div>

              <div className={`relative flex items-center justify-end md:justify-between md:odd:flex-row-reverse group ${selectedOrder.orderStatus === 'scheduled' || selectedOrder.orderStatus === 'performed' || selectedOrder.orderStatus === 'completed' ? 'is-active' : ''}`}>
                <div className={`absolute left-0 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full border-4 border-white shadow shrink-0 z-10 ${selectedOrder.orderStatus === 'scheduled' || selectedOrder.orderStatus === 'performed' || selectedOrder.orderStatus === 'completed' ? 'bg-primary text-white' : 'bg-white'}`}>
                  {selectedOrder.orderStatus === 'scheduled' || selectedOrder.orderStatus === 'performed' || selectedOrder.orderStatus === 'completed' ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-stone-300"></div>
                  )}
                </div>
                <div className={`w-[calc(100%-2.5rem)] sm:w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-3 sm:p-4 border border-stone-100 rounded-xl ${selectedOrder.orderStatus === 'scheduled' || selectedOrder.orderStatus === 'performed' || selectedOrder.orderStatus === 'completed' ? 'bg-stone-50' : 'bg-white opacity-60'}`}>
                  <div className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider mb-0.5 sm:mb-1">Step 3</div>
                  <h5 className="font-bold text-stone-800 text-xs sm:text-sm">Puja Scheduled</h5>
                  <p className="text-[11px] sm:text-xs text-stone-500 font-medium mt-0.5 sm:mt-1">
                    {selectedOrder.scheduledDate
                      ? `Muhurat - ${formatCardDate(selectedOrder.scheduledDate, "")}`
                      : "Date to be scheduled"}
                  </p>
                </div>
              </div>

              {/* Step 4: Puja Performed */}
              <div className={`relative flex items-center justify-end md:justify-between md:odd:flex-row-reverse group ${selectedOrder.orderStatus === 'performed' || selectedOrder.orderStatus === 'completed' ? 'is-active' : ''}`}>
                <div className={`absolute left-0 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full border-4 border-white shadow shrink-0 z-10 ${selectedOrder.orderStatus === 'performed' || selectedOrder.orderStatus === 'completed' ? 'bg-primary text-white' : 'bg-white'}`}>
                  {selectedOrder.orderStatus === 'performed' || selectedOrder.orderStatus === 'completed' ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-stone-300"></div>
                  )}
                </div>
                <div className={`w-[calc(100%-2.5rem)] sm:w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-3 sm:p-4 border border-stone-100 rounded-xl ${selectedOrder.orderStatus === 'performed' || selectedOrder.orderStatus === 'completed' ? 'bg-stone-50' : 'bg-white opacity-60'}`}>
                  <div className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider mb-0.5 sm:mb-1">Step 4</div>
                  <h5 className="font-bold text-stone-800 text-xs sm:text-sm">Puja Performed</h5>
                  <p className="text-[11px] sm:text-xs text-stone-500 font-medium mt-0.5 sm:mt-1">
                    {selectedOrder.orderStatus === 'performed' || selectedOrder.orderStatus === 'completed' ? "Sacred rituals successfully completed" : "Rituals to be performed by Vedic pandits"}
                  </p>
                </div>
              </div>

              {/* Step 5: Video Delivered */}
              <div className={`relative flex items-center justify-end md:justify-between md:odd:flex-row-reverse group ${selectedOrder.orderStatus === 'completed' ? 'is-active' : ''}`}>
                <div className={`absolute left-0 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full border-4 border-white shadow shrink-0 z-10 ${selectedOrder.orderStatus === 'completed' ? 'bg-primary text-white' : 'bg-white'}`}>
                  {selectedOrder.orderStatus === 'completed' ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-stone-300"></div>
                  )}
                </div>
                <div className={`w-[calc(100%-2.5rem)] sm:w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-3 sm:p-4 border border-stone-100 rounded-xl ${selectedOrder.orderStatus === 'completed' ? 'bg-stone-50' : 'bg-white opacity-60'}`}>
                  <div className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider mb-0.5 sm:mb-1">Step 5</div>
                  <h5 className="font-bold text-stone-800 text-xs sm:text-sm">Video Delivered</h5>
                  {selectedOrder.videoLink && (selectedOrder.orderStatus === 'performed' || selectedOrder.orderStatus === 'completed') ? (
                    <a href={selectedOrder.videoLink} target="_blank" rel="noreferrer" className="text-xs text-primary font-bold mt-1 inline-block underline">Watch Recording</a>
                  ) : (
                    <p className="text-[11px] sm:text-xs text-stone-500 font-medium mt-0.5 sm:mt-1">Available after the puja</p>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    );
  }

  const hasCancelledOrders = orders.some(
    (o) => o.orderStatus === "cancelled" || o.orderStatus === "refund" || o.paymentStatus === "refunded" || (o as any).refundStatus === "refunded"
  );

  const filteredOrders = orders.filter((o) => {
    if (filter === "All") return true;
    if (filter === "Ongoing") return o.orderStatus !== "completed" && o.orderStatus !== "cancelled" && o.orderStatus !== "refunded" && o.paymentStatus !== "refunded";
    if (filter === "Complete") return o.orderStatus === "completed";
    if (filter === "Cancelled") return o.orderStatus === "cancelled" || o.orderStatus === "refunded" || o.paymentStatus === "refunded" || (o as any).refundStatus === "refunded";
    return true;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-3 sm:p-6 lg:p-8 min-h-[500px]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 sm:mb-8 gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[10px] bg-danger text-white flex items-center justify-center shrink-0 shadow-sm">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
            </svg>
          </div>
          <h2 className="text-lg sm:text-2xl font-bold font-serif text-[#333]">
            Bookings <span className="text-gray-500 font-medium text-base sm:text-lg ml-1">({filteredOrders.length})</span>
          </h2>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap sm:flex-nowrap w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilter("All")}
            className={`px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 ${filter === "All"
              ? "bg-primary text-white shadow-sm"
              : "bg-[#ebebeb] text-gray-700 hover:bg-[#e0e0e0]"
              }`}
          >
            <span>All</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter("Ongoing")}
            className={`px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 ${filter === "Ongoing"
              ? "bg-primary text-white shadow-sm"
              : "bg-[#ebebeb] text-gray-700 hover:bg-[#e0e0e0]"
              }`}
          >
            <span>Ongoing</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter("Complete")}
            className={`px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 ${filter === "Complete"
              ? "bg-primary text-white shadow-sm"
              : "bg-[#ebebeb] text-gray-700 hover:bg-[#e0e0e0]"
              }`}
          >
            <span>Complete</span>
          </button>
          {hasCancelledOrders && (
            <button
              type="button"
              onClick={() => setFilter("Cancelled")}
              className={`px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 ${filter === "Cancelled"
                ? "bg-primary text-white shadow-sm"
                : "bg-[#ebebeb] text-gray-700 hover:bg-[#e0e0e0]"
                }`}
            >
              <span>Cancelled</span>
            </button>
          )}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <p className="text-stone-500 font-medium">You have no active bookings.</p>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6 mb-8">
            {filteredOrders.map((order, idx) => {
              const isScheduled = Boolean(
                order.orderStatus === 'scheduled' ||
                order.orderStatus === 'performed' ||
                order.orderStatus === 'completed' ||
                order.scheduledDate
              );
              const isPerformed = Boolean(
                order.orderStatus === 'performed' ||
                order.orderStatus === 'completed'
              );
              // Only mark video as completed / ready when orderStatus is actually 'completed'
              const isCompleted = Boolean(
                order.orderStatus === 'completed' && order.videoLink
              ) || order.orderStatus === 'completed';

              const bookingDate = formatCardDate(order.createdAt || order.bookingDate);
              const scheduledDate = order.scheduledDate ? formatCardDate(order.scheduledDate, "") : "";
              const bookingId = formatBookingId(order);
              const serviceImg = order.image || order.serviceImage || order.imageUrl || "/images/Ganesh-Chaturthi-Mahapuja.jpg";
              const serviceTitle = order.itemName || order.pooja || order.serviceTitle || "Rahu Shanti Rudrabhishek";
              const templeLocation = order.temple || order.templeLocation || "Shri Rahu Temple, Paithani,";

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedOrder(order)}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-[#E2E8F0] p-3.5 sm:p-5 md:p-6 hover:shadow-md transition relative w-full cursor-pointer overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-center mb-2.5 sm:mb-3 gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-gray-800 text-xs sm:text-[14px] shrink-0 whitespace-nowrap">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{bookingDate}</span>
                    </div>
                    <div className="font-bold text-gray-800 text-xs sm:text-[14px] truncate text-right">
                      Booking: <span className="text-[#2563eb] font-extrabold">{bookingId}</span>
                    </div>
                  </div>

                  <hr className="border-gray-100 my-2.5 sm:my-4" />

                  {/* Card Body - Dynamic Image and Service Details */}
                  <div className="flex items-start gap-2.5 sm:gap-4 mb-4 sm:mb-6">
                    <div className="w-20 h-14 sm:w-28 sm:h-20 bg-gray-100 rounded-lg sm:rounded-xl overflow-hidden shrink-0 relative border border-gray-100 shadow-xs flex items-center justify-center">
                      <Image
                        src={serviceImg || "/images/Ganesh-Chaturthi-Mahapuja.jpg"}
                        alt={serviceTitle}
                        width={112}
                        height={80}
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[13px] sm:text-[17px] font-extrabold text-primary leading-tight mb-1 sm:mb-1.5 line-clamp-2">
                        {serviceTitle}
                      </h3>
                      <div className="flex items-center gap-1 text-gray-800 font-bold text-[11px] sm:text-[14px]">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-800 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2v3" />
                          <path d="M7 6l5-3 5 3v2H7V6z" />
                          <path d="M5 10h14v11H5V10z" />
                          <path d="M10 21v-5a2 2 0 0 1 4 0v5" />
                        </svg>
                        <span className="truncate">{templeLocation}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Tracker Stepper */}
                  <div className="relative mt-5 sm:mt-8 pb-1 sm:pb-2">
                    {order.orderStatus === 'cancelled' || order.orderStatus === 'refunded' || order.paymentStatus === 'refunded' ? (
                      /* Cancelled / Refunded Order Stepper */
                      <div>
                        <div className="absolute top-5 sm:top-6 left-8 sm:left-12 right-1/2 h-[2px] sm:h-[2.5px] -z-0 bg-danger"></div>
                        <div className="absolute top-5 sm:top-6 left-1/2 right-8 sm:right-16 h-[2px] sm:h-[2.5px] -z-0 bg-[#eadfd5] overflow-hidden">
                          <div className={`h-full ${order.paymentStatus === 'refunded' || (order as any).refundStatus === 'refunded' || order.orderStatus === 'refunded' ? 'w-full bg-primary' : 'w-1/2 bg-amber-500'}`} />
                        </div>

                        <div className="flex justify-between items-start text-center gap-1">
                          {/* Step 1: Booked */}
                          <div className="flex-1 min-w-0 flex flex-col items-center">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-primary bg-white flex items-center justify-center mb-1.5 sm:mb-2 z-10 shadow-xs relative">
                              <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="3" y="5" width="18" height="15" rx="2.5" stroke="#374151" strokeWidth="1.6" fill="#ffffff" />
                                <path d="M3 9.5h18" stroke="#ef4444" strokeWidth="1.6" />
                                <path d="M7 3v3.5M17 3v3.5" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" />
                                <circle cx="12" cy="14.5" r="2.2" fill="#3b82f6" />
                              </svg>
                            </div>
                            <p className="text-[11px] sm:text-[13px] font-extrabold text-gray-900 leading-tight">Booked</p>
                            <span className="text-[10px] sm:text-[12px] font-bold text-gray-600 truncate mt-0.5">{bookingDate}</span>
                          </div>

                          {/* Step 2: Cancelled */}
                          <div className="flex-1 min-w-0 flex flex-col items-center">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-danger bg-white flex items-center justify-center mb-1.5 sm:mb-2 z-10 shadow-xs relative">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </div>
                            <p className="text-[11px] sm:text-[13px] font-extrabold text-danger leading-tight">Cancelled</p>
                            <span className="text-[10px] sm:text-[12px] font-bold text-red-600 truncate mt-0.5">Booking void</span>
                          </div>

                          {/* Step 3: Refund */}
                          {(() => {
                            const isRef = order.paymentStatus === 'refunded' || (order as any).refundStatus === 'refunded' || order.orderStatus === 'refunded';
                            return (
                              <div className="flex-1 min-w-0 flex flex-col items-center">
                                <div className="h-10 sm:h-12 flex items-center justify-center mb-1.5 sm:mb-2 z-10">
                                  <div className={`px-2 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold text-[10px] sm:text-[12px] flex items-center gap-1 sm:gap-1.5 shadow-xs whitespace-nowrap text-white ${isRef ? 'bg-emerald-600' : 'bg-amber-500'}`}>
                                    <span>{isRef ? "Refund Successful" : "Refund in Progress"}</span>
                                  </div>
                                </div>
                                <p className={`text-[9px] sm:text-[11px] text-center leading-tight mt-0.5 font-bold ${isRef ? 'text-emerald-700' : 'text-stone-600'}`}>
                                  {isRef ? "Credited to account" : "3-5 business days"}
                                </p>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    ) : (
                      /* Standard Progress Stepper */
                      <div>
                        {/* Connecting line behind nodes - Highlights dynamically when reached */}
                        <div className={`absolute top-5 sm:top-6 left-8 sm:left-12 right-1/2 h-[2px] sm:h-[2.5px] -z-0 transition-colors ${isScheduled ? 'bg-primary' : 'bg-[#eadfd5]'}`}></div>
                        <div className="absolute top-5 sm:top-6 left-1/2 right-8 sm:right-16 h-[2px] sm:h-[2.5px] -z-0 bg-[#eadfd5] overflow-hidden">
                          <div
                            className={`h-full bg-primary transition-all duration-500 ${isCompleted ? "w-full" : isPerformed ? "w-1/2" : "w-0"
                              }`}
                          />
                        </div>

                        <div className="flex justify-between items-start text-center gap-1">
                          {/* Step 1: Booked */}
                          <div className="flex-1 min-w-0 flex flex-col items-center">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-primary bg-white flex items-center justify-center mb-1.5 sm:mb-2 z-10 shadow-xs relative">
                              <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="3" y="5" width="18" height="15" rx="2.5" stroke="#374151" strokeWidth="1.6" fill="#ffffff" />
                                <path d="M3 9.5h18" stroke="#ef4444" strokeWidth="1.6" />
                                <path d="M7 3v3.5M17 3v3.5" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" />
                                <circle cx="12" cy="14.5" r="2.2" fill="#3b82f6" />
                              </svg>
                            </div>
                            <p className="text-[11px] sm:text-[13px] font-extrabold text-gray-900 leading-tight">Booked</p>
                            <div className="flex items-center justify-center gap-1 mt-0.5 max-w-full">
                              <span className="text-[10px] sm:text-[12px] font-bold text-gray-600 truncate">{bookingDate}</span>
                              <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                                <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* Step 2: Puja Scheduled */}
                          <div className="flex-1 min-w-0 flex flex-col items-center">
                            {isScheduled ? (
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-primary bg-white flex items-center justify-center mb-1.5 sm:mb-2 z-10 shadow-xs relative">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 fill-current" viewBox="0 0 24 24">
                                  <path d="M12 2.5c-.8 1.4-1.8 3-1.8 4.5 0 1.2.8 2 1.8 2s1.8-.8 1.8-2c0-1.5-1-3.1-1.8-4.5zM4 14.5c0 3.2 3.6 5.5 8 5.5s8-2.3 8-5.5H4zm-1-1.5h18c.5 0 1-.4 1-.9 0-.5-.5-.9-1-.9H3c-.5 0-1 .4-1 .9 0 .5.5.9 1 .9z" />
                                </svg>
                              </div>
                            ) : (
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#faebe6] flex items-center justify-center mb-1.5 sm:mb-2 z-10 shadow-xs">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#8c7b74]" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2.5c-.8 1.4-1.8 3-1.8 4.5 0 1.2.8 2 1.8 2s1.8-.8 1.8-2c0-1.5-1-3.1-1.8-4.5zM4 14.5c0 3.2 3.6 5.5 8 5.5s8-2.3 8-5.5H4zm-1-1.5h18c.5 0 1-.4 1-.9 0-.5-.5-.9-1-.9H3c-.5 0-1 .4-1 .9 0 .5.5.9 1 .9z" />
                                </svg>
                              </div>
                            )}
                            <p className={`text-[11px] sm:text-[13px] leading-tight ${isScheduled ? 'font-extrabold text-gray-900' : 'font-bold text-[#8c7b74]'}`}>
                              Puja Scheduled
                            </p>
                            {scheduledDate ? (
                              <div className="flex items-center justify-center gap-1 mt-0.5 max-w-full">
                                <span className="text-[10px] sm:text-[12px] font-bold text-gray-600 truncate">on {scheduledDate}</span>
                                <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                                  <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              </div>
                            ) : (
                              <p className="text-[10px] sm:text-[11px] font-bold text-[#8c7b74] mt-0.5 truncate">Date to be scheduled</p>
                            )}
                          </div>

                          {/* Step 3: Puja Video */}
                          <div className="flex-1 min-w-0 flex flex-col items-center">
                            <div className="h-10 sm:h-12 flex items-center justify-center mb-1.5 sm:mb-2 z-10">
                              {isCompleted ? (
                                <div className="px-2 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary text-white font-bold text-[10px] sm:text-[12px] flex items-center gap-1 sm:gap-1.5 shadow-xs whitespace-nowrap">
                                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                  <span>Video Delivered</span>
                                </div>
                              ) : (
                                <div className="px-2 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#f4ebe6] text-[#8c7b74] font-bold text-[10px] sm:text-[12px] flex items-center gap-1 sm:gap-1.5 shadow-xs whitespace-nowrap">
                                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                  <span>Puja Video</span>
                                </div>
                              )}
                            </div>
                            <p className={`text-[9px] sm:text-[11px] text-center leading-tight mt-0.5 ${isCompleted ? 'font-bold text-primary' : 'font-medium text-[#8c7b74]'}`}>
                              {isCompleted
                                ? "Recording is ready"
                                : <>Available only after<br className="hidden sm:inline" /> puja performed</>}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center pt-8">
            <p className="text-xs font-bold text-stone-400">You&apos;ve reached the end of your bookings</p>
            <p className="text-[10px] font-semibold text-stone-400 mt-1">{filteredOrders.length} of {orders.length} bookings shown</p>
          </div>
        </div>
      )}
    </div>
  );
}
