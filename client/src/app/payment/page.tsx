"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
}

interface CustomWindow extends Window {
  Razorpay: new (options: Record<string, unknown>) => RazorpayInstance;
}

function PaymentContent() {
  const searchParams = useSearchParams();

  const amount = searchParams?.get("amount") || "0";
  const title = searchParams?.get("title") || "astroved Puja";
  const name = searchParams?.get("name") || "";
  const wa = searchParams?.get("wa") || "";
  const shoppingCartId = searchParams?.get("shoppingCartId") || "";

  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProceedViaRazorpay = async () => {
    setIsProcessing(true);
    setError(null);
    setLoadingMsg("Initializing secure payment gateway...");
    try {
      // 1. Get auth details from cookie
      let authData: any = {};
      if (typeof window !== "undefined") {
        const stored = document.cookie.includes("userLogin=true");
        if (stored) {
          const sessionUser = sessionStorage.getItem("user");
          if (sessionUser) {
            try { authData = { user: JSON.parse(sessionUser) }; } catch { authData = { user: {} }; }
          } else {
            authData = { user: {} };
          }
        }
      }
      const userName = name || authData?.user?.name || authData?.data?.name || "";
      const userEmail = authData?.user?.email || authData?.data?.email || "";
      const userPhone = wa || authData?.user?.whatsapp || authData?.user?.phone || authData?.data?.mobileNumber || "";
      const customerId = authData?.user?.customerId || authData?.data?.customerId || 0;

      // Split name into first and last
      const nameParts = userName.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://priest-service.onrender.com";

      // 2. Call local Express API to create order
      setLoadingMsg("Creating order securely...");
      const orderRes = await fetch(`${baseUrl}/api/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: Number(customerId),
          currencyCode: "INR",
          shoppingCartId: Number(shoppingCartId),
          totalamount: Number(amount),
          contactId: 1367254, // Hardcoded or dynamic
          localeId: 1,
          trackingCode1: "",
          trackingCode2: "",
          shippingpreferred: false,
          contactDetail: {
            CustomerId: Number(customerId) || 1413824,
            FirstName: firstName,
            LastName: lastName,
            ShopName: "AstroVed",
            Street: "",
            City: "",
            State: "",
            Country: "India",
            Pincode: "",
            Phone: userPhone
          }
        })
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.data?.orderId) {
        throw new Error(orderData.message || "Failed to create order.");
      }

      const orderId = orderData.data.orderId;
      const rzpKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || orderData.data.keyId;

      if (!rzpKey) {
        throw new Error("Razorpay Key ID is missing. Add NEXT_PUBLIC_RAZORPAY_KEY_ID to .env.local.");
      }

      // 3. Initialize Razorpay Checkout
      setLoadingMsg("Opening Razorpay...");

      const options: Record<string, unknown> = {
        key: rzpKey,
        name: "AstroVed",
        description: title,
        order_id: orderId,
        image: "https://www.astroved.com/Images/astroved-logo.jpg",
        prefill: {
          name: userName,
          contact: userPhone,
          email: userEmail
        },
        theme: {
          color: "#4e89df",
          image_padding: false
        },
        readonly: {
          name: true,
          contact: true,
          email: true,
        },
        handler: async function (response: RazorpayResponse) {
          setLoadingMsg("Verifying payment...");
          try {
            const verifyRes = await fetch(`${baseUrl}/api/payments/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              const params = new URLSearchParams({
                paymentId: response.razorpay_payment_id,
                orderId: orderId,
                title,
                amount,
                name: userName
              });
              window.location.href = `/payment/success?${params.toString()}`;
            } else {
              setError("Payment verification failed.");
            }
          } catch {
            setError("Error verifying payment.");
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setLoadingMsg("");
            console.log("This code runs when the popup is closed");
          },
          escape: true,
          backdropclose: false
        }
      };

      // Load the script dynamically
      const loadRazorpayScript = () => {
        return new Promise((resolve) => {
          if (typeof window !== "undefined" && (window as unknown as CustomWindow).Razorpay) {
            resolve(true);
            return;
          }
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || !(window as unknown as CustomWindow).Razorpay) {
        throw new Error("Razorpay SDK failed to load. Please check your connection.");
      }

      const rzp = new (window as unknown as CustomWindow).Razorpay(options);
      rzp.open();

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "An error occurred during payment initialization");
      } else {
        setError("An error occurred during payment initialization");
      }
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 p-8 text-center">
        <div className="mb-8 flex justify-center">
          <div className="h-20 w-20 bg-green-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#00b050]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">Complete Your Booking</h2>
        <p className="text-stone-500 mb-8 font-medium">{title}</p>

        <div className="bg-stone-50 rounded-2xl p-6 mb-8 border border-stone-200/60">
          <div className="flex justify-between items-center mb-4">
            <span className="text-stone-600 font-medium">Total Amount</span>
            <span className="text-3xl font-bold text-stone-900">₹{amount}</span>
          </div>
          <div className="h-px bg-stone-200/60 w-full mb-4"></div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-stone-500">Devotee</span>
            <span className="text-stone-800 font-semibold">{name || "Guest"}</span>
          </div>
        </div>

        {!error ? (
          <>
            {isProcessing ? (
              <div className="flex flex-col items-center">
                <p className="text-sm text-stone-500 mb-4 font-medium animate-pulse">{loadingMsg}</p>
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00b050]"></div>
              </div>
            ) : (
              <button
                onClick={handleProceedViaRazorpay}
                id="btnProceedviaRazorpay"
                className="w-full bg-[#00b050] hover:bg-[#009644] text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3"
              >
                <span>Proceed via Razorpay</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </>
        ) : (
          <>
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">
              {error}
            </div>
            <button
              onClick={() => { setError(null); setIsProcessing(false); }}
              className="w-full px-6 py-3 bg-stone-100 text-stone-700 font-bold rounded-xl hover:bg-stone-200 transition-colors"
            >
              Try Again
            </button>
          </>
        )}

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-stone-400 font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span>100% Secure Payment Powered by Razorpay</span>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00b050]" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
