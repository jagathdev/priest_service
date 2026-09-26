"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const amount = searchParams?.get("amount") || "0";
  const title = searchParams?.get("title") || "AstroVed Puja";
  const name = searchParams?.get("name") || "";
  const wa = searchParams?.get("wa") || "";
  const shoppingCartIdParam = searchParams?.get("shoppingCartId") || "";
  const aashirwad = searchParams?.get("aashirwad") || "no";
  const pinCode = searchParams?.get("pinCode") || "";
  const city = searchParams?.get("city") || "";
  const state = searchParams?.get("state") || "";
  const house = searchParams?.get("house") || "";
  const road = searchParams?.get("road") || "";
  const landmark = searchParams?.get("landmark") || "";

  const [loadingMsg, setLoadingMsg] = useState("Initializing secure payment gateway...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initPayment() {
      try {
        // 1. Get current logged-in user customerId
        const authRes = await fetch("/api/auth/me");
        const authData = await authRes.json();
        const customerId = authData?.user?.customerId || "0";
        const userName = name || authData?.user?.name || "";
        const userPhone = wa || authData?.user?.whatsapp || authData?.user?.phone || "";

        // 2. Call Astroved's ProceedviaRazorPay API via our proxy
        setLoadingMsg("Creating order securely...");
        const orderRes = await fetch("/api/payment/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount,
            customerId,
            shoppingCartId: shoppingCartIdParam,
            name: userName,
            phone: userPhone,
            aashirwad,
            pinCode,
            city,
            state,
            house,
            road,
            landmark
          })
        });
        
        const orderData = await orderRes.json();
        
        if (!orderRes.ok || !orderData.orderId) {
          throw new Error(orderData.error || "Failed to create order. Ensure your backend tokens in .env.local are valid.");
        }

        const orderId = orderData.orderId;
        const shoppingCartId = orderData.shoppingCartId;

        // 3. Initialize Razorpay Checkout
        setLoadingMsg("Opening Razorpay...");
        
        const rzpKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        if (!rzpKey) {
           throw new Error("Razorpay Key ID is missing. Add NEXT_PUBLIC_RAZORPAY_KEY_ID to .env.local.");
        }

        // Exactly as specified in the Pooja_Site_Api Documentation-V2
        const options: any = {
          key: rzpKey,
          name: "AstroVed",
          description: title,
          order_id: orderId,
          image: "https://www.astroved.com/Images/astroved-logo.jpg",
          prefill: {
            name: name,
            contact: wa,
          },
          theme: {
            color: "#4e89df"
          },
          readonly: {
            name: true,
            contact: true,
          },
          handler: function (response: any) {
            // Success handler
            const paymentId = response.razorpay_payment_id;
            
            // Redirect to success page
            const params = new URLSearchParams({
              paymentId,
              orderId,
              title,
              amount,
              name,
              shoppingCartId
            });
            window.location.href = `/payment/success?${params.toString()}`;
          },
          modal: {
            ondismiss: function () {
              setError("Payment was cancelled by the user. You can try again.");
            },
            escape: true,
            backdropclose: false
          }
        };

        options.theme.image_padding = false;
        
        // Load the script dynamically to prevent hydration errors
        const loadRazorpayScript = () => {
          return new Promise((resolve) => {
            if (typeof window !== "undefined" && (window as any).Razorpay) {
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
        
        if (!scriptLoaded || !(window as any).Razorpay) {
          setError("Razorpay SDK failed to load. Please check your connection.");
          return;
        }

        const rzp = new (window as any).Razorpay(options);
        rzp.open();

      } catch (err: any) {
        setError(err.message || "An error occurred during payment initialization");
      }
    }

    if (amount) {
      initPayment();
    }
  }, [amount, title, name, wa, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center">
            <i className="fa-solid fa-shield-halved text-2xl text-[#4e89df]"></i>
          </div>
        </div>
        
        {!error ? (
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Secure Checkout</h2>
            <p className="text-sm text-gray-500 mb-8">{loadingMsg}</p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4e89df]"></div>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-red-600 mb-2">Payment Initialisation Failed</h2>
            <p className="text-sm text-gray-600 mb-8">{error}</p>
            <button 
              onClick={() => router.back()}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Go Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4e89df]" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
