"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

// ── Verification status type ──────────────────────────────────────────────────
type VerifyStatus = "pending" | "verified" | "not_found" | "error";

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentId      = searchParams?.get("paymentId")      || "N/A";
  const orderId        = searchParams?.get("orderId")        || "N/A";
  const title          = searchParams?.get("title")          || "Puja Seva";
  const amount         = searchParams?.get("amount")         || "0";
  const name           = searchParams?.get("name")           || "";
  const shoppingCartId = searchParams?.get("shoppingCartId") || orderId;

  // Use full original IDs for display
  const displayPayId = paymentId;
  const displayOrdId = shoppingCartId;

  // ── AstroVed backend verification state ──────────────────────────────────
  const [verifyStatus, setVerifyStatus]     = useState<VerifyStatus>("pending");
  const [transactionId, setTransactionId]   = useState<string>("");
  const [verifyAttempt, setVerifyAttempt]   = useState(0);

  // ── Save booking to MongoDB exactly once after successful payment ─────────
  const savedRef = useRef(false);

  // ── Step 1: Call GetTransactionCode with retry logic ─────────────────────
  // AstroVed's backend may take a few seconds to register the payment,
  // so we retry up to 3 times with a 3-second delay between each attempt.
  useEffect(() => {
    if (paymentId === "N/A" || !shoppingCartId || shoppingCartId === "N/A") {
      setVerifyStatus("error");
      return;
    }

    let cancelled = false;
    const MAX_ATTEMPTS = 3;
    const RETRY_DELAY_MS = 3000;

    async function verifyWithAstroved(attempt: number) {
      try {
        const res = await fetch(
          `/api/payment/get-transaction-code?orderId=${encodeURIComponent(shoppingCartId)}`
        );
        const data = await res.json();

        if (cancelled) return;

        if (data.StatusCode === 200 && data.TransactionId) {
          // ✅ Verified — AstroVed confirmed the payment
          setTransactionId(data.TransactionId);
          setVerifyStatus("verified");
          setVerifyAttempt(attempt);
        } else if (data.StatusCode === 404 && attempt < MAX_ATTEMPTS) {
          // Payment not registered yet — retry after delay
          setVerifyAttempt(attempt);
          setTimeout(() => {
            if (!cancelled) verifyWithAstroved(attempt + 1);
          }, RETRY_DELAY_MS);
        } else {
          // Either max retries hit or unexpected error
          setVerifyStatus(data.StatusCode === 404 ? "not_found" : "error");
          setVerifyAttempt(attempt);
        }
      } catch {
        if (!cancelled) setVerifyStatus("error");
      }
    }

    verifyWithAstroved(1);
    return () => { cancelled = true; };
  }, [paymentId, shoppingCartId]);

  // ── Step 2: Save booking to MongoDB once verification resolves ────────────
  useEffect(() => {
    if (savedRef.current) return;
    if (paymentId === "N/A") return;
    // Save as soon as we have the result (verified or not)
    if (verifyStatus === "pending") return;

    savedRef.current = true;
    fetch("/api/bookings/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "puja",
        title,
        amount,
        name,
        orderId: shoppingCartId,
        paymentId,
        // Include AstroVed's confirmed transaction ID if available
        transactionId: transactionId || null,
        verificationStatus: verifyStatus,
      }),
    }).catch(console.error);
  }, [verifyStatus, paymentId, transactionId, title, amount, name, shoppingCartId]);

  const [shareUrl, setShareUrl] = useState("");
  useEffect(() => { setShareUrl(window.location.href); }, []);

  const shareText = encodeURIComponent(`I just booked "${title}" on AstroVed! 🙏`);



  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Navbar />
      {/* Hide footer on success page */}
      <style>{`footer, [data-global-chrome="assistant"] { display: none !important; }`}</style>

      <div className="mx-auto max-w-4xl px-4 py-12 space-y-8">

        {/* ── Main Congratulations Card ─────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Top green banner */}
          <div className="bg-gradient-to-r from-[#59a031] to-[#71bf44] px-6 py-5 text-center">
            <div className="flex items-center justify-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white shrink-0">
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                  <path
                    d="M4 10.5 7.5 14 16 6"
                    stroke="#59a031"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <p className="text-white font-semibold text-lg">
                Congratulations!{name ? ` ${name}` : ""} Your Transaction was Successful
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100 border-b border-gray-100 border-dashed border-b-2">
            {/* Left: Thank you message */}
            <div className="px-8 py-8 space-y-4">
              <p className="text-[13px] text-gray-700 leading-relaxed font-medium">
                If you have any questions or comments to share, feel free to{" "}
                <Link href="/contact" className="text-[#e66a1f] hover:underline">
                  Contact Us
                </Link>.
              </p>
              <p className="text-[13px] text-gray-700 leading-relaxed font-medium">
                We thank you once again for the valuable orders you placed with AstroVed.com.
              </p>
              <p className="text-[13px] text-gray-700 leading-relaxed mt-4">
                <span className="font-bold text-gray-800">Note:</span> We request you to contact us with the Transaction Number and Order ID for further clarifications.
              </p>


            </div>

            {/* Right: Order details + buttons */}
            <div className="px-8 py-8 space-y-5 bg-gray-50/30">
              <div className="space-y-2">
                <p className="text-[13px] text-gray-700 font-medium">
                  Razorpay Payment ID :{" "}
                  <span className="font-bold text-[#e66a1f] font-mono">{displayPayId}</span>
                </p>
                <p className="text-[13px] text-gray-700 font-medium">
                  Order Number :{" "}
                  <span className="font-bold text-[#e66a1f]">{displayOrdId}</span>
                </p>

              </div>

              <div className="space-y-2.5 mt-6">
                <Link
                  href="/dashboard"
                  className="w-full flex items-center justify-center bg-[#e66a1f] hover:bg-[#d55f18] text-white font-bold text-[13px] py-2.5 px-4 rounded transition-colors text-center"
                >
                  Click Here To View Your Wallet Balance
                </Link>
                <Link
                  href="/bookings/puja"
                  className="w-full flex items-center justify-center bg-[#e66a1f] hover:bg-[#d55f18] text-white font-bold text-[13px] py-2.5 px-4 rounded transition-colors text-center"
                >
                  Click Here To View Your Order Log and Status
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Puja Share Card ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 border-dashed border-t-0 border-x-0 pb-8 shadow-sm p-8 mt-4">
          <p className="text-sm text-gray-500 mb-4">
            I just bought <span className="font-bold text-[#3b82f6]">{title}</span>
          </p>
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Placeholder Puja image */}
            <div className="w-[180px] h-[180px] rounded overflow-hidden bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shrink-0 shadow-sm border border-gray-200">
              <i className="fa-solid fa-om text-white text-6xl"></i>
            </div>

            <div className="flex-1 space-y-5">
              <p className="text-[13px] text-gray-800 leading-relaxed font-bold">
                You may think, dream,  im agine, and hope to be a thousand things, but the Sun is what you are! To be your best self in terms of your Sun, cause your energies to work along the path in which they will have maximum help from the planetary vibrations.
              </p>
              <div className="flex items-center gap-3 flex-wrap pt-2">
                <span className="text-[13px] font-bold text-gray-400">Share this</span>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${shareText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-[#d97736] text-white text-[10px] font-bold px-3 py-1.5 rounded-sm hover:bg-[#c66629] transition-colors"
                >
                  <i className="fa-brands fa-facebook-f text-white/90"></i> FACEBOOK
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${shareText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-[#f58d04] text-white text-[10px] font-bold px-3 py-1.5 rounded-sm hover:bg-[#df7d03] transition-colors"
                >
                  <i className="fa-brands fa-twitter text-white/90"></i> TWITTER
                </a>
                <a
                  href={`mailto:?subject=I booked a Puja on AstroVed!&body=${decodeURIComponent(shareText)}`}
                  className="flex items-center gap-1.5 bg-[#e66a1f] text-white text-[10px] font-bold px-3 py-1.5 rounded-sm hover:bg-[#d55f18] transition-colors"
                >
                  <i className="fa-regular fa-envelope text-white/90"></i> EMAIL
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── Top Sellers CTA ───────────────────────────────────────────────── */}
        <div className="text-center pt-4">
          <Link
            href="/puja"
            className="inline-block bg-[#5a8cd6] hover:bg-[#4b7cc4] text-white font-medium text-sm px-16 py-3 rounded-sm uppercase tracking-wide transition-colors shadow-sm"
          >
            TOP SELLERS
          </Link>
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
