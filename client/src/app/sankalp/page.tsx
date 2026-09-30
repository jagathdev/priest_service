"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { checkAuthStatus } from "@/lib/authCheck";
import LoginModal from "@/components/auth/LoginModal";

function SankalpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Query Params preserved from Participate Now click
  const pujaId = searchParams?.get("pujaId") || searchParams?.get("id") || "";
  const slug = searchParams?.get("slug") || "";
  const pkgId = searchParams?.get("pkg") || searchParams?.get("packageId") || "";
  const queryAmount = searchParams?.get("amount") || "";
  const queryTitle = searchParams?.get("title") || "";
  const itemType = searchParams?.get("type") || "puja";

  const [pujaData, setPujaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth check state
  const [isUser, setIsUser] = useState<boolean>(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Devotee details form state
  const [formData, setFormData] = useState({
    whatsapp: searchParams?.get("wa") || "",
    devoteeName: searchParams?.get("name") || "",
    gotra: "",
    dontKnowGotra: false,
    wish: "",
  });

  // 1. Initial auth check (is_user)
  useEffect(() => {
    async function verifyAuth() {
      const { is_user } = await checkAuthStatus();
      setIsUser(is_user);
      if (!is_user) {
        setShowLoginModal(true);
      }
    }
    verifyAuth();
  }, []);

  // 2. Fetch Puja details by preserved Puja ID / Slug
  useEffect(() => {
    async function fetchPujaDetails() {
      if (!pujaId && !slug) {
        setError("No Puja specified for booking.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
      const targetId = pujaId || slug;

      try {
        const endpoint = itemType === "homa" ? `${baseUrl}/api/homas/${targetId}` : `${baseUrl}/api/pujas/${targetId}`;
        const res = await fetch(endpoint);
        const result = await res.json();

        if (res.ok && result?.success && result?.data) {
          setPujaData(result.data);
        } else {
          // Fallback: search all pujas/homas list
          const listEndpoint = itemType === "homa" ? `${baseUrl}/api/homas` : `${baseUrl}/api/pujas`;
          const listRes = await fetch(listEndpoint);
          const listData = await listRes.json();
          const items = Array.isArray(listData) ? listData : listData?.data || [];

          const match = items.find((item: any) =>
            item._id === targetId ||
            item.id === targetId ||
            item.slug === targetId ||
            item.slug === slug
          );

          if (match) {
            setPujaData(match);
          } else {
            // Keep fallback metadata if individual API returns 404
            setPujaData({
              _id: targetId,
              title: queryTitle || (itemType === "homa" ? "Vedic Homa Ritual" : "Sacred Vedic Puja"),
              imageUrl: "/images/Ganesh-Chaturthi-Mahapuja.jpg",
              packages: [],
            });
          }
        }
      } catch (err) {
        console.error("Error fetching Puja details for Order Summary:", err);
        setPujaData({
          _id: targetId,
          title: queryTitle || "Sacred Vedic Ritual",
          imageUrl: "/images/Ganesh-Chaturthi-Mahapuja.jpg",
          packages: [],
        });
      } finally {
        setLoading(false);
      }
    }

    fetchPujaDetails();
  }, [pujaId, slug, itemType, queryTitle]);

  // Determine preserved package & price
  const selectedPackage = React.useMemo(() => {
    if (!pujaData?.packages || !Array.isArray(pujaData.packages)) return null;
    return pujaData.packages.find((p: any) => p.id === pkgId || p._id === pkgId) || pujaData.packages[0] || null;
  }, [pujaData, pkgId]);

  const packageName = selectedPackage?.name || "Standard Seva Package";
  const finalPrice = selectedPackage?.priceINR ?? selectedPackage?.price ?? (queryAmount ? Number(queryAmount) : pujaData?.price || 516);

  const handleProceedToPayment = () => {
    if (!formData.whatsapp.trim()) {
      alert("Please enter a valid WhatsApp number.");
      return;
    }
    if (!formData.devoteeName.trim()) {
      alert("Please enter devotee name for Sankalpam.");
      return;
    }

    const params = new URLSearchParams({
      amount: String(finalPrice),
      title: pujaData?.title || queryTitle || "Sacred Puja",
      name: formData.devoteeName,
      wa: formData.whatsapp,
      pujaId: pujaData?._id || pujaId,
      pkg: pkgId,
      gotra: formData.dontKnowGotra ? "Kashyapa" : formData.gotra,
      wish: formData.wish,
    });

    router.push(`/payment?${params.toString()}`);
  };

  return (
    <>
      <Navbar />

      {/* Login Modal for unauthenticated users */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
        }}
        onSuccess={() => {
          setShowLoginModal(false);
          setIsUser(true);
        }}
      />

      <main className="min-h-screen bg-[#fafafa] pb-20 font-sans">
        {/* Header Bar */}
        <header className="bg-white border-b border-stone-200 py-4 px-4 sm:px-12 flex items-center justify-between sticky top-0 z-40 shadow-xs">
          <button
            onClick={() => router.back()}
            className="text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-2 text-sm font-bold"
          >
            ← Back
          </button>
          <h1 className="text-lg sm:text-2xl font-serif font-bold text-stone-900 text-center">
            Fill your details for Sankalpam
          </h1>
          <div className="w-12" />
        </header>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
          {/* Stepper Bar */}
          <div className="max-w-xl mx-auto mb-10">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 right-0 top-4 h-0.5 bg-stone-200 -z-10" />

              <div className="flex flex-col items-center gap-1.5 bg-[#fafafa] px-3">
                <div className="h-8 w-8 rounded-full bg-[#00b050] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  1
                </div>
                <span className="text-xs font-bold text-[#00b050]">Devotee Details</span>
              </div>

              <div className="flex flex-col items-center gap-1.5 bg-[#fafafa] px-3">
                <div className="h-8 w-8 rounded-full bg-white border-2 border-stone-300 text-stone-400 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <span className="text-xs font-bold text-stone-400">Review</span>
              </div>

              <div className="flex flex-col items-center gap-1.5 bg-[#fafafa] px-3">
                <div className="h-8 w-8 rounded-full bg-white border-2 border-stone-300 text-stone-400 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <span className="text-xs font-bold text-stone-400">Payment</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-stone-600 font-serif text-base">
              <div className="w-10 h-10 border-4 border-[#00b050] border-t-transparent rounded-full animate-spin mb-4" />
              Loading sacred order details...
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-md mx-auto my-12">
              <p className="text-red-600 font-bold mb-4">{error}</p>
              <Link
                href="/puja"
                className="bg-[#00b050] text-white font-bold py-2.5 px-6 rounded-full inline-block text-sm"
              >
                Browse Pujas
              </Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Left Column: Devotee Details Form */}
              <div className="flex-1 w-full bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
                <h2 className="text-xl font-serif font-bold text-stone-900 border-b border-stone-100 pb-4">
                  Sankalpam Information
                </h2>

                {/* WhatsApp Number */}
                <div>
                  <label className="block text-stone-900 font-bold text-sm mb-2">
                    Your WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  <div className="border border-stone-300 rounded-2xl flex items-center px-4 py-3 bg-white focus-within:border-[#00b050] transition">
                    <span className="text-sm font-bold text-stone-800 pr-3 border-r border-stone-200 mr-3 flex items-center gap-1">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                      placeholder="9876543210"
                      className="w-full text-base font-medium outline-none bg-transparent"
                    />
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Ritual video proof and updates will be sent to this WhatsApp number.
                  </p>
                </div>

                {/* Devotee Name */}
                <div>
                  <label className="block text-stone-900 font-bold text-sm mb-2">
                    Devotee Name for Sankalpam <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.devoteeName}
                    onChange={(e) => setFormData({ ...formData, devoteeName: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full border border-stone-300 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-[#00b050] transition"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    This name will be chanted during the sacred invocational Sankalpam.
                  </p>
                </div>

                {/* Gotra */}
                <div>
                  <label className="block text-stone-900 font-bold text-sm mb-2">
                    Gotra <span className="text-stone-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    disabled={formData.dontKnowGotra}
                    value={formData.dontKnowGotra ? "Kashyapa (Default)" : formData.gotra}
                    onChange={(e) => setFormData({ ...formData, gotra: e.target.value })}
                    placeholder="e.g. Kashyapa, Bharadwaja"
                    className="w-full border border-stone-300 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-[#00b050] disabled:bg-stone-100 transition"
                  />
                  <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.dontKnowGotra}
                      onChange={(e) => setFormData({ ...formData, dontKnowGotra: e.target.checked })}
                      className="w-4 h-4 rounded text-[#00b050] focus:ring-[#00b050]"
                    />
                    <span className="text-xs font-semibold text-stone-700">
                      I do not know my gotra (Kashyapa Gotra will be used)
                    </span>
                  </label>
                </div>

                {/* Prayer Wish */}
                <div>
                  <label className="block text-stone-900 font-bold text-sm mb-2">
                    Specific Prayer / Wish <span className="text-stone-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formData.wish}
                    onChange={(e) => setFormData({ ...formData, wish: e.target.value })}
                    placeholder="e.g. Good health, family prosperity and career growth"
                    className="w-full border border-stone-300 rounded-2xl p-4 text-sm font-medium outline-none focus:border-[#00b050] transition resize-none"
                  />
                </div>

                {/* Proceed Button */}
                <button
                  onClick={handleProceedToPayment}
                  className="w-full bg-[#00b050] hover:bg-[#009644] active:scale-[0.99] text-white font-extrabold text-base py-4 rounded-full shadow-md transition-all flex items-center justify-center gap-2 mt-4"
                >
                  <span>Proceed to Payment</span>
                  <span>→</span>
                </button>
              </div>

              {/* Right Column: Order Summary matching exact design */}
              <div className="w-full lg:w-[380px] shrink-0">
                <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs sticky top-24 space-y-5">
                  <h3 className="text-lg font-serif font-bold text-stone-900 border-b border-stone-100 pb-3">
                    Order Summary
                  </h3>

                  {/* Puja Image + Title + Package */}
                  <div className="flex gap-4 items-start border-b border-stone-100 pb-5">
                    <img
                      src={pujaData?.imageUrl || "/images/Ganesh-Chaturthi-Mahapuja.jpg"}
                      alt={pujaData?.title || queryTitle}
                      className="w-20 h-20 rounded-2xl object-cover border border-stone-200 shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-stone-900 leading-snug">
                        {pujaData?.title || queryTitle || "Sacred Vedic Puja"}
                      </h4>
                      <p className="text-xs font-bold text-stone-700 mt-2">
                        {packageName} - <span className="text-[#800000] font-extrabold">₹{finalPrice}</span>
                      </p>
                    </div>
                  </div>

                  {/* Date Badge */}
                  <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-center gap-3 text-xs font-bold text-green-900">
                    <span className="text-lg">📅</span>
                    <span>{pujaData?.date || "Available Daily"}</span>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-3 text-xs text-stone-700 border-b border-stone-100 pb-5">
                    <div className="flex justify-between items-center font-medium">
                      <span>{packageName}</span>
                      <span className="font-bold text-stone-900">₹{finalPrice}</span>
                    </div>
                    <div className="flex justify-between items-center font-medium">
                      <span>Convenience Fee</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-stone-400 line-through text-[11px]">₹25</span>
                        <span className="font-bold text-[#00b050]">Free</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center font-medium">
                      <span>Priest & Ritual Dakshina</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-stone-400 line-through text-[11px]">₹150</span>
                        <span className="font-bold text-[#00b050]">Included</span>
                      </div>
                    </div>
                  </div>

                  {/* Total Amount */}
                  <div className="flex justify-between items-center text-base font-extrabold text-stone-900 pt-1">
                    <span>Total Amount</span>
                    <span className="text-lg text-[#800000]">₹{finalPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default function SankalpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center font-serif text-base text-stone-600">
          Loading Sankalpam Page...
        </div>
      }
    >
      <SankalpContent />
    </Suspense>
  );
}
