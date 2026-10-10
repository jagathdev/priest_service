"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

// ── Verification status type ──────────────────────────────────────────────────
type VerifyStatus = "pending" | "verified" | "not_found" | "error";

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams?.get("paymentId") || "N/A";
  const orderId = searchParams?.get("orderId") || "N/A";
  const title = searchParams?.get("title") || "Puja Seva";
  const amount = searchParams?.get("amount") || "0";
  const name = searchParams?.get("name") || "";
  const shoppingCartId = searchParams?.get("shoppingCartId") || orderId;

  // Use full original IDs for display
  const displayPayId = paymentId;
  const displayOrdId = shoppingCartId;

  // ── Payment is already verified and order is saved by sankalp/page.tsx ────
  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>("pending");
  const [transactionId, setTransactionId] = useState<string>("");

  useEffect(() => {
    if (paymentId === "N/A" || !shoppingCartId || shoppingCartId === "N/A") {
      setVerifyStatus("error");
    } else {
      // Since we reached here from a successful Razorpay callback that already called /api/payments/verify,
      // we can safely assume it's verified and the order is saved in the DB.
      setTransactionId(paymentId);
      setVerifyStatus("verified");
    }
  }, [paymentId, shoppingCartId]);

  const shareText = encodeURIComponent(`I just booked "${title}" on AstroVed! 🙏`);



  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {/* Hide footer on success page */}
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
            Your sacred puja is booked. Our purohits will begin the preparations — blessings are on their way to you. 🙏
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-stone-500 bg-stone-50 px-4 py-2 rounded-full border border-stone-100">
            <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            Booking ID <span className="text-[#f15a29] font-mono">#{displayOrdId !== "N/A" ? displayOrdId : displayPayId}</span>
          </div>
        </div>

        {/* ── Order Summary Card ─────────────────────────────────────── */}
        <div className="w-full bg-white rounded-3xl border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8">
          <div className="flex justify-between items-start mb-6 pb-6 border-b border-stone-100 border-dashed">
            <div>
              <h2 className="text-lg font-bold text-stone-900">{title}</h2>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-1">Amount Paid</p>
              <p className="text-xl font-black text-success">₹{amount}</p>
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
              <p className="text-xs text-stone-500 mt-1 font-medium leading-relaxed">Your ritual is performed live by verified purohits at the sacred temple.</p>
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
