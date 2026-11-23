"use client";

import React, { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Check,
  Copy,
  FileText,
  Home,
  PlayCircle,
  Gift,
  MapPin,
  X,
  Phone,
  User,
  CheckCircle2,
  Truck,
  Sparkles,
  Globe,
  Loader2,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { clearUtmAttribution } from "@/lib/utmTracker";
import { useUser } from "@/contexts/UserContext";
import { getAuthToken } from "@/services/api";

type StatusState = "loading" | "pending" | "paid" | "failed" | "timeout" | "not_found";

interface DeliveryAddress {
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  country?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
}

interface OrderStatusData {
  paymentStatus: string;
  orderStatus: string;
  orderNumber?: string;
  itemName?: string;
  amount?: number;
  serviceType?: string;
  isHoma?: boolean;
  deliveryAddress?: DeliveryAddress | null;
  hasDeliveryAddress?: boolean;
}

interface AstrovedCity {
  City: string;
  StateorProvince: string;
  Country: string;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const razorpayOrderId = searchParams?.get("razorpayOrderId") || searchParams?.get("orderId") || "";

  const { user, setUser } = useUser();

  const [statusState, setStatusState] = useState<StatusState>(() => {
    return !razorpayOrderId ? "not_found" : "loading";
  });
  const [orderData, setOrderData] = useState<OrderStatusData | null>(null);

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [hasDismissedModal, setHasDismissedModal] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressSuccessToast, setAddressSuccessToast] = useState(false);

  // Address Form State (Country default to India)
  const [formData, setFormData] = useState<DeliveryAddress>({
    fullName: "",
    phone: "",
    country: "India",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
  });

  // AstroVed City auto-suggest state
  const [citySuggestions, setCitySuggestions] = useState<AstrovedCity[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const cityInputRef = useRef<HTMLDivElement>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cityInputRef.current && !cityInputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Poll Order status
  useEffect(() => {
    if (!razorpayOrderId) {
      return;
    }

    let isMounted = true;
    let timer: NodeJS.Timeout;
    const startTime = Date.now();
    const maxPollMs = 60 * 1000; // 60 seconds max

    const checkStatus = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/orders/status?razorpayOrderId=${encodeURIComponent(razorpayOrderId)}`);
        if (!isMounted) return;

        if (res.status === 404) {
          if (Date.now() - startTime < maxPollMs) {
            timer = setTimeout(checkStatus, 3000);
          } else {
            setStatusState("not_found");
          }
          return;
        }

        const data = await res.json();
        if (data.success && data.data) {
          const ord = data.data as OrderStatusData;
          setOrderData(ord);
          const payStatus = ord.paymentStatus;

          if (payStatus === "paid") {
            setStatusState("paid");

            // Populate form defaults if order or user has existing address
            if (ord.deliveryAddress) {
              setFormData((prev) => ({
                ...prev,
                fullName: ord.deliveryAddress?.fullName || prev.fullName,
                phone: ord.deliveryAddress?.phone || prev.phone,
                country: ord.deliveryAddress?.country || "India",
                addressLine1: ord.deliveryAddress?.addressLine1 || prev.addressLine1,
                addressLine2: ord.deliveryAddress?.addressLine2 || prev.addressLine2,
                city: ord.deliveryAddress?.city || prev.city,
                state: ord.deliveryAddress?.state || prev.state,
                pincode: ord.deliveryAddress?.pincode || prev.pincode,
                landmark: ord.deliveryAddress?.landmark || prev.landmark,
              }));
            } else if (user) {
              const defaultAddr = (user.addresses || []).find((a: any) => a.isDefault) || (user.addresses || [])[0];
              if (defaultAddr) {
                setFormData((prev) => ({
                  ...prev,
                  fullName: defaultAddr.name || user.name || prev.fullName,
                  phone: defaultAddr.phone || user.mobileNumber || user.whatsappNumber || prev.phone,
                  country: defaultAddr.country || "India",
                  addressLine1: defaultAddr.addressLine1 || prev.addressLine1,
                  addressLine2: defaultAddr.addressLine2 || defaultAddr.landmark || prev.addressLine2,
                  city: defaultAddr.city || prev.city,
                  state: defaultAddr.state || prev.state,
                  pincode: defaultAddr.pincode || prev.pincode,
                  landmark: defaultAddr.landmark || prev.landmark,
                }));
              } else {
                setFormData((prev) => ({
                  ...prev,
                  fullName: user.name || prev.fullName,
                  phone: user.mobileNumber || user.whatsappNumber || prev.phone,
                }));
              }
            }

            // If it is a HOMA and no delivery address is saved, trigger modal
            const isHomaOrder = Boolean(
              ord.isHoma ||
              ord.serviceType?.toLowerCase() === "homa" ||
              ord.itemName?.toLowerCase().includes("homa")
            );

            if (isHomaOrder && !ord.hasDeliveryAddress && !hasDismissedModal) {
              setIsAddressModalOpen(true);
            }

            // GTM analytics
            try {
              if (typeof window !== "undefined") {
                const w = window as any;
                w.dataLayer = w.dataLayer || [];
                const orderVal = Number(ord.amount ?? 0);
                const orderNum = String(ord.orderNumber || razorpayOrderId);

                w.dataLayer.push({
                  event: "purchase",
                  ecommerce: {
                    transaction_id: orderNum,
                    value: orderVal,
                    currency: "INR",
                    items: [
                      {
                        item_name: ord.itemName || "Puja Service",
                        price: orderVal,
                        quantity: 1,
                      },
                    ],
                  },
                  value: orderVal,
                  currency: "INR",
                  order_id: orderNum,
                });

                if (typeof w.fbq === "function") {
                  w.fbq("track", "Purchase", {
                    value: orderVal,
                    currency: "INR",
                    content_name: ord.itemName || "Puja Service",
                    order_id: orderNum,
                  });
                }
              }
            } catch (err) {
              console.warn("[SuccessPage] Error emitting purchase analytics:", err);
            }

            clearUtmAttribution();
            return;
          } else if (payStatus === "failed") {
            setStatusState("failed");
            return;
          } else {
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
  }, [razorpayOrderId, hasDismissedModal, user, baseUrl]);

  // AstroVed City Search with 300ms Debounce
  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setFormData((prev) => ({ ...prev, city: query }));

    if (query.trim().length >= 3) {
      setLoadingSuggestions(true);
      setShowSuggestions(true);

      const countryParam = formData.country || "India";
      const apiUrl = `https://webservice.astroved.com/Api/Panchang/PopulateCityBycountry/${encodeURIComponent(countryParam)}/${encodeURIComponent(query.trim())}`;

      fetch(apiUrl)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            // Deduplicate cities by City + State
            const seen = new Set();
            const unique = data.filter((item: AstrovedCity) => {
              const key = `${item.City}-${item.StateorProvince}`.toLowerCase();
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
            setCitySuggestions(unique.slice(0, 8));
          } else {
            setCitySuggestions([]);
          }
        })
        .catch((err) => {
          console.error("AstroVed City API error:", err);
          setCitySuggestions([]);
        })
        .finally(() => {
          setLoadingSuggestions(false);
        });
    } else {
      setCitySuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Select City suggestion -> Auto fill City & State
  const handleSelectCity = (suggestion: AstrovedCity) => {
    setFormData((prev) => ({
      ...prev,
      city: suggestion.City,
      state: suggestion.StateorProvince || prev.state,
      country: suggestion.Country || prev.country || "India",
    }));
    setShowSuggestions(false);
  };

  // Save via /api/users/updateProfile ONLY
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.addressLine1?.trim() || !formData.pincode?.trim()) {
      alert("Please provide at least your street address and pincode.");
      return;
    }

    setSavingAddress(true);
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Format new address according to user.addresses schema
      const newAddressItem = {
        type: "Home",
        name: (formData.fullName || user?.name || "Devotee").trim(),
        phone: (formData.phone || user?.mobileNumber || user?.whatsappNumber || "").trim(),
        addressLine1: formData.addressLine1.trim(),
        addressLine2: (formData.addressLine2 || formData.landmark || "").trim(),
        city: (formData.city || "").trim(),
        state: (formData.state || "").trim(),
        pincode: (formData.pincode || "").trim(),
        country: (formData.country || "India").trim(),
        landmark: (formData.landmark || "").trim(),
        isDefault: true,
      };

      // Set existing addresses to non-default
      const existingAddresses = (user?.addresses || []).map((a: any) => ({
        ...a,
        isDefault: false,
      }));

      // Prepend or add new default address
      const updatedAddresses = [newAddressItem, ...existingAddresses];

      const payload = {
        userId: user?._id || user?.id,
        name: user?.name || formData.fullName,
        mobileNumber: user?.mobileNumber || formData.phone,
        addresses: updatedAddresses,
      };

      const res = await fetch(`${baseUrl}/api/users/updateProfile`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success && result.data) {
        // Update user state so My Account immediately reflects it
        if (setUser) {
          setUser((prev) => ({
            ...(prev || {}),
            ...result.data,
            addresses: updatedAddresses,
          }));
        }

        // Update local orderData view
        setOrderData((prev) =>
          prev
            ? {
                ...prev,
                deliveryAddress: newAddressItem,
                hasDeliveryAddress: true,
              }
            : null
        );

        setIsAddressModalOpen(false);
        setAddressSuccessToast(true);
        setTimeout(() => setAddressSuccessToast(false), 4500);
      } else {
        alert(result.message || "Failed to save address to profile.");
      }
    } catch (err) {
      console.error("Save profile address error:", err);
      alert("An error occurred while saving your address. Please try again.");
    } finally {
      setSavingAddress(false);
    }
  };

  // Derived state values from server only
  const displayTitle = orderData?.itemName || "Puja Seva";
  const displayAmount = orderData?.amount !== undefined ? String(orderData.amount) : "0";
  const displayOrderNumber = orderData?.orderNumber || razorpayOrderId;
  const isHoma = Boolean(
    orderData?.isHoma ||
    orderData?.serviceType?.toLowerCase() === "homa" ||
    orderData?.itemName?.toLowerCase().includes("homa")
  );

  // View: Pending / Confirming state
  if (statusState === "loading" || statusState === "pending") {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <style>{`footer, [data-global-chrome="assistant"] { display: none !important; }`}</style>
        <div className="mx-auto max-w-xl px-4 py-24 flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 rounded-full border-4 border-amber-400/30 border-t-amber-500 animate-spin flex items-center justify-center">
            <span className="text-2xl">🕉️</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif text-stone-900">Confirming Your Sacred Booking...</h1>
          <p className="text-stone-500 text-sm max-w-sm">
            We are verifying your transaction with the bank and preparing your booking confirmation.
          </p>
        </div>
      </div>
    );
  }

  // View: Failed state
  if (statusState === "failed") {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <style>{`footer, [data-global-chrome="assistant"] { display: none !important; }`}</style>
        <div className="mx-auto max-w-xl px-4 py-24 flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-2xl font-bold">
            ✕
          </div>
          <h1 className="text-2xl md:text-3xl font-serif text-stone-900">Payment Unsuccessful</h1>
          <p className="text-stone-500 text-sm max-w-sm">
            Your payment could not be processed. If money was debited from your account, it will automatically refund within 5–7 business days.
          </p>
          <div className="pt-4 flex gap-4">
            <Link
              href="/"
              className="bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm px-6 py-3 rounded-xl transition"
            >
              Try Again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // View: Timeout / Not found
  if (statusState === "timeout" || statusState === "not_found") {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <style>{`footer, [data-global-chrome="assistant"] { display: none !important; }`}</style>
        <div className="mx-auto max-w-xl px-4 py-24 flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-2xl font-bold">
            !
          </div>
          <h1 className="text-2xl md:text-3xl font-serif text-stone-900">Order Verification Taking Longer</h1>
          <p className="text-stone-500 text-sm max-w-sm">
            We received your payment request. Your booking confirmation and WhatsApp updates will arrive shortly.
          </p>
          <div className="pt-4 flex gap-4">
            <Link
              href="/account?tab=bookings"
              className="bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm px-6 py-3 rounded-xl transition"
            >
              Check My Bookings
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

      {/* ── Toast for Address Submission ─────────────────────────────── */}
      {addressSuccessToast && (
        <div className="fixed top-20 right-5 z-50 bg-emerald-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="text-xs font-bold">Address Saved to My Account!</p>
            <p className="text-[11px] text-emerald-200">Prasadam will be dispatched to your postal address.</p>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 py-16 space-y-10 flex flex-col items-center">
        {/* ── Top Success Indicator ─────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center border-8 border-green-50/50 mb-2">
            <div className="w-16 h-16 rounded-full bg-[#1e9e4a] flex items-center justify-center shadow-lg">
              <Check className="w-8 h-8 text-white" strokeWidth={3} />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-stone-900 mb-1">
            {isHoma ? "Homa Booking Successful" : "Booking Successful"}
          </h1>
          <p className="text-stone-500 text-sm max-w-md mx-auto">
            {isHoma
              ? "Your sacred Homa is booked. Our verified priests will prepare your sankalpam and invoke divine blessings at the temple. 🙏"
              : "Your sacred puja is booked. Our Pandits will begin the preparations — blessings are on their way to you. 🙏"}
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-stone-500 bg-stone-50 px-4 py-2 rounded-full border border-stone-100">
            <Copy className="w-4 h-4 text-stone-400" />
            Booking ID <span className="text-[#f15a29] font-mono">{displayOrderNumber}</span>
          </div>
        </div>

        {/* ── HOMA PRASADAM DELIVERY ADDRESS CARD (Only for Homas) ───────────────── */}
        {isHoma && (
          <div className="w-full bg-gradient-to-br from-amber-50/70 via-[#FFF9F2] to-emerald-50/40 border-2 border-amber-200/80 rounded-3xl p-6 sm:p-7 shadow-xs relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Gift className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-black text-stone-900 text-base sm:text-lg">
                      Sacred Prasad &amp; Raksha Ash Delivery
                    </h3>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Included
                    </span>
                  </div>
                  <p className="text-stone-600 text-xs sm:text-[13px] font-medium mt-1 leading-relaxed max-w-xl">
                    In this homa, sanctified prasad and energized sacred ash will be delivered directly to your doorstep by courier.
                  </p>

                  {/* Confirmed Address Preview */}
                  {orderData?.hasDeliveryAddress && orderData.deliveryAddress ? (
                    <div className="mt-3.5 bg-white/95 border border-amber-200 rounded-xl p-3 text-xs text-stone-700 space-y-0.5">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Delivery Address Confirmed</span>
                      </div>
                      <p className="font-semibold text-stone-900 pt-1">
                        {orderData.deliveryAddress.fullName || "Devotee"} ({orderData.deliveryAddress.phone})
                      </p>
                      <p className="text-stone-600">
                        {orderData.deliveryAddress.addressLine1}
                        {orderData.deliveryAddress.addressLine2 ? `, ${orderData.deliveryAddress.addressLine2}` : ""}
                        , {orderData.deliveryAddress.city}, {orderData.deliveryAddress.state} - {orderData.deliveryAddress.pincode}
                        {orderData.deliveryAddress.country ? ` (${orderData.deliveryAddress.country})` : ""}
                      </p>
                      {orderData.deliveryAddress.landmark && (
                        <p className="text-stone-400 text-[11px]">Landmark: {orderData.deliveryAddress.landmark}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-amber-800 text-xs font-semibold mt-2 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                      Please submit your delivery address so we can ship the prasadam.
                    </p>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(true)}
                className="w-full sm:w-auto shrink-0 bg-gradient-to-r from-[#00B05F] to-[#009644] hover:from-[#009644] hover:to-[#007A37] text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MapPin className="w-4 h-4" />
                <span>{orderData?.hasDeliveryAddress ? "Update Address" : "Enter Delivery Address"}</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Order Summary Card ─────────────────────────────────────── */}
        <div className="w-full bg-white rounded-3xl border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8">
          <div className="flex justify-between items-start mb-6 pb-6 border-b border-stone-100 border-dashed">
            <div>
              <h2 className="text-lg font-bold text-stone-900">{displayTitle}</h2>
              {isHoma && (
                <span className="inline-block mt-1 text-[11px] font-extrabold text-[#E65100] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/60 uppercase tracking-wide">
                  Sacred Homa
                </span>
              )}
            </div>
            <div className="text-right">
              <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-1">Amount Paid</p>
              <p className="text-xl font-black text-success">₹{displayAmount}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-extrabold text-stone-900 mb-4">
              {isHoma ? "Homa Inclusions" : "Puja Inclusions"}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-stone-600 font-medium">
                <span className="text-[#f15a29] mt-1 shrink-0 text-xs">◆</span>
                A complete video recording of the ritual will be sent to your WhatsApp within 48 hours.
              </li>
              <li className="flex items-start gap-2.5 text-sm text-stone-600 font-medium">
                <span className="text-[#f15a29] mt-1 shrink-0 text-xs">◆</span>
                A personalized Sankalp taken using your name and Gotra.
              </li>
              {isHoma ? (
                <li className="flex items-start gap-2.5 text-sm text-stone-600 font-medium">
                  <span className="text-[#f15a29] mt-1 shrink-0 text-xs">◆</span>
                  Sanctified Homa Raksha and blessed Prasadam couriered to your home.
                </li>
              ) : (
                <li className="flex items-start gap-2.5 text-sm text-stone-600 font-medium">
                  <span className="text-[#f15a29] mt-1 shrink-0 text-xs">◆</span>
                  Puja is a ritualistic worship performed to seek divine blessings.
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* ── Timeline ─────────────────────────────────────── */}
        <div className="w-full max-w-md mx-auto pt-4 relative">
          <div className="absolute left-[19px] top-4 bottom-8 w-px bg-[#f15a29]/20 z-0"></div>

          <div className="relative z-10 flex gap-4 mb-8">
            <div className="w-10 h-10 rounded-full bg-white border-2 border-[#f15a29] flex items-center justify-center shrink-0 shadow-sm">
              <FileText className="w-4 h-4 text-[#f15a29]" strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">Sankalpam prepared</h4>
              <p className="text-xs text-stone-500 mt-1 font-medium leading-relaxed">
                Our purohit prepares your sankalpam using the devotee names and gotra you provided.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex gap-4 mb-8">
            <div className="w-10 h-10 rounded-full bg-white border-2 border-[#f15a29] flex items-center justify-center shrink-0 shadow-sm">
              <Home className="w-4 h-4 text-[#f15a29]" strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">
                {isHoma ? "Homa performed at the temple" : "Puja performed at the temple"}
              </h4>
              <p className="text-xs text-stone-500 mt-1 font-medium leading-relaxed">
                Your ritual is performed live by verified Pandits at the sacred temple.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-white border-2 border-[#f15a29] flex items-center justify-center shrink-0 shadow-sm">
              <PlayCircle className="w-4 h-4 text-[#f15a29]" strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">Video &amp; Prasad delivered</h4>
              <p className="text-xs text-stone-500 mt-1 font-medium leading-relaxed">
                {isHoma
                  ? "Your video arrives on WhatsApp and sacred prasad is couriered to your address."
                  : "Your puja video arrives on WhatsApp within 24 hours."}
              </p>
            </div>
          </div>
        </div>

        {/* ── Action Buttons ─────────────────────────────────────── */}
        <div className="pt-4 flex flex-col items-center space-y-4 w-full">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-4 w-full max-w-md sm:max-w-none px-2 sm:px-0">
            <Link
              href="/account?tab=address"
              className="bg-success hover:bg-[#009644] text-white font-extrabold text-xs sm:text-sm px-4 sm:px-8 py-3 sm:py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-center"
            >
              <MapPin className="w-4 h-4 shrink-0" />
              <span>View Saved Addresses</span>
            </Link>
            <Link
              href="/"
              className="bg-white border-2 border-stone-200 text-stone-700 hover:border-stone-300 hover:bg-stone-50 font-extrabold text-xs sm:text-sm px-4 sm:px-8 py-3 sm:py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-center"
            >
              <Home className="w-4 h-4 text-stone-500 shrink-0" strokeWidth={2.5} />
              <span>Back to Home</span>
            </Link>
          </div>

          <p className="text-[11px] sm:text-xs font-bold text-success flex items-center justify-center text-center gap-1.5 mt-2 sm:mt-4">
            <i className="fa-brands fa-whatsapp text-sm text-[#25D366]"></i>
            <span>A confirmation has been sent to your WhatsApp.</span>
          </p>
        </div>
      </div>

      {/* ── PRASADAM DELIVERY ADDRESS MODAL (Homa Only) ───────────────── */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-100 overflow-hidden max-h-[92vh] sm:max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-600 via-[#E65100] to-orange-600 p-4 sm:p-6 text-white relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsAddressModalOpen(false);
                  setHasDismissedModal(true);
                }}
                className="absolute top-3.5 right-3.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <div className="flex items-center gap-2.5 sm:gap-3 mb-1.5 sm:mb-2 pr-8">
                <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-serif font-black text-base sm:text-lg text-white leading-tight truncate">
                    Prasad Delivery Address
                  </h3>
                  <span className="text-[10px] sm:text-[11px] text-amber-100 font-semibold uppercase tracking-wider block">
                    Sacred Homa Raksha &amp; Prasad
                  </span>
                </div>
              </div>

              <p className="text-[11px] sm:text-xs text-amber-50 leading-relaxed font-medium">
                Your booking is successful! In this homa, our priests will send sanctified prasad and raksha ash to your doorstep. Please share your delivery address:
              </p>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveAddress} className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
              {/* Country Selection (Default India) */}
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-stone-700 mb-1">
                  Country <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={formData.country || "India"}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Country (e.g. India)"
                    className="w-full text-xs font-medium pl-8 sm:pl-9 pr-3 py-2 sm:py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-[#00B05F] focus:ring-1 focus:ring-[#00B05F]"
                  />
                </div>
              </div>

              {/* Recipient Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-stone-700 mb-1">
                    Recipient Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Sharma"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full text-xs font-medium pl-8 sm:pl-9 pr-3 py-2 sm:py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-[#00B05F] focus:ring-1 focus:ring-[#00B05F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-stone-700 mb-1">
                    Delivery Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full text-xs font-medium pl-8 sm:pl-9 pr-3 py-2 sm:py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-[#00B05F] focus:ring-1 focus:ring-[#00B05F]"
                    />
                  </div>
                </div>
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-stone-700 mb-1">
                  Flat / House No., Building, Street <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 102, Gokul Dham Apartments, 4th Main"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  className="w-full text-xs font-medium px-3 py-2 sm:py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-[#00B05F] focus:ring-1 focus:ring-[#00B05F]"
                />
              </div>

              {/* Address Line 2 */}
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-stone-700 mb-1">
                  Area, Colony, Sector (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Indiranagar, Near BDA Complex"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                  className="w-full text-xs font-medium px-3 py-2 sm:py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-[#00B05F] focus:ring-1 focus:ring-[#00B05F]"
                />
              </div>

              {/* City with AstroVed Suggestion Dropdown & State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {/* City with Auto-suggest */}
                <div className="relative" ref={cityInputRef}>
                  <label className="block text-[11px] sm:text-xs font-bold text-stone-700 mb-1 flex items-center justify-between">
                    <span>City <span className="text-red-500">*</span></span>
                    {loadingSuggestions && (
                      <span className="text-[10px] text-amber-600 font-normal flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Searching...
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    placeholder="Type 3+ letters (e.g. Chennai)"
                    value={formData.city}
                    onChange={handleCityInputChange}
                    onFocus={() => {
                      if (citySuggestions.length > 0) setShowSuggestions(true);
                    }}
                    className="w-full text-xs font-medium px-3 py-2 sm:py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-[#00B05F] focus:ring-1 focus:ring-[#00B05F]"
                  />

                  {/* AstroVed City Auto-suggest Dropdown */}
                  {showSuggestions && citySuggestions.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-stone-200 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-stone-100">
                      {citySuggestions.map((item, idx) => (
                        <button
                          key={`${item.City}-${item.StateorProvince}-${idx}`}
                          type="button"
                          onClick={() => handleSelectCity(item)}
                          className="w-full text-left px-3 py-2 hover:bg-emerald-50 text-xs transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <span className="font-bold text-stone-800">{item.City}</span>
                          <span className="text-[10.5px] font-medium text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-200/50">
                            {item.StateorProvince}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* State (Auto-populated from AstroVed City) */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-stone-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="State (e.g. Tamil Nadu)"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full text-xs font-medium px-3 py-2 sm:py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-[#00B05F] focus:ring-1 focus:ring-[#00B05F]"
                  />
                </div>
              </div>

              {/* Pincode & Landmark */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-stone-700 mb-1">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="6-digit pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full text-xs font-medium px-3 py-2 sm:py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-[#00B05F] focus:ring-1 focus:ring-[#00B05F]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-stone-700 mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Opposite Shiva Temple"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    className="w-full text-xs font-medium px-3 py-2 sm:py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-[#00B05F] focus:ring-1 focus:ring-[#00B05F]"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 sm:pt-3 flex flex-row items-center justify-between gap-2 sm:gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddressModalOpen(false);
                    setHasDismissedModal(true);
                  }}
                  className="px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl text-stone-500 hover:bg-stone-100 text-[11px] sm:text-xs font-bold transition text-left shrink-0"
                >
                  I&apos;ll add later
                </button>

                <button
                  type="submit"
                  disabled={savingAddress}
                  className="bg-[#00B05F] hover:bg-[#009644] text-white px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold text-[11px] sm:text-xs shadow-md transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer disabled:opacity-50"
                >
                  {savingAddress ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                      <span>Save Address &amp; Confirm</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
