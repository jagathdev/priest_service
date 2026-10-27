"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

type StatusState = "loading" | "pending" | "paid" | "failed" | "timeout" | "not_found";

interface OrderStatusData {
  paymentStatus: string;
  orderStatus: string;
  orderNumber?: string;
  itemName?: string;
  amount?: number;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const razorpayOrderId = searchParams?.get("razorpayOrderId") || searchParams?.get("orderId") || "";

  const [statusState, setStatusState] = useState<StatusState>(() => {
    return !razorpayOrderId ? "not_found" : "loading";
  });
  const [orderData, setOrderData] = useState<OrderStatusData | null>(null);

  useEffect(() => {
    if (!razorpayOrderId) {
      return;
    }

    let isMounted = true;
    let timer: NodeJS.Timeout;
    const startTime = Date.now();
    const maxPollMs = 60 * 1000; // 60 seconds max

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";

    const checkStatus = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/orders/status?razorpayOrderId=${encodeURIComponent(razorpayOrderId)}`);
        if (!isMounted) return;

        if (res.status === 404) {
          // If 404, order may be momentarily creating or unknown
          if (Date.now() - startTime < maxPollMs) {
            timer = setTimeout(checkStatus, 3000);
          } else {
            setStatusState("not_found");
          }
          return;
        }

        const data = await res.json();
        if (data.success && data.data) {
          setOrderData(data.data);
          const payStatus = data.data.paymentStatus;

          if (payStatus === "paid") {
            setStatusState("paid");
            return;
          } else if (payStatus === "failed") {
            setStatusState("failed");
            return;
          } else {
            // Pending payment: check timeout
            if (Date.now() - startTime >= maxPollMs) {
              setStatusState("timeout");
            } else {
              setStatusState("pending");
              timer = setTimeout(checkStatus, 3000);
            }
          }
        } else {
          if (Date.now() - startTime < maxPollMs) {
            timer = setTimeout(checkStatus, 3000);
          } else {
            setStatusState("timeout");
          }
        }
      } catch {
        if (Date.now() - startTime < maxPollMs) {
          timer = setTimeout(checkStatus, 3000);
        } else {
          setStatusState("timeout");
        }
      }
    };

    checkStatus();

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [razorpayOrderId]);

  // Derived state values from server only
  const displayTitle = orderData?.itemName || "Puja Seva";
  const displayAmount = orderData?.amount !== undefined ? String(orderData.amount) : "0";
  const displayOrderNumber = orderData?.orderNumber || razorpayOrderId;

  // View: Pending / Confirming state
  if (statusState === "loading" || statusState === "pending") {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <style>{`footer, [data-global-chrome="assistant"] { display: none !important; }`}</style>
        <div className="mx-auto max-w-xl px-4 py-24 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-amber-50 flex items-center justify-center border-4 border-amber-100">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-stone-900">Confirming Payment...</h1>
          <p className="text-stone-600 text-sm max-w-md mx-auto">
            We are verifying your transaction with the payment gateway. Please keep this window open.
          </p>
        </div>
      </div>
    );
  }

  // View: Timeout (after 60s of pending)
  if (statusState === "timeout") {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <style>{`footer, [data-global-chrome="assistant"] { display: none !important; }`}</style>
        <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-blue-50 flex items-center justify-center border-4 border-blue-100 text-blue-600 text-2xl font-bold">
            ℹ
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-stone-900">Payment Processing</h1>
          <p className="text-stone-600 text-sm max-w-md mx-auto leading-relaxed">
            Your payment is currently being confirmed by the bank. We will confirm your booking by WhatsApp once completed. Please do not pay again.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <Link
              href="/account?tab=bookings"
              className="bg-success text-white font-extrabold text-sm px-6 py-3 rounded-xl shadow-sm"
            >
              View My Bookings
            </Link>
            <Link
              href="/"
              className="bg-white border-2 border-stone-200 text-stone-700 font-extrabold text-sm px-6 py-3 rounded-xl"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // View: Payment Failed
  if (statusState === "failed") {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <style>{`footer, [data-global-chrome="assistant"] { display: none !important; }`}</style>
        <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-red-50 flex items-center justify-center border-4 border-red-100 text-red-600 text-3xl font-bold">
            ✕
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-stone-900">Payment Failed</h1>
          <p className="text-stone-600 text-sm max-w-md mx-auto">
            The payment attempt was not successful. No amount has been deducted. You may retry your booking.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <Link
              href="/puja"
              className="bg-success text-white font-extrabold text-sm px-6 py-3 rounded-xl shadow-sm"
            >
              Browse Pujas & Retry
            </Link>
            <Link
              href="/"
              className="bg-white border-2 border-stone-200 text-stone-700 font-extrabold text-sm px-6 py-3 rounded-xl"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // View: Success (paid)
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <style>{`footer, [data-global-chrome="assistant"] { display: none !important; }`}</style>

      <div className="mx-auto max-w-3xl px-4 py-16 space-y-10 flex flex-col items-center">
        {/* ── Top Success Indicator ─────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center border-8 border-green-50/50 mb-2">
            <div className="w-16 h-16 rounded-full bg-[#1e9e4a] flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-stone-900 mb-1">Booking Successful</h1>
          <p className="text-stone-500 text-sm max-w-md mx-auto">
            Your sacred puja is booked. Our Pandits will begin the preparations — blessings are on their way to you. 🙏
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-stone-500 bg-stone-50 px-4 py-2 rounded-full border border-stone-100">
            <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            Booking ID <span className="text-[#f15a29] font-mono">{displayOrderNumber}</span>
          </div>
        </div>

        {/* ── Order Summary Card ─────────────────────────────────────── */}
        <div className="w-full bg-white rounded-3xl border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8">
          <div className="flex justify-between items-start mb-6 pb-6 border-b border-stone-100 border-dashed">
            <div>
              <h2 className="text-lg font-bold text-stone-900">{displayTitle}</h2>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-1">Amount Paid</p>
              <p className="text-xl font-black text-success">₹{displayAmount}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-extrabold text-stone-900 mb-4">Puja Inclusions</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-stone-600 font-medium">
                <span className="text-[#f15a29] mt-1 shrink-0 text-xs">◆</span>
                A complete video recording of the ritual will be sent to your WhatsApp within 48 hours.
              </li>
              <li className="flex items-start gap-2.5 text-sm text-stone-600 font-medium">
                <span className="text-[#f15a29] mt-1 shrink-0 text-xs">◆</span>
                A personalized Sankalp taken using your name and Gotra.
              </li>
              <li className="flex items-start gap-2.5 text-sm text-stone-600 font-medium">
                <span className="text-[#f15a29] mt-1 shrink-0 text-xs">◆</span>
                Puja is a ritualistic worship performed to seek divine blessings.
              </li>
            </ul>
          </div>
        </div>

        {/* ── Timeline ─────────────────────────────────────── */}
        <div className="w-full max-w-md mx-auto pt-4 relative">
          <div className="absolute left-[19px] top-4 bottom-8 w-px bg-[#f15a29]/20 z-0"></div>

          <div className="relative z-10 flex gap-4 mb-8">
            <div className="w-10 h-10 rounded-full bg-white border-2 border-[#f15a29] flex items-center justify-center shrink-0 shadow-sm">
              <svg className="w-4 h-4 text-[#f15a29]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">Sankalpam prepared</h4>
              <p className="text-xs text-stone-500 mt-1 font-medium leading-relaxed">Our purohit prepares your sankalpam using the devotee names and gotra you provided.</p>
            </div>
          </div>

          <div className="relative z-10 flex gap-4 mb-8">
            <div className="w-10 h-10 rounded-full bg-white border-2 border-[#f15a29] flex items-center justify-center shrink-0 shadow-sm">
              <svg className="w-4 h-4 text-[#f15a29]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">Puja performed at the temple</h4>
              <p className="text-xs text-stone-500 mt-1 font-medium leading-relaxed">Your ritual is performed live by verified Pandits at the sacred temple.</p>
            </div>
          </div>

          <div className="relative z-10 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-white border-2 border-[#f15a29] flex items-center justify-center shrink-0 shadow-sm">
              <svg className="w-4 h-4 text-[#f15a29]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">Puja video delivered</h4>
              <p className="text-xs text-stone-500 mt-1 font-medium leading-relaxed">Your puja video arrives on WhatsApp within 24 hours.</p>
            </div>
          </div>
        </div>

        {/* ── Action Buttons ─────────────────────────────────────── */}
        <div className="pt-4 flex flex-col items-center space-y-4 w-full">
          <div className="flex gap-4">
            <Link
              href="/account?tab=bookings"
              className="bg-success hover:bg-[#009644] text-white font-extrabold text-sm px-8 py-3.5 rounded-xl transition-all shadow-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              View My Bookings
            </Link>
            <Link
              href="/"
              className="bg-white border-2 border-stone-200 text-stone-700 hover:border-stone-300 hover:bg-stone-50 font-extrabold text-sm px-8 py-3.5 rounded-xl transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              Back to Home
            </Link>
          </div>

          <p className="text-xs font-bold text-success flex items-center gap-1.5 mt-4">
            <i className="fa-brands fa-whatsapp text-[16px]"></i>
            A confirmation has been sent to your WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#59a031]" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
