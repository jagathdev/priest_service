"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useUser } from "@/contexts/UserContext";

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

function SankalpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setUser } = useUser();

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

  // Devotee details form state
  const [formData, setFormData] = useState({
    whatsapp: searchParams?.get("wa") || user?.mobileNumber || user?.phone || user?.whatsapp || "",
    gotra: "",
    dontKnowGotra: false,
    wish: "",
    participants: ["", ""],
  });
  const [showErrors, setShowErrors] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedOfferings, setSelectedOfferings] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");

  const profileFetchedRef = React.useRef(false);

  // Auto-populate user details from UserContext / backend profile API
  useEffect(() => {
    async function loadUserProfile() {
      let phone = user?.mobileNumber || user?.phone || user?.whatsapp || searchParams?.get("wa") || "";
      let name = user?.name || searchParams?.get("name") || "";

      const uId = user?.id || user?._id;
      if (uId && !profileFetchedRef.current) {
        profileFetchedRef.current = true;
        try {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://priest-service.onrender.com";
          const res = await fetch(`${baseUrl}/api/users/profile/${uId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.data) {
              if (data.data.mobileNumber) phone = data.data.mobileNumber;
              if (data.data.name) name = data.data.name;
              setUser({ ...user, ...data.data });
            }
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
        }
      }

      setFormData((prev) => {
        const nextWhatsapp = prev.whatsapp.trim() ? prev.whatsapp : phone;
        const nextParticipants = [...prev.participants];
        if (!nextParticipants[0]?.trim() && name) {
          nextParticipants[0] = name;
        }
        return {
          ...prev,
          whatsapp: nextWhatsapp,
          participants: nextParticipants,
        };
      });
    }

    loadUserProfile();
  }, [user?.id, user?._id, user?.mobileNumber, user?.name]);

  const pujaFetchedRef = React.useRef(false);

  // Fetch Puja details by preserved Puja ID / Slug
  useEffect(() => {
    async function fetchPujaDetails() {
      if (!pujaId && !slug) {
        setError("No Puja specified for booking.");
        setLoading(false);
        return;
      }

      if (pujaFetchedRef.current) return;
      pujaFetchedRef.current = true;

      setLoading(true);
      setError(null);

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://priest-service.onrender.com";
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

  const packagesList = React.useMemo(() => {
    if (pujaData?.packages && pujaData.packages.length > 0) {
      return pujaData.packages.map((pkg: any, idx: number) => {
        const defaultDevotees = idx === 0 ? "1 Devotee" : idx === 1 ? "2 Devotees" : idx === 2 ? "4 Devotees" : "Multiple Devotees";
        return {
          ...pkg,
          id: pkg.id || pkg._id || `pkg-${idx + 1}`,
          name: pkg.name || `Package ${idx + 1}`,
          devoteeCount: pkg.devoteeCount || pkg.devotees || defaultDevotees,
          priceINR: pkg.priceINR ?? pkg.price ?? (queryAmount ? Number(queryAmount) : pujaData?.price || 501),
        };
      });
    }
    // Fallback packages if missing from DB
    const bPrice = queryAmount ? Number(queryAmount) : (pujaData?.price || 501);
    const title = pujaData?.title || queryTitle || "Puja";
    return [
      { id: "pkg-1", name: `Individual ${title}`, devoteeCount: "1 Devotee", priceINR: bPrice },
      { id: "pkg-2", name: `Couple ${title}`, devoteeCount: "2 Devotees", priceINR: bPrice + 200 },
      { id: "pkg-3", name: `Family ${title}`, devoteeCount: "4 Devotees", priceINR: bPrice + 400 },
    ];
  }, [pujaData, queryTitle, queryAmount]);

  // Determine preserved package & price
  const selectedPackage = React.useMemo(() => {
    if (!packagesList || !Array.isArray(packagesList) || packagesList.length === 0) return null;
    if (!pkgId) return packagesList[0];

    const cleanPkgId = String(pkgId).trim().toLowerCase();

    // 1. Direct match by id or index
    const directMatch = packagesList.find((p: any, idx: number) => {
      const pId = String(p.id || p._id || "").toLowerCase();
      return pId === cleanPkgId || `pkg-${idx + 1}` === cleanPkgId;
    });

    if (directMatch) return directMatch;

    // 2. Search by package name or keyword match
    const nameMatch = packagesList.find((p: any) => {
      const pName = String(p.name || "").toLowerCase();
      if (cleanPkgId.includes("couple") && pName.includes("couple")) return true;
      if (cleanPkgId.includes("family") && pName.includes("family")) return true;
      if (cleanPkgId.includes("individual") && pName.includes("individual")) return true;
      return pName.includes(cleanPkgId);
    });

    return nameMatch || packagesList[0];
  }, [packagesList, pkgId]);

  const defaultParticipantCount = React.useMemo(() => {
    if (!selectedPackage) return 1;
    const name = selectedPackage.name?.toLowerCase() || "";
    const devoteeCount = String(selectedPackage.devoteeCount || selectedPackage.devotees || "");
    if (name.includes("family") || devoteeCount.includes("4")) return 4;
    if (name.includes("couple") || devoteeCount.includes("2")) return 2;
    return 1;
  }, [selectedPackage]);

  useEffect(() => {
    setFormData(prev => {
      // Only set default if user hasn't typed anything yet
      if (prev.participants.every(p => !p) && prev.participants.length !== defaultParticipantCount) {
        return { ...prev, participants: Array(defaultParticipantCount).fill("") };
      }
      return prev;
    });
  }, [defaultParticipantCount]);

  const offeringsList = React.useMemo(() => {
    if (pujaData?.offerings && pujaData.offerings.length > 0) {
      return pujaData.offerings;
    }
    return [
      {
        title: "Pitru Shanti Goseva",
        description: "Freedom from accrued sins, done consciously or unconsciously.",
        priceINR: 201,
        image: "https://images.unsplash.com/photo-1596700778747-062e78740c03?w=100&q=80"
      },
      {
        title: "Brahmin Bhoj",
        description: "Relief from health issues caused by ancestral afflictions.",
        priceINR: 251,
        image: "https://images.unsplash.com/photo-1604085572502-a39c941c9f4d?w=100&q=80"
      },
      {
        title: "Pitru Shanti Sampurna seva",
        description: "Sampurna seva for the peace of the Ancestors and their blessings.",
        priceINR: 351,
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80"
      }
    ];
  }, [pujaData]);

  const packageName = selectedPackage?.name || "Standard Seva Package";
  const basePrice = selectedPackage?.priceINR ?? selectedPackage?.price ?? (queryAmount ? Number(queryAmount) : pujaData?.price || 516);
  const extraParticipantCount = Math.max(0, formData.participants.length - defaultParticipantCount);
  const extraParticipantFee = extraParticipantCount * 300;
  const offeringsTotal = selectedOfferings.reduce((sum, item) => sum + item.priceINR, 0);
  const finalPrice = basePrice + extraParticipantFee + offeringsTotal;

  const handleProceedToStep2 = () => {
    setShowErrors(true);
    if (!formData.whatsapp.trim()) {
      alert("Please enter a valid WhatsApp number.");
      return;
    }
    if (!formData.participants[0]?.trim()) {
      alert("Please provide at least one Participant Name.");
      return;
    }

    // Call updateProfile API to sync devotee profile details to backend database
    const uId = user?.id || user?._id;
    if (uId) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://priest-service.onrender.com";
      const nameToSave = formData.participants[0]?.trim() || user?.name || "Devotee";
      fetch(`${baseUrl}/api/users/updateProfile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: uId,
          name: nameToSave,
          email: user?.email || "devotee@astroved.com",
          mobileNumber: formData.whatsapp.trim(),
        }),
      })
        .then((r) => r.json())
        .then((resData) => {
          if (resData.success && resData.data) {
            setUser({ ...user, ...resData.data });
          }
        })
        .catch(console.error);
    }

    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinalCheckout = async () => {
    setIsProcessing(true);
    setError(null);
    setLoadingMsg("Initializing secure payment gateway...");
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priest-service.onrender.com";
      
      const userName = formData.participants[0]?.trim() || user?.name || "Devotee";
      const userPhone = formData.whatsapp || user?.whatsapp || user?.mobileNumber || user?.phone || "";
      const mongoUserId = user?._id || user?.id || user?.customerId || null;
      const userEmail = user?.email || "";
      const userAddresses = user?.addresses || [];
      const defaultAddress = userAddresses.find((a: any) => a.isDefault) || userAddresses[0] || {};

      const userStreet = defaultAddress.addressLine1 || "N/A";
      const userCity = defaultAddress.city || "N/A";
      const userState = defaultAddress.state || "N/A";
      const userPincode = defaultAddress.pincode || "000000";
      const userCountry = defaultAddress.country || "India";

      const nameParts = userName.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

      const itemName = pujaData?.title || queryTitle || "Sacred Puja";

      setLoadingMsg("Creating order securely...");
      const orderRes = await fetch(`${backendUrl}/api/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: mongoUserId,
          currencyCode: "INR",
          shoppingCartId: 0,
          totalamount: Number(finalPrice),
          contactId: 1367254,
          localeId: 1,
          trackingCode1: "",
          trackingCode2: "",
          shippingpreferred: false,
          contactDetail: {
            CustomerId: mongoUserId,
            FirstName: firstName,
            LastName: lastName,
            ShopName: "AstroVed",
            Street: userStreet,
            City: userCity,
            State: userState,
            Country: userCountry,
            Pincode: userPincode,
            Phone: userPhone
          }
        })
      });

      const contentType = orderRes.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned an invalid HTML response. Please make sure the backend is running.");
      }

      const orderData = await orderRes.json();

      if (!orderRes.ok || (!orderData.data?.orderId && !orderData.orderId)) {
        throw new Error(orderData.message || "Failed to create order.");
      }

      const orderId = orderData.data?.orderId || orderData.orderId;
      const rzpKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || orderData.data?.keyId;

      if (!rzpKey) {
        throw new Error("Razorpay Key ID is missing.");
      }

      setLoadingMsg("Opening Razorpay...");

      const options: Record<string, unknown> = {
        key: rzpKey,
        name: "AstroVed",
        description: itemName,
        order_id: orderId,
        image: "https://www.astroved.com/Images/astroved-logo.jpg",
        prefill: {
          name: userName,
          contact: userPhone,
          email: userEmail
        },
        theme: {
          color: "#00b050",
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
            const verifyRes = await fetch(`${backendUrl}/api/payments/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                orderDetails: {
                  pooja: itemName,
                  customer: mongoUserId,
                  customerName: userName,
                  itemName: itemName,
                  mobileNumber: userPhone,
                  whatsappNumber: formData.whatsapp,
                  participants: formData.participants.filter((p: string) => p.trim()).map((p: string) => ({ name: p.trim() })),
                  gotra: formData.dontKnowGotra ? "Kashyapa" : formData.gotra,
                  doesNotKnowGotra: formData.dontKnowGotra,
                  wish: formData.wish,
                  pricing: {
                    basePrice: basePrice,
                    extraParticipantCount: extraParticipantCount,
                    extraParticipantAmount: extraParticipantFee,
                    total: finalPrice
                  }
                }
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              const params = new URLSearchParams({
                paymentId: response.razorpay_payment_id,
                orderId: orderId,
                title: pujaData?.title || queryTitle || "Sacred Puja",
                amount: String(finalPrice),
                name: userName
              });
              router.push(`/payment/success?${params.toString()}`);
            } else {
              setError("Payment verification failed.");
              setIsProcessing(false);
            }
          } catch {
            setError("Error verifying payment.");
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setLoadingMsg("");
          },
          escape: true,
          backdropclose: false
        }
      };

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
    <>
      <Navbar />

      <main className="min-h-screen bg-white pb-20 font-sans">
        {/* Header Bar */}
        <header className="bg-white py-6 px-4 sm:px-12 flex items-center justify-between sticky top-0 z-40 mb-2">
          <button
            onClick={() => router.back()}
            className="text-stone-400 hover:text-stone-800 transition-colors flex items-center gap-2 text-sm font-bold"
          >
            ← Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-serif font-medium text-stone-800 text-center flex-1">
            Fill your details for Puja
          </h1>
          <div className="w-12" />
        </header>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-2">
          {/* Stepper Bar */}
          <div className="max-w-xl mx-auto mb-10">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-8 right-8 top-4 h-[2px] bg-stone-200 -z-10" />
              <div className={`absolute left-8 top-4 h-[2px] bg-[#00b050] -z-10 transition-all duration-300 ${step === 2 ? 'right-1/2' : 'right-[85%]'}`} />

              <div className="flex flex-col items-center gap-1.5 bg-white px-4">
                <div className="h-8 w-8 rounded-full bg-[#00b050] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  ✓
                </div>
                <span className="text-[13px] font-bold text-stone-500">Devotee Details</span>
              </div>

              <div className="flex flex-col items-center gap-1.5 bg-white px-4">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step === 2 ? 'bg-[#00b050] text-white shadow-sm' : 'bg-white border-2 border-[#00b050] text-[#00b050]'}`}>
                  2
                </div>
                <span className={`text-[13px] font-bold ${step === 2 ? 'text-[#00b050]' : 'text-stone-400'}`}>Review</span>
              </div>

              <div className="flex flex-col items-center gap-1.5 bg-white px-4">
                <div className="h-8 w-8 rounded-full bg-white border-2 border-stone-200 text-stone-400 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <span className="text-[13px] font-bold text-stone-400">Payment</span>
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
            <div className="flex flex-col lg:flex-row gap-10 items-start">
              {/* Left Column: Content */}
              <div className="flex-1 w-full space-y-8">
                {step === 1 ? (
                  <>

                    {/* WhatsApp */}
                    <div>
                      <label className="flex items-center gap-2 text-stone-900 font-bold text-sm mb-3">
                        Your WhatsApp Number
                        <svg className="w-3.5 h-3.5 text-[#00b050]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </label>
                      <div className="border border-stone-200 rounded-xl flex items-center px-4 py-3 bg-[#fcfcfc] focus-within:border-[#00b050] transition shadow-sm">
                        <div className="flex items-center gap-2 pr-3 border-r border-stone-200 mr-3">
                          <span className="text-lg">🇮🇳</span>
                          <span className="text-xs font-extrabold text-stone-800">+91 ▾</span>
                        </div>
                        <input
                          type="tel"
                          value={formData.whatsapp}
                          onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                          placeholder="9360270984"
                          className="w-full text-sm font-extrabold text-stone-900 outline-none bg-transparent"
                        />
                        <div className="text-[#0084ff]">
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                        </div>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-2 font-medium">
                        The puja video and blessing details will be sent to this number.
                      </p>
                    </div>

                    {/* Devotee Names */}
                    <div>
                      <label className="block text-stone-900 font-bold text-sm mb-3">
                        Provide participant names for Puja
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {formData.participants.map((p, idx) => (
                          <input
                            key={idx}
                            type="text"
                            value={p}
                            onChange={(e) => {
                              const newP = [...formData.participants];
                              newP[idx] = e.target.value;
                              setFormData({ ...formData, participants: newP });
                            }}
                            placeholder={`Participant Name ${idx + 1}`}
                            className={`w-full border rounded-xl px-4 py-3 text-sm font-medium outline-none transition ${idx === 0 && showErrors && !p.trim()
                              ? "border-red-400 bg-red-50/20"
                              : "border-stone-200 focus:border-stone-300 bg-white"
                              }`}
                          />
                        ))}
                      </div>
                      <div className="mt-4 flex items-center gap-3">
                        <button
                          onClick={() => setFormData({ ...formData, participants: [...formData.participants, ""] })}
                          className="text-sm font-bold text-[#00b050] bg-white border border-dashed border-[#00b050] rounded-full px-5 py-2 flex items-center gap-1.5 hover:bg-green-50 transition-colors"
                        >
                          <span>+ Add 1 more participant</span>
                          <span className="font-extrabold">+₹300</span>
                        </button>
                        {formData.participants.length > defaultParticipantCount && (
                          <button
                            onClick={() => setFormData({ ...formData, participants: formData.participants.slice(0, -1) })}
                            className="text-sm font-bold text-stone-600 bg-white border border-stone-300 rounded-full px-5 py-2 flex items-center hover:bg-stone-50 transition-colors"
                          >
                            – Remove
                          </button>
                        )}
                      </div>
                      {showErrors && !formData.participants[0]?.trim() && (
                        <p className="text-[10px] sm:text-[11px] text-red-500 mt-3 font-semibold">
                          Provide at least one Participant Name 1: Please enter a name
                        </p>
                      )}
                      <p className="text-[11px] text-stone-500 mt-1 font-medium">
                        This name will be included in the sacred sankalpam during the puja.
                      </p>
                    </div>

                    {/* Gotra */}
                    <div>
                      <label className="block text-stone-900 font-bold text-sm mb-3">
                        Add your Gotra <span className="text-stone-400 font-normal text-xs ml-1">(required)</span>
                      </label>
                      <input
                        type="text"
                        disabled={formData.dontKnowGotra}
                        value={formData.dontKnowGotra ? "Kashyapa" : formData.gotra}
                        onChange={(e) => setFormData({ ...formData, gotra: e.target.value })}
                        placeholder="Gotra of Puja performer (e.g. Kashyapa, Bharadwaja)"
                        className={`w-full border border-stone-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-[#00b050] shadow-sm ${formData.dontKnowGotra ? "bg-[#f4f2ee] text-stone-500 cursor-not-allowed" : "bg-white"
                          }`}
                      />
                      <label className="flex items-center gap-2 mt-3 cursor-pointer select-none pl-1">
                        <input
                          type="checkbox"
                          checked={formData.dontKnowGotra}
                          onChange={(e) => setFormData({ ...formData, dontKnowGotra: e.target.checked })}
                          className="w-4 h-4 rounded border-stone-300 text-[#00b050] focus:ring-[#00b050]"
                        />
                        <span className="text-xs font-medium text-stone-700">
                          I do not know my gotra
                        </span>
                      </label>
                    </div>

                    {/* Prayer Wish */}
                    <div>
                      <label className="block text-stone-900 font-bold text-sm mb-3">
                        Add your wish <span className="text-stone-400 font-normal text-xs ml-1">(optional)</span>
                      </label>
                      <textarea
                        rows={4}
                        value={formData.wish}
                        onChange={(e) => setFormData({ ...formData, wish: e.target.value })}
                        className="w-full border border-stone-200 rounded-xl p-4 text-xs font-medium text-stone-700 outline-none focus:border-[#00b050] resize-none shadow-sm"
                        placeholder="e.g. FAMILY WELL BEING"
                      />
                    </div>

                  </>
                ) : (
                  <>
                    {/* Payment Method */}
                    <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
                      <h3 className="text-base font-extrabold text-stone-900 mb-4">Payment Method</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div
                          onClick={() => setPaymentMethod("upi")}
                          className={`border rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${paymentMethod === "upi" ? "border-[#00b050] bg-green-50/30 shadow-sm" : "border-stone-200 hover:border-[#00b050]"}`}
                        >
                          <svg className={`w-8 h-8 mb-2 ${paymentMethod === "upi" ? "text-[#00b050]" : "text-stone-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                          <span className="text-xs font-bold text-stone-700 text-center">Cards / Netbanking / UPI</span>
                        </div>
                        <div
                          onClick={() => setPaymentMethod("qr")}
                          className={`border rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${paymentMethod === "qr" ? "border-[#00b050] bg-green-50/30 shadow-sm" : "border-stone-200 hover:border-[#00b050]"}`}
                        >
                          <svg className={`w-8 h-8 mb-2 ${paymentMethod === "qr" ? "text-[#00b050]" : "text-stone-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                          <span className="text-xs font-bold text-stone-700 text-center">Scan QR to Pay</span>
                        </div>
                      </div>
                    </div>

                    {/* Add prasadam & offerings */}
                    <div>
                      <h3 className="text-sm font-extrabold text-stone-900 mb-4">Add prasadam & offerings</h3>
                      <div className="space-y-3">
                        {offeringsList.map((offering: any, idx: number) => {
                          const isAdded = selectedOfferings.find(o => o.title === offering.title);
                          return (
                            <div key={idx} className="bg-white p-3 rounded-2xl border border-stone-100 flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-stone-100 border border-stone-200">
                                <img src={offering.image} alt={offering.title} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-[12px] font-bold text-stone-800">{offering.title}</h4>
                                <p className="text-[10px] text-stone-500 truncate">{offering.description}</p>
                              </div>
                              <div className="font-extrabold text-[#f15a29] text-sm">₹{offering.priceINR}</div>
                              <button
                                onClick={() => {
                                  if (isAdded) setSelectedOfferings(prev => prev.filter(o => o.title !== offering.title));
                                  else setSelectedOfferings(prev => [...prev, offering]);
                                }}
                                className={`text-[11px] font-bold px-5 py-2 rounded-full transition-colors shrink-0 flex items-center gap-1 ${isAdded
                                  ? "bg-red-50 text-red-600 border border-red-200"
                                  : "bg-[#00b050] text-white"
                                  }`}
                              >
                                {isAdded ? "− Remove" : "+ Add"}
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Promocode */}
                    <div>
                      <h3 className="text-sm font-extrabold text-[#f15a29] mb-3">Have a Promocode?</h3>
                      <div className="flex items-center gap-3">
                        <input type="text" placeholder="Enter Promocode" className="flex-1 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00b050] transition-colors" />
                        <button className="bg-[#00b050] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#009b46] transition-colors">Apply</button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Right Column: Order Summary Card */}
              <div className="w-full lg:w-[400px] shrink-0 space-y-6">

                {/* Order Summary Box */}
                <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm relative">
                  <h3 className="text-xl font-serif text-stone-800 pb-4 mb-5 border-b-2 border-stone-100">
                    Order Summary
                  </h3>

                  {/* Puja Item */}
                  <div className="flex gap-4 items-center mb-6">
                    <img
                      src={pujaData?.imageUrl || "/images/Ganesh-Chaturthi-Mahapuja.jpg"}
                      alt={pujaData?.title || queryTitle}
                      className="w-[84px] h-[64px] rounded-lg object-cover border border-stone-200 shrink-0 shadow-sm"
                    />
                    <div>
                      <h4 className="text-[13px] font-extrabold text-stone-900 leading-snug">
                        {pujaData?.title || queryTitle || "Mahalaya Amavasya Special Sarva Pitru Dosh Shanti Mahapuja at Moksha Tirtha Gaya"}
                      </h4>
                      <p className="text-[11px] font-bold text-stone-600 mt-2 flex items-center gap-1.5">
                        {packageName} <span className="text-stone-400 text-[8px]">●</span> <span className="text-[#980000] font-extrabold">₹{finalPrice}</span>
                      </p>
                    </div>
                  </div>

                  {/* Date Box */}
                  <div className="bg-[#f2f9f5] border border-[#e2f1e8] rounded-xl px-4 py-2.5 flex items-center gap-3 text-xs font-bold text-[#1f4e35] mb-6">
                    <svg className="w-4 h-4 text-[#00b050]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span>{pujaData?.date || "Saturday, 10 October"}</span>
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-4 text-xs text-stone-700 border-b-2 border-stone-100 pb-5 mb-5">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{packageName}</span>
                      <span className="font-extrabold text-[#980000]">₹{basePrice}</span>
                    </div>
                    {extraParticipantCount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Extra Participants ({extraParticipantCount})</span>
                        <span className="font-extrabold text-[#980000]">+₹{extraParticipantFee}</span>
                      </div>
                    )}
                    {selectedOfferings.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[11px]">
                        <span className="font-medium text-stone-600 truncate max-w-[200px]">{item.title}</span>
                        <span className="font-extrabold text-[#980000]">+₹{item.priceINR}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Convenience Fee</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[#980000] line-through font-medium text-[11px]">₹25</span>
                        <span className="font-extrabold text-stone-900">Free</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Pandit Fee</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[#980000] line-through font-medium text-[11px]">₹150</span>
                        <span className="font-extrabold text-stone-900">Free</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Photo and video recording fee</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[#980000] line-through font-medium text-[11px]">₹500</span>
                        <span className="font-extrabold text-stone-900">Free</span>
                      </div>
                    </div>
                  </div>

                  {/* Continue Button */}
                  {isProcessing ? (
                    <div className="flex flex-col items-center justify-center py-3 mb-4 border border-stone-200 rounded-xl bg-stone-50">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#00b050] mb-2"></div>
                      <span className="text-[11px] font-bold text-stone-600 animate-pulse">{loadingMsg}</span>
                    </div>
                  ) : (
                    <button
                      onClick={step === 1 ? handleProceedToStep2 : handleFinalCheckout}
                      className="w-full bg-[#00b050] hover:bg-[#009644] active:scale-[0.99] text-white font-extrabold text-sm py-4 rounded-xl transition-all shadow-md mb-4"
                    >
                      {step === 1 ? "Continue" : "Continue with Payment"}
                    </button>
                  )}

                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#00b050]">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    100% Secure
                  </div>
                </div>

                {/* Badges Box */}
                <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 text-xs text-stone-600 font-medium">
                    <div className="w-5 h-5 rounded-full bg-[#eaf7f1] flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-[#00b050]" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    Puja Video Delivered Within 48 Hours
                  </div>
                  <div className="flex items-center gap-3 text-xs text-stone-600 font-medium">
                    <div className="w-5 h-5 rounded-full bg-[#eaf7f1] flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-[#00b050]" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    Verified & Experienced Purohits
                  </div>
                  <div className="flex items-center gap-3 text-xs text-stone-600 font-medium">
                    <div className="w-5 h-5 rounded-full bg-[#eaf7f1] flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-[#00b050]" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    Pujas Performed in Sacred Temples
                  </div>
                  <div className="flex items-center gap-3 text-xs text-stone-600 font-medium">
                    <div className="w-5 h-5 rounded-full bg-[#eaf7f1] flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-[#00b050]" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    100% Authentic Vedic Rituals
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
