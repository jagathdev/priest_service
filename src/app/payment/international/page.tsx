"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import USDPaymentModal from "@/components/common/USDPaymentModal";

function InternationalPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const amount = searchParams?.get("amount") || "0";
  const title = searchParams?.get("title") || "AstroVed Puja";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    // Validate that we have the required params
    if (!amount || amount === "0") {
      setInitError("Invalid payment session. Please go back and try again.");
      return;
    }

    // Small delay to mimic the "Initializing secure payment..." UX from the Indian flow
    const timer = setTimeout(() => {
      setIsModalOpen(true);
    }, 800);

    return () => clearTimeout(timer);
  }, [amount]);

  const handleModalClose = () => {
    // When user closes the modal, go back to the previous page (sankalp)
    router.back();
  };

  if (initError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-triangle-exclamation text-2xl text-red-500"></i>
            </div>
          </div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Payment Initialisation Failed</h2>
          <p className="text-sm text-gray-600 mb-8">{initError}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Loading screen — mirrors /payment page UX */}
      <div className={`max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center transition-opacity duration-300 ${isModalOpen ? 'opacity-0' : 'opacity-100'}`}>
        <div className="mb-6 flex justify-center">
          <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-[#615BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Secure Checkout</h2>
        <p className="text-sm text-gray-500 mb-8">Initializing secure international payment gateway...</p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#615BFF]" />
        </div>
      </div>

      {/* USD Payment Modal — auto-opens after short delay */}
      <USDPaymentModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        amount={amount}
        title={title}
      />
    </div>
  );
}

export default function InternationalPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#615BFF]" />
        </div>
      }
    >
      <InternationalPaymentContent />
    </Suspense>
  );
}
