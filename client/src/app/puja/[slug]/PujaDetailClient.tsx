"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { useCurrency } from "@/contexts/CurrencyContext";
import LoginModal from "@/components/auth/LoginModal";
import {
  ArrowLeftIcon,
  BuildingLibraryIcon,
  CheckBadgeIcon,
  CheckIcon,
  FireIcon,
  GiftIcon,
  HeartIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon,
  TagIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

const BENEFIT_ICONS = [
  SparklesIcon,
  ShieldCheckIcon,
  FireIcon,
  HeartIcon,
  StarIcon,
  GiftIcon,
  BuildingLibraryIcon,
  CheckBadgeIcon,
];
const PERSON_LABELS = ["1 Person", "2 Person", "4 Person", "6 Person"];
const PERSON_COLORS = [
  "bg-violet-50 text-violet-600",
  "bg-pink-50 text-pink-600",
  "bg-violet-50 text-violet-600",
  "bg-yellow-50 text-yellow-700",
];

type PujaPackage = {
  id: string;
  name: string;
  priceINR?: number;
  priceUSD?: number;
  priceMYR?: number;
  price?: number; // legacy
  description: string;
  imageUrl?: string;
};

type PujaOffering = {
  id: string;
  name: string;
  priceINR?: number;
  priceUSD?: number;
  priceMYR?: number;
  price?: number; // legacy
  description: string;
  badge?: string;
  imageUrl?: string;
  productId?: number;
};

type PujaStat = {
  label: string;
  value: string;
  detail?: string;
};

type PujaSection = {
  title: string;
  description: string;
};

type PujaFaq = {
  question: string;
  answer: string;
};

type PujaDetails = {
  heroTitle: string;
  heroSubtitle: string;
  strengthFor: string;
  ritualSummary: string;
  templeName: string;
  templeLocation: string;
  templeNote?: string;
  about: string;
  stats: PujaStat[];
  benefits: PujaSection[];
  process: PujaSection[];
  inclusions: string[];
  faq: PujaFaq[];
};

type Puja = {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  badge?: string;
  shortTitle?: string;
  location?: string;
  date?: string;
  eventDateTime?: string;
  slug: string;
  details: PujaDetails;
  packages: PujaPackage[];
  offerings: PujaOffering[];
  gallery?: string[];
  sectionOrder?: string[];
  productId?: number;
};

type Countdown = {
  slug?: string;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
};

const defaultCountdown: Countdown = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  expired: false,
};

const parseEventDate = (value?: string) => {
  if (!value) return null;

  // Try DD-MM-YYYY format
  const ddmmyyyy = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(value.trim());
  if (ddmmyyyy) {
    const [, d, m, y] = ddmmyyyy;
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const normalized = value.replace(/(\d+)(st|nd|rd|th)/gi, "$1");
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const buildCountdown = (target: Date): Countdown => {
  const now = Date.now();
  const diff = target.getTime() - now;

  if (diff <= 0) {
    return { ...defaultCountdown, expired: true };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, expired: false };
};

const Marquee = 'marquee' as any;
export default function PujaDetailClient({ initialPuja, recommendations = [] }: { initialPuja: Puja | null; recommendations?: any[] }) {
  const params = useParams<{ slug: string }>();
  const slugParam = params?.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  const { currency, currencySymbol } = useCurrency();

  const getDisplayPrice = (item: any) => {
    return item[`price${currency}`] ?? item.price ?? 0;
  };

  const [puja, setPuja] = useState<Puja | null>(initialPuja);
  const [loading, setLoading] = useState(!initialPuja);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(initialPuja?.packages?.[0]?.id ?? null);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [userDetails, setUserDetails] = useState({ name: "", whatsapp: "" });
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartError, setCartError] = useState("");
  const [reviewCartError, setReviewCartError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [shoppingCartId, setShoppingCartId] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponStatus, setCouponStatus] = useState<"idle" | "applied" | "invalid">("idle");
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [countdown, setCountdown] = useState<Countdown>(defaultCountdown);
  const [activeTab, setActiveTab] = useState("about");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dbReviews, setDbReviews] = useState<any[]>([]);
  const [reviewsShown, setReviewsShown] = useState(3);
  const [activeCarouselDot, setActiveCarouselDot] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [pendingSankalpUrl, setPendingSankalpUrl] = useState<string | null>(null);
  const [isIndian, setIsIndian] = useState(true);
  const [isPackagesVisible, setIsPackagesVisible] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isManualScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<any>(null);
  const packagesObserverRef = useRef<IntersectionObserver | null>(null);

  const hasGallery = puja?.gallery && puja.gallery.length > 0;
  const images = hasGallery ? [puja!.imageUrl, ...puja!.gallery!] : [puja?.imageUrl || "https://images.unsplash.com/photo-1601024445121-e5b82f020549?auto=format&fit=crop&w=800&q=80"];

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleAddPujaToCart = async () => {
    setAddingToCart(true);
    setCartError("");
    try {
      const meRes = await fetch('/api/auth/me');
      let customerId = 1145090; // Default fallback
      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData.authenticated && meData.user?.customerId) {
          customerId = Number(meData.user.customerId) || 1145090;
        }
      }

      // Product ID from puja, fallback to 10
      const productId = puja?.productId || 10;

      const cartRes = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          productId,
          quantity: 1,
          shopName: "AstroVed",
          variationId: 0,
          currencyCode: "INR",
          localeCode: "en-US",
          freeProductContributionAmount: 0,
          productSubVariationExternalId: ""
        })
      });

      const cartData = await cartRes.json();

      if (cartRes.ok && (cartData.StatusCode === 200 || cartData.Status === "OK")) {
        if (cartData.SelectedListId) {
          setShoppingCartId(String(cartData.SelectedListId));
        }
        setShowDetailsModal(false);
        setShowPackageModal(false);
        setShowReviewModal(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setCartError(cartData.Message || "Failed to add package to cart");
      }
    } catch (error) {
      setCartError("An error occurred. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  const toggleExtra = (id: string) => {
    setReviewCartError("");
    setSelectedExtraIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const SCROLL_CARD_WIDTH = 336;

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = SCROLL_CARD_WIDTH;
      const maxDotIndex = 3;
      setActiveCarouselDot((prev) => {
        if (direction === 'left') {
          return Math.max(prev - 1, 0);
        }
        return Math.min(prev + 1, maxDotIndex);
      });

      if (direction === 'left') {
        carouselRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  // Handle carousel scroll to update active dot
  useEffect(() => {
    async function detectCountry() {
      try {
        const res = await fetch("/api/auth/geoip");
        const data = await res.json();
        if (data && data.country) {
          setIsIndian(data.country === "IN");
        }
      } catch (err) {
        console.error("GeoIP detection failed:", err);
      }
    }
    detectCountry();
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleCarouselScroll = () => {
      const scrollLeft = carousel.scrollLeft;
      const activeIndex = Math.round(scrollLeft / SCROLL_CARD_WIDTH);
      setActiveCarouselDot(Math.max(0, Math.min(activeIndex, 3)));
    };

    carousel.addEventListener('scroll', handleCarouselScroll);
    handleCarouselScroll();
    return () => carousel.removeEventListener('scroll', handleCarouselScroll);
  }, []);

  const extrasTotal = (puja?.offerings || [])
    .filter(o => selectedExtraIds.includes(o.id))
    .reduce((sum, o) => sum + getDisplayPrice(o), 0);

  const selectedPackage = puja?.packages?.find((pkg) => pkg.id === selectedPackageId) ?? puja?.packages?.[0] ?? null;
  const pkgPrice = selectedPackage ? getDisplayPrice(selectedPackage) : 0;
  const highPrice = selectedPackage ? Math.round(pkgPrice * 1.2) : null;
  const totalAmount = Math.max(0, pkgPrice + extrasTotal - couponDiscount);

  const handleApplyCoupon = () => {
    const trimmed = couponInput.trim().toUpperCase();
    // Demo coupon logic — replace with real API call
    if (trimmed === "ASTRO10") {
      const discount = Math.round((pkgPrice + extrasTotal) * 0.1);
      setCouponDiscount(discount);
      setCouponCode(trimmed);
      setCouponStatus("applied");
    } else if (trimmed === "SAVE50") {
      setCouponDiscount(50);
      setCouponCode(trimmed);
      setCouponStatus("applied");
    } else {
      setCouponDiscount(0);
      setCouponCode("");
      setCouponStatus("invalid");
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponInput("");
    setCouponStatus("idle");
    setCouponDiscount(0);
    setShowCouponInput(false);
  };

  const defaultSectionOrder = ["about", "benefits", "process", "temple", "packages", "reviews", "faqs", "recommendations"];
  let currentSectionOrder = puja?.sectionOrder && puja.sectionOrder.length > 0 ? [...puja.sectionOrder] : [...defaultSectionOrder];

  if (recommendations && recommendations.length > 0 && !currentSectionOrder.includes("recommendations")) {
    currentSectionOrder.push("recommendations");
  }

  const allSectionTabs: Record<string, { id: string; label: string }> = {
    about: { id: "about", label: "About Puja" },
    benefits: { id: "benefits", label: "Benefits" },
    process: { id: "process", label: "Process" },
    temple: { id: "temple", label: "Temple Details" },
    packages: { id: "packages", label: "Packages" },
    reviews: { id: "reviews", label: "Reviews" },
    faqs: { id: "faqs", label: "FAQs" },
    recommendations: { id: "recommendations", label: "Recommendations" },
  };

  const sectionTabs = currentSectionOrder.map(id => allSectionTabs[id]).filter(Boolean);

  useEffect(() => {
    if (initialPuja) {
      setPuja(initialPuja);
      setSelectedPackageId(initialPuja.packages?.[0]?.id ?? null);
      setLoading(false);
      return;
    }

    const loadPuja = async () => {
      try {
        if (!slug) {
          setPuja(null);
          return;
        }

        const res = await fetch(`/api/puja?slug=${slug}`);
        if (!res.ok) {
          setPuja(null);
          return;
        }

        const data: Puja = await res.json();
        setPuja(data);
        setSelectedPackageId(data.packages?.[0]?.id ?? null);
      } catch {
        setPuja(null);
      } finally {
        setLoading(false);
      }
    };

    loadPuja();
  }, [slug, initialPuja]);

  useEffect(() => {
    if (!puja) {
      setCountdown(defaultCountdown);
      return;
    }

    const target = parseEventDate(puja.eventDateTime) || parseEventDate(puja.date);
    if (!target) {
      setCountdown(defaultCountdown);
      return;
    }

    setCountdown(buildCountdown(target));
    const timer = setInterval(() => {
      setCountdown(buildCountdown(target));
    }, 1000);

    return () => clearInterval(timer);
  }, [puja]);

  // Fetch approved reviews from DB
  useEffect(() => {
    fetch("/api/reviews")
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setDbReviews(data); })
      .catch(() => { });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (isManualScrollingRef.current) return;

      const sectionIds = currentSectionOrder;

      // Check if we are at the bottom of the page
      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;
      if (isAtBottom) {
        for (let i = sectionIds.length - 1; i >= 0; i--) {
          const section = document.getElementById(sectionIds[i]);
          if (section) {
            setActiveTab(sectionIds[i]);
            return;
          }
        }
      }

      const scrollPosition = window.scrollY + 200; // offset for sticky headers (must be greater than target scroll offset of 180px)

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const section = document.getElementById(sectionIds[i]);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveTab(sectionIds[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Intersection Observer for mobile floating button
    const packageSection = document.getElementById("packages");
    if (packageSection) {
      packagesObserverRef.current = new IntersectionObserver(
        ([entry]) => {
          setIsPackagesVisible(entry.isIntersecting);
        },
        { root: null, threshold: 0, rootMargin: "-100px 0px" }
      );
      packagesObserverRef.current.observe(packageSection);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (packagesObserverRef.current) packagesObserverRef.current.disconnect();
    };
  }, [currentSectionOrder]);

  // Review booking proceed loading state
  const [reviewLoading, setReviewLoading] = useState(false);

  // ── Review Booking: render as a REAL FULL PAGE (early return, not a popup) ──
  if (showReviewModal && puja) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] pb-32">
        {/* Hide site footer & AI chat while in review booking mode */}
        <style>{`footer, [data-global-chrome="assistant"], [data-mobile-bottom-nav] { display: none !important; }`}</style>
        <Navbar />
        {/* Review Breadcrumbs */}
        <div className="bg-white border-b border-gray-100 py-2.5 sm:py-3 px-3 sm:px-4 sticky top-16 z-20">
          <div className="mx-auto max-w-7xl flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4 text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-[#1f1f1f] overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="h-5 w-5 rounded-full bg-[#6869F9] text-white flex items-center justify-center text-[8px] shrink-0">
                  <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5"><path d="M2 6.5 4.8 9 10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                Add Details
              </div>
              <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 shrink-0 text-gray-300"><path d="M5 3l6 5-6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="h-5 w-5 rounded-full bg-[#6869F9] text-white flex items-center justify-center text-[8px] shrink-0">
                  <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5"><path d="M2 6.5 4.8 9 10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                Review Booking
              </div>
              <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 shrink-0 text-gray-300"><path d="M5 3l6 5-6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <div className="flex items-center gap-1.5 shrink-0 opacity-40">
                <div className="h-5 w-5 rounded-full bg-gray-300 text-white flex items-center justify-center text-[8px] shrink-0">3</div>
                Fill Name, Gotra &amp; Address
              </div>
              <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 shrink-0 text-gray-300"><path d="M5 3l6 5-6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <div className="flex items-center gap-1.5 shrink-0 opacity-40">
                <div className="h-5 w-5 rounded-full bg-gray-300 text-white flex items-center justify-center text-[8px] shrink-0">4</div>
                Make Payment
              </div>
            </div>
            <button onClick={() => setShowExitConfirm(true)} className="text-gray-400 hover:text-red-500 shrink-0 ml-3">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-3 sm:px-6 py-6 sm:py-10 grid grid-cols-1 md:grid-cols-[2fr_1fr] lg:grid-cols-3 gap-6 sm:gap-10">
          {/* Left Column: Selected Items */}
          <div className="lg:col-span-2 space-y-6">
            <button
              onClick={() => {
                setShowReviewModal(false);
                if (isIndian) {
                  setShowDetailsModal(true);
                } else {
                  setShowPackageModal(true);
                }
              }}
              className="flex items-center gap-2 text-sm font-bold text-[#1f1f1f] hover:text-[#1f1f1f] transition-colors mb-6"
            >
              <ArrowLeftIcon className="h-4 w-4" /> Review Booking
            </button>

            <div className="space-y-4">
              {/* Primary Package */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0 mr-3">
                    <h3 className="font-bold text-[#1f1f1f] text-lg mb-2">{selectedPackage?.name}</h3>
                    <div className="mt-1">
                      <span className="text-lg font-black text-[#6869F9] leading-tight">{currencySymbol} {selectedPackage ? getDisplayPrice(selectedPackage) : 0}</span>
                    </div>
                  </div>
                  <div className="bg-[#6869F9]/10 text-[#1f1f1f] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0">
                    Primary Package
                  </div>
                </div>


                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2 text-gray-500 text-[11px] font-bold">
                    <i className="fa-brands fa-whatsapp text-[#1f1f1f] text-lg"></i>
                    <span>+91 {userDetails.whatsapp}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-[11px] font-bold">
                    <i className="fa-solid fa-user text-gray-400"></i>
                    <span>{userDetails.name}</span>
                  </div>
                </div>
              </div>

              {/* Extra Selected Offerings */}
              {(puja?.offerings || []).filter(o => selectedExtraIds.includes(o.id)).map(extra => (
                <div key={extra.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-gray-50 rounded-xl overflow-hidden">
                      <img src={extra.imageUrl} alt={extra.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#1f1f1f]">{extra.name}</h4>
                      <p className="text-[#1f1f1f] font-bold text-sm">{currencySymbol} {getDisplayPrice(extra)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleExtra(extra.id)}
                    className="text-red-500 hover:bg-red-50 h-8 w-8 rounded-full flex items-center justify-center transition-all"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}

              {/* Coupon Code Section */}
              <div className="bg-violet-50/50 rounded-2xl border border-violet-100/50 overflow-hidden">
                <button
                  onClick={() => {
                    if (couponStatus === "applied") { handleRemoveCoupon(); return; }
                    setShowCouponInput(v => !v);
                    setCouponStatus("idle");
                  }}
                  className="w-full flex justify-between items-center p-5 hover:bg-violet-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <TagIcon className="h-5 w-5 text-[#6869F9]" />
                    <div className="text-left">
                      <span className="font-bold text-sm text-[#1f1f1f] block">Apply Coupon Code</span>
                      {couponStatus === "applied" && (
                        <span className="text-[11px] font-bold text-green-600">✓ &quot;{couponCode}&quot; applied — you save {currencySymbol}{couponDiscount}!</span>
                      )}
                    </div>
                  </div>
                  {couponStatus === "applied" ? (
                    <span className="text-[11px] font-bold text-red-500 hover:underline">Remove</span>
                  ) : (
                    <i className={`fa-solid fa-chevron-${showCouponInput ? 'up' : 'down'} text-gray-400 text-xs transition-transform`}></i>
                  )}
                </button>
                {showCouponInput && couponStatus !== "applied" && (
                  <div className="px-5 pb-5 space-y-3 border-t border-violet-100">
                    <div className="flex gap-2 mt-4">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value.toUpperCase());
                            if (couponStatus !== "idle") setCouponStatus("idle");
                          }}
                          onKeyDown={(e) => e.key === "Enter" && couponInput.trim() && handleApplyCoupon()}
                          placeholder="Enter coupon code"
                          className={`w-full border-2 rounded-xl py-3 px-4 text-sm font-bold uppercase tracking-widest outline-none transition-all placeholder:normal-case placeholder:font-normal placeholder:tracking-normal ${couponStatus === "invalid"
                            ? "border-red-400 bg-red-50 text-red-600 focus:border-red-500"
                            : "border-gray-200 bg-white text-[#1f1f1f] focus:border-[#6869F9]"
                            }`}
                        />
                        {couponInput && (
                          <button
                            onClick={() => { setCouponInput(""); setCouponStatus("idle"); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <i className="fa-solid fa-circle-xmark text-sm"></i>
                          </button>
                        )}
                      </div>
                      <button
                        onClick={handleApplyCoupon}
                        disabled={!couponInput.trim()}
                        className="px-5 py-3 bg-[#6869F9] text-white text-sm font-bold rounded-xl hover:bg-[#5657e8] transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        Apply
                      </button>
                    </div>
                    {couponStatus === "invalid" && (
                      <p className="text-[11px] font-bold text-red-500 flex items-center gap-1">
                        <i className="fa-solid fa-circle-exclamation"></i> Invalid coupon code. Please try again.
                      </p>
                    )}
                    <p className="text-[10px] text-gray-400 font-medium">Try: ASTRO10 (10% off) or SAVE50 (₹50 off)</p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-3xl p-5 sm:p-8 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-[#1f1f1f] mb-6 border-b border-gray-50 pb-4">Bill details</h3>
                <div className="space-y-4 text-sm font-medium text-gray-500">
                  <div className="flex justify-between">
                    <span>{selectedPackage?.name}</span>
                    <span className="text-gray-900">{currencySymbol} {selectedPackage ? getDisplayPrice(selectedPackage) : 0}.0</span>
                  </div>
                  {(puja?.offerings || []).filter(o => selectedExtraIds.includes(o.id)).map(extra => (
                    <div key={extra.id} className="flex justify-between">
                      <span>{extra.name}</span>
                      <span className="text-gray-900">{currencySymbol} {getDisplayPrice(extra)}.0</span>
                    </div>
                  ))}
                  {couponStatus === "applied" && couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600 font-bold">
                      <span className="flex items-center gap-1"><TagIcon className="h-3.5 w-3.5" /> Coupon ({couponCode})</span>
                      <span>− {currencySymbol} {couponDiscount}.0</span>
                    </div>
                  )}
                  <div className="pt-6 mt-2 border-t border-gray-100 flex justify-between text-xl font-black text-[#1f1f1f]">
                    <span>Total Amount</span>
                    <span className="text-[#1f1f1f]">{currencySymbol} {totalAmount}.0</span>
                  </div>
                </div>
              </div>

              <div
                className={`mt-4 rounded-2xl p-6 border transition-all cursor-pointer ${agreedToTerms ? 'bg-[#f5f3ff] border-[#6869F9]' : 'bg-white border-gray-200 hover:border-[#6869F9]/40'}`}
                onClick={() => setAgreedToTerms(!agreedToTerms)}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 relative flex items-center justify-center h-5 w-5 shrink-0">
                    <input
                      type="radio"
                      checked={agreedToTerms}
                      readOnly
                      className="peer appearance-none h-5 w-5 rounded-full border-2 border-gray-300 checked:border-[#6869F9] cursor-pointer transition-all"
                    />
                    {agreedToTerms && <div className="absolute h-2.5 w-2.5 rounded-full bg-[#6869F9]"></div>}
                  </div>
                  <p className={`text-[12px] font-medium leading-relaxed transition-colors ${agreedToTerms ? 'text-[#6869F9]' : 'text-gray-600'}`}>
                    I agree to the Terms of Service. My Puja will be conducted with full vedic rites as per the selected package and offerings.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                {reviewCartError && (
                  <div className="mb-4 rounded-xl bg-red-50 p-4 text-center text-sm font-semibold text-red-500 border border-red-200">
                    {reviewCartError}
                  </div>
                )}
                <button
                  onClick={async () => {
                    if (!agreedToTerms) {
                      setToastMsg("Please agree to the Terms of Service to proceed.");
                      setTimeout(() => setToastMsg(""), 3500);
                      return;
                    }
                    setReviewLoading(true);
                    setReviewCartError("");
                    try {
                      const res = await fetch('/api/auth/me');
                      const authData = await res.json();

                      let customerId = 1145090; // Default fallback
                      if (authData.authenticated && authData.user?.customerId) {
                        customerId = Number(authData.user.customerId) || 1145090;
                      }

                      let localCartId = shoppingCartId || "";

                      // Add selected offerings to cart
                      const selectedOfferings = (puja.offerings || []).filter(o => selectedExtraIds.includes(o.id));
                      if (selectedOfferings.length > 0) {
                        for (const offering of selectedOfferings) {
                          const offProductId = offering.productId || 10;
                          const cartRes = await fetch('/api/cart/add', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              customerId,
                              productId: offProductId,
                              quantity: 1,
                              shopName: "AstroVed",
                              variationId: 0,
                              currencyCode: "INR",
                              localeCode: "en-US",
                              freeProductContributionAmount: 0,
                              productSubVariationExternalId: ""
                            })
                          });

                          const cartData = await cartRes.json();
                          if (!cartRes.ok || (cartData.StatusCode !== 200 && cartData.Status !== "OK")) {
                            throw new Error(cartData.Message || `Failed to add "${offering.name}" to cart. Please check its product ID configuration.`);
                          }
                          if (cartData.SelectedListId) {
                            localCartId = String(cartData.SelectedListId);
                          }
                        }
                      }

                      if (localCartId) {
                        setShoppingCartId(localCartId);
                      }

                      const extras = selectedExtraIds.join(',');
                      const sankalpUrl = `/sankalp?amount=${totalAmount}&type=puja&pkg=${selectedPackageId}&name=${encodeURIComponent(userDetails.name)}&wa=${userDetails.whatsapp}&extras=${extras}&title=${encodeURIComponent(puja.title)}&slug=${encodeURIComponent(slug || '')}&shoppingCartId=${localCartId}`;
                      if (!authData.authenticated) {
                        setPendingSankalpUrl(sankalpUrl);
                        setShowLoginModal(true);
                        return;
                      }
                      window.location.href = sankalpUrl;
                    } catch (err: any) {
                      setReviewCartError(err.message || "Connection error. Please try again.");
                    } finally {
                      setReviewLoading(false);
                    }
                  }}
                  className={`flex items-center justify-between p-3 sm:p-4 lg:p-5 rounded-2xl shadow-xl transition-all ${reviewLoading ? 'opacity-70 cursor-not-allowed bg-[#5657e8]' : 'bg-[#6869F9] hover:bg-[#5657e8]'} text-white shadow-[#6869F9]/20 w-full`}
                  disabled={reviewLoading}
                >
                  <div className="flex items-center gap-2 sm:gap-4 text-sm font-bold pl-2 sm:pl-4">
                    <span className="text-left leading-tight">{1 + selectedExtraIds.length} Sevas<br className="sm:hidden" /> <span className="hidden sm:inline">selected</span></span>
                    <span className="opacity-50">•</span>
                    <span className="text-base sm:text-lg">{currencySymbol} {totalAmount}</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 font-bold uppercase tracking-widest text-[11px] sm:text-sm">
                    {reviewLoading ? 'Checking...' : 'Proceed to Book'} <i className="fa-solid fa-arrow-right"></i>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Upsell */}
          {(() => {
            const availableExtras = (puja?.offerings || []).filter(o => !selectedExtraIds.includes(o.id));
            if (availableExtras.length === 0) return null;
            return (
              <div>
                <h3 className="font-bold text-[#1f1f1f] mb-6 flex items-center gap-2">
                  <span className="h-1.5 w-6 bg-[#6869F9] rounded-full"></span>
                  Add more Divine offerings
                </h3>
                <div className="space-y-4">
                  {availableExtras.map(extra => (
                    <div key={extra.id} className={`relative bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-start gap-4 group hover:border-[#6869F9]/30 transition-all ${extra.badge ? 'mt-8' : ''}`}>
                      {extra.badge && (
                        <div className="absolute -top-[26px] left-0 bg-[#fdc59d] text-[#7a3e14] px-3 py-1.5 rounded-t-lg text-[11px] font-bold uppercase flex items-center gap-1.5 shadow-sm border border-[#fdc59d]">
                          <i className="fa-solid fa-box"></i> {extra.badge}
                        </div>
                      )}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <h4 className="font-bold text-[14px] text-[#1f1f1f] leading-snug">{extra.name}</h4>
                        {extra.description && (
                          <p className="text-gray-600 text-[12px] mt-1.5 leading-relaxed line-clamp-3">{extra.description}</p>
                        )}
                        <p className="text-[#6869F9] font-bold text-[15px] mt-2">{currencySymbol}{getDisplayPrice(extra)}</p>
                      </div>
                      <div className="flex flex-col items-center gap-2.5 shrink-0">
                        <div className="h-20 w-20 rounded-xl overflow-hidden bg-gray-50 shadow-sm border border-gray-100">
                          <img src={extra.imageUrl} className="w-full h-full object-cover" />
                        </div>
                        <button
                          onClick={() => toggleExtra(extra.id)}
                          className="bg-white text-[#6869F9] border border-[#6869F9] h-7 px-4 rounded-md text-[12px] font-bold flex items-center gap-1 hover:bg-[#5657e8] hover:text-white transition-all active:scale-95 shadow-sm"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Login Modal for booking flow */}
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => {
            setShowLoginModal(false);
            if (pendingSankalpUrl) {
              window.location.href = pendingSankalpUrl;
            }
          }}
        />
        {/* Custom Toast Notification */}
        {toastMsg && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-[90vw] max-w-md bg-gray-900 text-white px-5 py-4 rounded-xl text-sm font-bold shadow-[0_10px_40px_rgba(0,0,0,0.3)] flex items-start sm:items-center gap-3 transition-all duration-300 animate-[bounce_0.4s_ease-out]">
            <i className="fa-solid fa-circle-exclamation text-[#f59e0b] mt-0.5 sm:mt-0"></i>
            <span className="leading-snug">{toastMsg}</span>
          </div>
        )}

        {/* Custom Exit Confirmation Modal */}
        {showExitConfirm && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-[modalIn_0.2s_ease-out]">
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-red-100 text-red-500 flex items-center justify-center mb-4">
                  <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2">Wait, are you sure?</h3>
                <p className="text-sm text-gray-500 mb-6 font-medium leading-relaxed">
                  Are you sure you want to go back? Your current selections will be preserved.
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setShowExitConfirm(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                  >
                    No, Stay
                  </button>
                  <button
                    onClick={() => {
                      setShowExitConfirm(false);
                      setShowReviewModal(false);
                    }}
                    className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
                  >
                    Yes, Go Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pb-24">
        {loading ? (
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-16 sm:py-20 text-center text-[#1f1f1f]">Loading puja details...</div>
        ) : !puja ? (
          <div className="mx-auto max-w-[1440px] px-6 py-20 text-center">
            <h1 className="text-3xl font-bold text-[#3b0764]">Puja not found</h1>
            <Link href="/puja" className="mt-6 inline-block rounded-xl bg-[#6869F9] px-6 py-3 text-sm font-semibold text-white">
              Back to Pujas
            </Link>
          </div>
        ) : (
          <>
            {/* -- Breadcrumb (sticky below navbar, full-width) -- */}
            <nav
              className="w-full bg-[#f5f3ff] border-b border-[#ddd6fe] sticky top-[56px] sm:top-[60px] z-30"
            >
              <div className="w-full px-4 sm:px-6 lg:px-8 py-3 text-[12px] sm:text-[13px] font-medium text-gray-500 flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar">
                <Link href="/" className="hover:text-gray-800 transition-colors shrink-0 whitespace-nowrap">Home</Link>
                <svg className="w-3 h-3 text-gray-400 shrink-0 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
                <Link href="/puja" className="hover:text-gray-800 transition-colors shrink-0 whitespace-nowrap">AstroVed Puja Seva</Link>
                <svg className="w-3 h-3 text-gray-400 shrink-0 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-[#1f1f1f] font-bold truncate min-w-0">{puja.title}</span>
              </div>
            </nav>

            {/* -- Hero -- */}
            <div className="mx-auto max-w-[1440px] px-3 py-4 sm:px-4 sm:py-6 md:px-6">
              <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-[1.1fr_0.9fr]">
                {/* Left: Image Carousel */}
                <div className="relative overflow-hidden rounded-2xl group cursor-pointer" onClick={() => setShowGallery(true)}>
                  <img src={images[currentImageIndex]} alt={puja.title} className="h-[240px] sm:h-[320px] md:h-[400px] lg:h-[450px] w-full object-cover object-center transition-opacity duration-300" />

                  {/* Top Left Badge */}
                  {puja.badge && (
                    <div className="absolute left-4 top-4">
                      <span className="inline-flex items-center rounded-lg bg-[#ffc107] px-4 py-1.5 text-[13px] font-bold text-[#1f1f1f] shadow-sm">
                        {puja.badge}
                      </span>
                    </div>
                  )}

                  {/* Navigation Arrows */}
                  {images.length > 1 && (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); handlePrevImage(); }} className="absolute left-3 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-20">
                        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleNextImage(); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-20">
                        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                      </button>

                      {/* Dots */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`h-2 w-2 rounded-full transition-all ${idx === currentImageIndex ? "bg-[#6869F9] w-4" : "bg-white/60 hover:bg-white/80"}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Right: Details panel */}
                <div className="flex flex-col justify-center">
                  <p className="text-[#6869F9] text-[11px] font-bold uppercase tracking-widest mb-2">
                    {puja.subtitle || "SPECIAL PUJA & YAGYA"}
                  </p>

                  <h1 className="text-[22px] md:text-[26px] font-bold leading-snug text-[#1f1f1f] mb-3">
                    {puja.title}
                  </h1>

                  <p className="text-[15px] font-medium text-gray-600 mb-5 leading-relaxed">
                    {puja.description || "Join us for this sacred ritual to seek divine blessings."}
                  </p>

                  <div className="flex flex-col gap-2.5 mb-5">
                    <div className="flex items-start gap-2.5 text-[13px] text-gray-500 font-medium">
                      <svg className="w-[16px] h-[16px] text-[#a78bfa] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <span className="leading-tight">{puja.location || puja.details?.templeLocation || "Sacred Temple, India"}</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-[13px] text-gray-500 font-medium">
                      <svg className="w-[16px] h-[16px] text-[#a78bfa] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="leading-tight">{puja.date || "Upcoming Auspicious Date"}</span>
                    </div>
                  </div>

                  {/* Countdown */}
                  {!countdown.expired && (
                    <div className="mb-5 border-t border-gray-100 pt-4">
                      <p className="text-[13px] font-bold text-[#1f1f1f] mb-2">Puja booking will close in :</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-[22px] font-bold text-[#6869F9]">{String(countdown.days)}</span>
                        <span className="text-[11px] font-medium text-[#6869F9] uppercase mr-2">Day</span>

                        <span className="text-[22px] font-bold text-[#6869F9]">{String(countdown.hours)}</span>
                        <span className="text-[11px] font-medium text-[#6869F9] uppercase mr-2">Hours</span>

                        <span className="text-[22px] font-bold text-[#6869F9]">{String(countdown.minutes)}</span>
                        <span className="text-[11px] font-medium text-[#6869F9] uppercase mr-2">Mins</span>

                        <span className="text-[22px] font-bold text-[#6869F9]">{String(countdown.seconds)}</span>
                        <span className="text-[11px] font-medium text-[#6869F9] uppercase">Secs</span>
                      </div>
                    </div>
                  )}
                  {countdown.expired && (
                    <p className="mb-5 rounded-lg bg-red-50 px-4 py-2 text-xs font-semibold text-red-600">
                      This puja has already been conducted.
                    </p>
                  )}

                  {/* Avatars + Devotees count */}
                  <div className="flex items-center justify-between mb-4 border-t border-gray-100 pt-5">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map((i) => (
                          <img key={i} className="w-7 h-7 rounded-full border-2 border-white object-cover" src={`https://i.pravatar.cc/150?img=${i + 10}`} alt="devotee" />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[12px] font-bold text-[#a78bfa]">
                      <StarIcon className="h-4 w-4 text-amber-400" /> 4.9 (7K+ ratings)
                    </div>
                  </div>

                  <p className="text-[13px] text-gray-500 leading-relaxed mb-6">
                    Till now <span className="font-bold text-[#6869F9]">3,00,000+ Devotees</span> have participated in Pujas conducted by AstroVed Puja Seva.
                  </p>

                  {/* CTA */}
                  {countdown.expired ? (
                    <button disabled className="hidden md:flex w-full items-center justify-center rounded-lg bg-gray-300 py-3.5 text-[16px] font-bold text-white cursor-not-allowed">
                      Puja is Over
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowPackageModal(true)}
                      className="hidden md:flex w-full items-center justify-center gap-2 rounded-lg bg-[#6869F9] py-3.5 text-[16px] font-bold text-white hover:bg-[#6869F9] transition-colors"
                    >
                      Select puja package
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>



            {/* -- Section Nav Bar (sticky: navbar + breadcrumb height) -- */}
            {/*  navbar ~56–60px + breadcrumb ~44px = 100–104px             */}
            <div className="sticky top-[100px] sm:top-[104px] z-20 bg-white border-b border-gray-200 shadow-sm">
              <div className="w-full px-4 sm:px-6 lg:px-8">
                {/* justify-between spreads tabs evenly edge-to-edge */}
                <div className="flex items-center overflow-x-auto no-scrollbar w-full justify-between gap-1">
                  {sectionTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        isManualScrollingRef.current = true;
                        setActiveTab(tab.id);
                        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                        scrollTimeoutRef.current = setTimeout(() => {
                          isManualScrollingRef.current = false;
                        }, 800);

                        const el = document.getElementById(tab.id);
                        if (el) {
                          const offset = 160;
                          const top = el.getBoundingClientRect().top + window.scrollY - offset;
                          window.scrollTo({ top, behavior: 'smooth' });
                        }
                      }}
                      className={`relative flex-1 text-center py-3 sm:py-[14px] px-2 sm:px-3 text-[11px] sm:text-[13px] lg:text-[14px] font-semibold whitespace-nowrap transition-colors ${activeTab === tab.id
                        ? 'text-[#6869F9]'
                        : 'text-gray-500 hover:text-[#6869F9]'
                        }`}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#6869F9] rounded-t-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mx-auto max-w-[1440px] px-3 sm:px-4 md:px-6 pt-6 sm:pt-10">
              {currentSectionOrder.map((sectionId) => {
                if (sectionId === "about") {
                  return (
                    <section id="about" key="about" className="border-b border-gray-100 pb-8 sm:pb-10">
                      <h2 className="flex items-start gap-3 text-[20px] sm:text-[24px] font-bold text-[#1f1f1f] leading-snug">
                        <SparklesIcon className="mt-1 h-7 w-7 shrink-0 text-[#6869F9]" />
                        <span>{puja.details?.heroTitle || "Sacred Havan for victory and peace."}</span>
                      </h2>
                      <div className="mt-6 space-y-6 text-[16px] leading-[1.9] text-gray-700">
                        <p>{puja.details.about || "In Sanatan Dharma, this puja is highly powerful for pacifying negative energies."}</p>

                        <div className="space-y-2">
                          <p className="font-bold text-gray-900 text-[17px] flex items-center gap-2"><BuildingLibraryIcon className="h-5 w-5 text-[#a78bfa]" /> Significance of Temple</p>
                          <p>Located in this sacred land, it is considered highly powerful and spiritually significant for worship.</p>
                        </div>

                        <div className="space-y-2">
                          <p className="font-bold text-gray-900 text-[17px] flex items-center gap-2"><FireIcon className="h-5 w-5 text-[#a78bfa]" /> Significance of this Havan</p>
                          <p>The main highlight of this puja is the special havan performed. It represents the burning away of obstacles.</p>
                        </div>
                      </div>
                    </section>
                  );
                }

                if (sectionId === "benefits") {
                  return (
                    <section id="benefits" key="benefits" className="border-b border-gray-100 py-8 sm:py-10">
                      <h2 className="text-[20px] sm:text-[24px] font-bold text-[#1f1f1f]">Puja Benefits</h2>
                      <div className="mt-6 sm:mt-8 grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {puja.details.benefits.map((b, idx) => (
                          <div key={`benefit-${idx}`} className="flex gap-4">
                            <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-[#ede9fe] text-[#6869F9] text-xl">
                              {(() => {
                                const BenefitIcon = BENEFIT_ICONS[idx % BENEFIT_ICONS.length];
                                return <BenefitIcon className="h-5 w-5" />;
                              })()}
                            </div>
                            <div>
                              <h3 className="font-bold text-[#1f1f1f] text-[17px]">{b.title}</h3>
                              <p className="mt-2 text-[15px] leading-[1.8] text-gray-600 line-clamp-3">{b.description}</p>
                              <button type="button" className="mt-2 text-[14px] font-semibold text-[#6869F9] hover:text-[#5b21b6]">Read more</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                }

                if (sectionId === "process") {
                  return (
                    <section id="process" key="process" className="border-b border-gray-100 py-8 sm:py-10">
                      <h2 className="text-[20px] sm:text-[24px] font-bold text-[#1f1f1f]">Puja Process</h2>
                      <div className="mt-6 sm:mt-8 grid gap-x-6 sm:gap-x-8 gap-y-8 sm:gap-y-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        {puja.details.process.map((step, idx) => (
                          <div key={`process-${idx}`} className="flex gap-3 items-start">
                            <div
                              className="flex h-6 w-8 shrink-0 items-center justify-center bg-[#6869F9] text-[13px] font-bold text-white shadow-sm pr-1 mt-0.5"
                              style={{ clipPath: 'polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%)' }}
                            >
                              {idx + 1}
                            </div>
                            <div>
                              <h3 className="font-bold text-[#1f1f1f] text-[15px] mb-1.5">{step.title}</h3>
                              <p className="text-[14px] leading-[1.6] text-gray-500">{step.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                }

                if (sectionId === "temple") {
                  return (
                    <section id="temple" key="temple" className="border-b border-gray-100 py-8 sm:py-10">
                      <h2 className="text-[18px] sm:text-[24px] font-bold text-gray-900 leading-snug">{puja.details.templeName}, {puja.details.templeLocation}</h2>
                      <div className="mt-6 grid gap-6 sm:gap-8 lg:grid-cols-[1fr_1.5fr]">
                        <img src={puja.imageUrl} alt={puja.details.templeName} className="h-48 sm:h-64 w-full rounded-2xl object-cover shadow-sm" />
                        <div className="space-y-4 text-[16px] leading-[1.9] text-gray-700 text-justify">
                          <p>{puja.details.templeNote || "This temple is known for powerful prosperity rituals and ancient worship traditions."}</p>
                          <p>{puja.details.about}</p>
                          <p>Devotees believe prayers offered here remove obstacles, invite abundance, and support career, finance, and family harmony.</p>
                        </div>
                      </div>
                    </section>
                  );
                }

                if (sectionId === "packages") {
                  return (
                    <React.Fragment key="packages">
                      {/* -- All Packages Includes -- */}
                      <section className="border-b border-gray-100 py-8 sm:py-10">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">All Puja Packages includes</h2>
                        <div className="mt-6 grid gap-3 sm:gap-4 sm:grid-cols-2">
                          {puja.details.inclusions.map((item, idx) => (
                            <div key={`incl-${idx}`} className="flex items-start gap-3">
                              <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f8f7ff] border border-[#6869F9]/20">
                                <CheckIcon className="h-3 w-3 text-[#1f1f1f]" />
                              </div>
                              <p className="text-sm leading-6 text-gray-700 font-medium">{item}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-6 flex items-start gap-3 rounded-xl bg-[#f5f3ff] border border-[#ddd6fe] p-4 text-[#5b21b6]">
                          <GiftIcon className="mt-0.5 h-6 w-6 shrink-0 text-[#1f1f1f]" />
                          <p className="text-sm font-semibold leading-6">Opt for additional offerings like Vastra Daan, Anna Daan, Deep Daan, or Gau Seva in your name, available on the payments page.</p>
                        </div>
                      </section>

                      {/* -- Package Selection -- */}
                      <section id="packages" className="border-b border-gray-100 py-8 sm:py-10">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Select your puja package</h2>
                        {/* Desktop Package Grid — 4-column with themed colors */}
                        <div className="hidden md:grid mt-6 sm:mt-8 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
                          {puja.packages.map((pkg, idx) => {
                            const isSelected = selectedPackage?.id === pkg.id;
                            const themes = [
                              { border: "#d95a2b", priceColor: "#d95a2b", badgeBg: "#FFF0E0", badgeText: "#C25000", radioBg: "#d95a2b", cardBg: "#fffaf8" },
                              { border: "#D22B75", priceColor: "#D22B75", badgeBg: "#FCE4EF", badgeText: "#9D174D", radioBg: "#D22B75", cardBg: "#FFF8FB" },
                              { border: "#4F6B20", priceColor: "#4F6B20", badgeBg: "#E8F2D4", badgeText: "#3A5018", radioBg: "#4F6B20", cardBg: "#F9FBF5" },
                              { border: "#836814", priceColor: "#836814", badgeBg: "#F5EECF", badgeText: "#5C4910", radioBg: "#836814", cardBg: "#FDFAF2" },
                            ];
                            const personLabels = ["1 Person", "2 Person", "4 Person", "6 Person"];
                            const theme = themes[idx] || themes[0];
                            const badgeLabel = personLabels[idx] ?? `${idx + 1} Person`;
                            return (
                              <button
                                key={`pkg-${pkg.id}-${idx}`}
                                type="button"
                                onClick={() => setSelectedPackageId(pkg.id)}
                                style={{
                                  borderColor: isSelected ? theme.border : "#e5e7eb",
                                  backgroundColor: isSelected ? theme.cardBg : "#ffffff",
                                }}
                                className={`relative flex flex-col rounded-2xl border-2 text-left transition-all duration-300 ${isSelected ? "shadow-lg -translate-y-1" : "hover:shadow-md"}`}
                              >
                                <div className="flex flex-1 flex-col p-5">
                                  {/* Person badge + radio */}
                                  <div className="flex items-center justify-between">
                                    <span
                                      className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold"
                                      style={{ backgroundColor: theme.badgeBg, color: theme.badgeText }}
                                    >
                                      <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                                        <path d="M8 8a3 3 0 100-6 3 3 0 000 6zm-5 6a5 5 0 0110 0H3z" />
                                      </svg>
                                      {badgeLabel}
                                    </span>
                                    <div
                                      className="flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors"
                                      style={{
                                        borderColor: isSelected ? theme.radioBg : "#d1d5db",
                                        backgroundColor: isSelected ? theme.radioBg : "transparent",
                                      }}
                                    >
                                      {isSelected && <CheckIcon className="h-3 w-3 text-white" />}
                                    </div>
                                  </div>
                                  {/* Name + image row */}
                                  <div className="mt-4 flex items-end justify-between gap-3 w-full min-w-0">
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-bold text-gray-900 leading-snug wrap-break-word">{pkg.name}</h4>
                                      <p className="text-sm text-gray-600 mt-1 line-clamp-3 wrap-break-word">
                                        {pkg.description || "Recommended for devotees."}
                                      </p>
                                      <div className="mt-3">
                                        <span className="text-base font-black" style={{ color: theme.priceColor }}>{currencySymbol} {getDisplayPrice(pkg)}</span>
                                      </div>
                                    </div>
                                    <img
                                      src={pkg.imageUrl || puja.imageUrl}
                                      alt={pkg.name}
                                      className="h-20 w-20 shrink-0 rounded-xl object-cover object-top shadow-sm"
                                    />
                                  </div>
                                </div>
                                {isSelected && (
                                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-white border-b-2 border-r-2 rotate-45 z-10" style={{ borderColor: theme.border }}></div>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Mobile Package Grid */}
                        <div className="flex md:hidden flex-col gap-4 mt-6">
                          {puja.packages.map((pkg, idx) => {
                            const isSelected = selectedPackage?.id === pkg.id;
                            const badgeLabel = PERSON_LABELS[idx] ?? `${idx + 1} Person`;
                            const personColor = idx === 0 ? "bg-[#d95a2b] text-white" : (idx === 1 ? "bg-[#fce4eb] text-[#a51d4e]" : "bg-[#f0f4eb] text-[#3c5a14]");

                            return (
                              <div
                                key={`pkg-mob-${pkg.id}`}
                                onClick={() => setSelectedPackageId(pkg.id)}
                                className={`rounded-xl border ${isSelected ? "border-[#d95a2b] bg-[#fffaf8]" : "border-gray-200 bg-white"} overflow-hidden transition-all duration-300 relative cursor-pointer shadow-sm`}
                              >
                                <div className="p-4 flex gap-4">
                                  {/* Left side: Image + Tag */}
                                  <div className="flex flex-col items-center w-[84px] shrink-0">
                                    <div className="w-full aspect-square rounded-lg overflow-hidden relative">
                                      <img src={pkg.imageUrl || puja.imageUrl} className="w-full h-full object-cover" alt={pkg.name} />
                                    </div>
                                    <div className={`mt-2 text-[10px] font-bold px-2 py-1 rounded flex items-center justify-center whitespace-nowrap w-full ${personColor}`}>
                                      <i className="fa-regular fa-user text-[9px] mr-1"></i> {badgeLabel}
                                    </div>
                                  </div>

                                  {/* Right side: Text + Radio */}
                                  <div className="flex-1 flex flex-col justify-center">
                                    <div className="flex justify-between items-start">
                                      <h4 className="font-bold text-[#1f1f1f] text-[15px] leading-tight pr-2">{pkg.name}</h4>
                                      {isSelected ? (
                                        <div className="w-[22px] h-[22px] rounded-full bg-[#d95a2b] flex items-center justify-center shrink-0">
                                          <CheckIcon className="w-3.5 h-3.5 text-white stroke-[2]" />
                                        </div>
                                      ) : (
                                        <div className="w-[22px] h-[22px] rounded-full border border-gray-300 shrink-0"></div>
                                      )}
                                    </div>
                                    <p className="text-[13px] text-gray-500 mt-1.5">{pkg.description || `For ${badgeLabel.split(' ')[0]} People`}</p>
                                    <p className="text-[16px] text-[#d95a2b] font-medium mt-1">{currencySymbol}{getDisplayPrice(pkg)}</p>
                                  </div>
                                </div>

                                {/* Participate Button for Active Package */}
                                {isSelected && (
                                  <div className="px-4 pb-4 pt-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (selectedPackageId) {
                                          if (isIndian) {
                                            setShowDetailsModal(true);
                                          } else {
                                            handleAddPujaToCart();
                                          }
                                        }
                                      }}
                                      className="w-full bg-[#d95a2b] text-white py-[13px] rounded-lg font-bold text-[14px] shadow-sm active:scale-95 transition-transform uppercase tracking-wide"
                                    >
                                      PARTICIPATE
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Expanded Description Section for Selected Package */}
                        {selectedPackage && (
                          <div className="mt-6 rounded-xl border border-[#ddd6fe] bg-[#f5f3ff] p-5">
                            <h4 className="text-sm font-bold text-[#5b21b6]">{selectedPackage.name}</h4>
                            <div className="mt-3 space-y-2">
                              <div className="flex items-start gap-2">
                                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#5b21b6]" />
                                <p className="text-xs leading-5 text-gray-600">Our temple Pandit Ji recommends this package as the sacred puja invokes powerful blessings.</p>
                              </div>
                              <div className="flex items-start gap-2">
                                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#5b21b6]" />
                                <p className="text-xs leading-5 text-gray-600">With dedicated mantra chanting and sacred offerings, this ritual helps remove life challenges.</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Inline Proceed Bar */}
                        {selectedPackage && (
                          <div className="hidden md:grid mt-6 sm:mt-8 grid-cols-1 sm:grid-cols-2 rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50">
                            <div className="flex items-center overflow-hidden border-b sm:border-b-0 sm:border-r border-gray-100">
                              <Marquee scrollamount="4" className="text-[#64748b] whitespace-nowrap text-[13px] font-bold py-4">
                                <i className="fa-solid fa-shield-halved mr-1"></i> Guarantee &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <i className="fa-solid fa-shield mr-1"></i> No Hidden Cost &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <i className="fa-solid fa-certificate mr-1"></i> ISO 9001 Certified Company &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <i className="fa-solid fa-place-of-worship mr-1"></i> Official Temple Partner &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <i className="fa-solid fa-shield-halved mr-1"></i> Guarantee &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <i className="fa-solid fa-shield mr-1"></i> No Hidden Cost
                              </Marquee>
                            </div>
                            <button
                              onClick={() => {
                                if (selectedPackageId) {
                                  if (isIndian) {
                                    setShowDetailsModal(true);
                                  } else {
                                    handleAddPujaToCart();
                                  }
                                }
                              }}
                              className="bg-[#6869F9] text-white px-6 py-4 flex items-center justify-between w-full transition-colors hover:bg-[#5657e8] active:bg-[#4b4cdb]"
                            >
                              <div className="flex flex-col items-start text-left">
                                <span className="font-bold text-xl">{currencySymbol} {getDisplayPrice(selectedPackage)}</span>
                                <span className="text-[11px] font-semibold opacity-90 truncate max-w-[200px]">{selectedPackage.name}</span>
                              </div>
                              <div className="flex items-center gap-2 font-bold text-[15px]">
                                Proceed <i className="fa-solid fa-arrow-right"></i>
                              </div>
                            </button>
                          </div>
                        )}
                      </section>
                    </React.Fragment>
                  );
                }

                if (sectionId === "reviews") {
                  const REVIEWS_PAGE_SIZE = 3;
                  const videoReviews = dbReviews.filter(r => r.type === "video" || r.videoUrl);
                  const textCarouselReviews = dbReviews.filter(r => !r.videoUrl);
                  const carouselReviews = [...videoReviews, ...textCarouselReviews];
                  const userReviewsList = dbReviews.slice(0, reviewsShown);

                  return (
                    <section id="reviews" key="reviews" className="border-b border-gray-100 py-8 sm:py-10">
                      {/* Header */}
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Reviews &amp; Ratings</h2>
                      <p className="mt-1 text-sm text-gray-500">Read to what our beloved devotees have to say about AstroVed.</p>

                      {dbReviews.length === 0 ? (
                        <p className="mt-8 text-sm text-gray-400 italic">No reviews yet.</p>
                      ) : (
                        <>
                          {/* ── Carousel ── */}
                          {carouselReviews.length > 0 && (
                            <div className="mt-6 relative">
                              <div ref={carouselRef} className="flex gap-4 overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory">
                                {carouselReviews.map((review, idx) => (
                                  <div key={review._id || idx} className="snap-center shrink-0 w-[320px]">
                                    {review.videoUrl ? (
                                      <div className="w-full h-[220px] rounded-xl overflow-hidden bg-black shadow-sm">
                                        <video src={review.videoUrl} controls className="w-full h-full object-cover" />
                                      </div>
                                    ) : (
                                      <div className="w-full h-[220px] rounded-xl bg-white border border-gray-200 shadow-sm p-5 flex items-center overflow-hidden">
                                        <p className="text-[14px] text-gray-700 italic leading-relaxed line-clamp-6">
                                          {review.content}
                                        </p>
                                      </div>
                                    )}
                                    {/* name + service */}
                                    <div className="mt-4 flex items-center gap-3 px-1">
                                      <div className="min-w-0">
                                        <p className="text-[13px] font-bold text-gray-800 truncate">{review.name}</p>
                                        {review.service && (
                                          <p className="text-[12px] text-gray-400 truncate">{review.service}</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Dots */}
                              <div className="mt-6 flex justify-center items-center gap-6">
                                <button onClick={() => scrollCarousel('left')} className="h-10 w-10 rounded-full bg-[#6869F9] text-white flex items-center justify-center hover:bg-[#5657e8] hover:shadow-lg transition-all duration-200 active:scale-95 shadow-md">
                                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 rotate-180"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg>
                                </button>
                                <div className="flex gap-2">
                                  {carouselReviews.slice(0, Math.min(carouselReviews.length, 4)).map((_, i) => (
                                    <div key={i} className={`rounded-full transition-all ${i === activeCarouselDot ? "w-4 h-2.5 bg-[#6869F9]" : "w-2.5 h-2.5 bg-gray-300"}`} />
                                  ))}
                                </div>
                                <button onClick={() => scrollCarousel('right')} className="h-10 w-10 rounded-full bg-[#6869F9] text-white flex items-center justify-center hover:bg-[#5657e8] hover:shadow-lg transition-all duration-200 active:scale-95 shadow-md">
                                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg>
                                </button>
                              </div>
                            </div>
                          )}


                        </>
                      )}
                    </section>
                  );
                }

                if (sectionId === "faqs") {
                  const REVIEWS_PAGE_SIZE = 3;
                  const textReviews = dbReviews.filter(r => !r.videoUrl);
                  const userReviewsList = textReviews.slice(0, reviewsShown);

                  return (
                    <React.Fragment key="faqs">
                      <section id="faqs" className="py-8 sm:py-10 border-b border-gray-100">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
                        <div className="mt-6 divide-y divide-gray-100">
                          {puja.details.faq.map((item, idx) => (
                            <details key={`faq-${idx}`} className="group py-5">
                              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-gray-900">
                                {item.question}
                                <span className="ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-50 border border-gray-200 text-xs text-gray-500 group-open:bg-[#f8f7ff] group-open:text-[#1f1f1f] group-open:border-[#6869F9]/20 transition-colors">+</span>
                              </summary>
                              <p className="mt-3 text-sm leading-7 text-gray-600 pl-2 border-l-2 border-[#6869F9]/20">{item.answer}</p>
                            </details>
                          ))}
                        </div>
                      </section>

                      {/* ── User Reviews (Text Only) ── */}
                      {textReviews.length > 0 && (
                        <section className="py-10">
                          <h3 className="text-xl font-bold text-gray-900">User Reviews</h3>
                          <p className="mt-1 text-sm text-gray-500">Reviews from our devotees who booked Puja with us</p>

                          <div className="mt-6 space-y-4">
                            {userReviewsList.map((review, idx) => (
                              <div key={review._id || idx} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                {/* Name + Date */}
                                <div className="flex items-center gap-4">
                                  <div className="flex-1">
                                    <p className="text-base font-bold text-gray-900">{review.name}</p>
                                    {review.createdAt && (
                                      <p className="text-[12px] text-gray-400 mt-0.5">
                                        {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                      </p>
                                    )}
                                    {review.service && (
                                      <p className="text-[12px] text-gray-500 mt-0.5 truncate">{review.service}</p>
                                    )}
                                  </div>
                                </div>

                                {/* Stars */}
                                {review.rating && (
                                  <div className="mt-3 flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map(star => (
                                      <svg key={star} viewBox="0 0 20 20" className={`h-5 w-5 ${star <= Number(review.rating) ? "text-[#6869F9]" : "text-gray-200"}`} fill="currentColor">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    ))}
                                  </div>
                                )}

                                {/* Content */}
                                <p className="mt-3 text-base leading-7 text-gray-700">{review.content}</p>
                              </div>
                            ))}
                          </div>

                          {/* View More */}
                          {reviewsShown < textReviews.length && (
                            <div className="mt-6 flex justify-center">
                              <button
                                onClick={() => setReviewsShown(prev => prev + REVIEWS_PAGE_SIZE)}
                                className="border border-gray-300 text-gray-700 px-20 py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors rounded"
                              >
                                View More
                              </button>
                            </div>
                          )}
                        </section>
                      )}
                    </React.Fragment>
                  );
                }

                if (sectionId === "recommendations" && recommendations && recommendations.length > 0) {
                  return (
                    <React.Fragment key="recommendations">
                      <section id="recommendations" className="py-12 border-t border-gray-100 mt-8">
                        <h2 className="text-2xl font-serif text-gray-900 mb-6 font-bold">Recommendations</h2>
                        <div className="flex overflow-x-auto gap-4 pb-4 custom-scrollbar">
                          {recommendations.slice(0, 5).map((rec: any, idx: number) => (
                            <div key={idx} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow shrink-0 w-[280px] flex flex-col">
                              <div className="h-[160px] relative">
                                <img src={rec.imageUrl || 'https://images.unsplash.com/photo-1601024445121-e5b82f020549'} alt={rec.title} className="w-full h-full object-cover" />
                              </div>
                              <div className="p-4 flex flex-col flex-1">
                                <h3 className="font-bold text-gray-900 leading-snug min-h-[44px]">{rec.title}</h3>
                                <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                  <span className="text-red-400">📍</span> {rec.location || rec.templeLocation || 'Vaidika Yagashala'}
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                  <div className="font-bold text-gray-900">₹{rec.packages?.[0]?.priceINR || rec.packages?.[0]?.price || '516'}</div>
                                  <Link href={`/homa/${rec.slug}`} className="bg-[#009e5b] text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-[#008c51]">
                                    BOOK NOW
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    </React.Fragment>
                  );
                }

                return null;
              })}
            </div>
          </>
        )}

        {/* Global sticky bar removed in favor of inline proceed bar */}

      </main>

      {/* Package Selection Modal */}
      {showPackageModal && puja && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-sm">
          <div className="relative flex h-[92vh] sm:h-full max-h-[92vh] sm:max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl">
            {/* Close Button */}
            <div className="absolute right-4 top-4 z-10">
              <button onClick={() => setShowPackageModal(false)} className="rounded-full p-2 hover:bg-gray-100 transition-colors">
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pt-10 sm:pt-12">

              {/* All Puja Packages includes */}
              <div className="px-4 sm:px-6 mb-6">
                <h2 className="text-[20px] font-bold text-[#1f1f1f] mb-4">All Puja Packages includes</h2>
                <div className="space-y-3 mb-5">
                  {[
                    "The participant's name and gotra will be recited by an experienced Panditji during the puja.",
                    "Participants will receive guided mantras and step-by-step instructions to join the puja from home.",
                    "A complete video of the puja and offerings will be shared on your WhatsApp.",
                    "A free Aashirwad Box with Tirth Prasad will be delivered to your home if you opt in to receive it."
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-[#6869F9]/10 flex items-center justify-center">
                        <CheckIcon className="h-3 w-3 text-[#6869F9]" />
                      </div>
                      <p className="text-[13px] leading-relaxed text-[#4b5563] font-medium">{item}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-[#fff8f0] border border-[#fde8cc] p-3.5">
                  <i className="fa-solid fa-hand-holding-dollar text-[#e07c2a] text-lg shrink-0 mt-0.5"></i>
                  <p className="text-[12px] font-semibold leading-relaxed text-[#c25e0e]">Opt for additional offerings like Vastra Daan, Anna Daan, Deep Daan, or Gau Seva in your name, available on the payments page.</p>
                </div>
              </div>

              <div className="px-4 sm:px-6 mb-4">
                <h3 className="text-[17px] font-bold text-[#1f1f1f]">Select your puja package</h3>
              </div>


              {/* ── MOBILE: Vertical Card List with per-package theme colors ── */}
              <div className="md:hidden flex flex-col gap-3 px-4">
                {(() => {
                  const displayPackages = [...puja.packages];
                  if (displayPackages.length === 3) {
                    displayPackages.push({
                      id: 'family-bhog',
                      name: 'Family Puja + Bhog',
                      price: Math.round((displayPackages[2]?.price || 1000) * 1.5),
                      description: 'Family sankalp with bhog offering and temple archana included.'
                    });
                  }

                  // Per-package theme colors matching Sri Mandir exactly
                  const themes = [
                    {
                      border: "#FF7A00", imageBg: "#FFF5EC", priceColor: "#FF7A00",
                      badgeBg: "#FFF0E0", badgeText: "#C25000",
                      radioBorder: "#FF7A00", radioBg: "#FF7A00",
                      participateBg: "#FF7A00", participateHover: "#E06900",
                      cardBg: "#FFFAF5",
                    },
                    {
                      border: "#D22B75", imageBg: "#FFF0F5", priceColor: "#D22B75",
                      badgeBg: "#FCE4EF", badgeText: "#9D174D",
                      radioBorder: "#D22B75", radioBg: "#D22B75",
                      participateBg: "#D22B75", participateHover: "#B02266",
                      cardBg: "#FFF8FB",
                    },
                    {
                      border: "#4F6B20", imageBg: "#F4F8EC", priceColor: "#4F6B20",
                      badgeBg: "#E8F2D4", badgeText: "#3A5018",
                      radioBorder: "#4F6B20", radioBg: "#4F6B20",
                      participateBg: "#4F6B20", participateHover: "#3D5519",
                      cardBg: "#F9FBF5",
                    },
                    {
                      border: "#836814", imageBg: "#FAF7ED", priceColor: "#836814",
                      badgeBg: "#F5EECF", badgeText: "#5C4910",
                      radioBorder: "#836814", radioBg: "#836814",
                      participateBg: "#836814", participateHover: "#6A530F",
                      cardBg: "#FDFAF2",
                    },
                  ];
                  const personLabels = ["1 Person", "2 Person", "4 Person", "6 Person"];
                  const personSubtitles = ["Package for 1 Person", "Package for 2 People", "Package for 4 People", "Package for upto 6 People"];

                  return displayPackages.map((pkg, idx) => {
                    const isSelected = selectedPackageId === pkg.id;
                    const theme = themes[idx] || themes[0];
                    const personLabel = personLabels[idx] || "1 Person";
                    const personSubtitle = pkg.description || personSubtitles[idx] || "Package";
                    const imageUrl = pkg.imageUrl || puja.imageUrl || "https://images.unsplash.com/photo-1601024445121-e5b82f020549?auto=format&fit=crop&w=150&q=80";

                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPackageId(pkg.id)}
                        style={{
                          borderColor: isSelected ? theme.border : "#e5e7eb",
                          borderWidth: isSelected ? "2px" : "1px",
                          backgroundColor: isSelected ? theme.cardBg : "#ffffff",
                        }}
                        className="relative rounded-2xl border cursor-pointer transition-all duration-200 overflow-hidden shadow-sm"
                      >
                        {/* Main card row */}
                        <div className="flex items-start gap-0">
                          {/* Left image section with no explicit bg (relies on card bg) */}
                          <div className="relative shrink-0 flex flex-col items-center justify-between pt-3 pb-3 px-3 min-w-[105px]">
                            <img
                              src={imageUrl}
                              alt={pkg.name}
                              className="w-[84px] h-[84px] object-cover rounded-lg"
                            />
                            {/* Person badge under the image */}
                            <div
                              className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-bold transition-colors"
                              style={{
                                backgroundColor: isSelected ? theme.participateBg : theme.badgeBg,
                                color: isSelected ? "#ffffff" : theme.badgeText
                              }}
                            >
                              <i className="fa-solid fa-user text-[10px]"></i>
                              {personLabel}
                            </div>
                          </div>

                          {/* Right: text content */}
                          <div className="flex-1 min-w-0 px-2 pt-3 pb-3 flex flex-col">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-[16px] font-bold text-[#1f1f1f] leading-snug">{pkg.name}</h4>
                                <p className="text-[13px] text-gray-500 mt-0.5 font-medium leading-relaxed">
                                  {personSubtitle}
                                </p>
                                <p className="text-[18px] font-black mt-2" style={{ color: theme.priceColor }}>
                                  {currencySymbol}{getDisplayPrice(pkg)}
                                </p>
                              </div>
                              {/* Check mark radio button */}
                              <div
                                className="mt-1 h-[24px] w-[24px] shrink-0 rounded-full flex items-center justify-center transition-colors"
                                style={{
                                  border: isSelected ? 'none' : '1px solid #d1d5db',
                                  backgroundColor: isSelected ? theme.radioBg : "#ffffff",
                                }}
                              >
                                {isSelected && <i className="fa-solid fa-check text-white text-[13px]"></i>}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* ── DESKTOP: 4-Column Horizontal Grid ── */}
              <div className="hidden md:block px-6 pb-2">
                <div className="grid grid-cols-4 gap-3">
                  {(() => {
                    const displayPackages = [...puja.packages];
                    if (displayPackages.length === 3) {
                      displayPackages.push({
                        id: 'family-bhog',
                        name: 'Family Puja + Bhog',
                        price: Math.round((displayPackages[2]?.price || 1000) * 1.5),
                        description: 'Family sankalp with bhog offering and temple archana included.'
                      });
                    }
                    const themes = [
                      {
                        border: "#e07c2a", imageBg: "#fff8f0", priceColor: "#e07c2a",
                        badgeBg: "#fde8cc", badgeText: "#c25e0e",
                        radioBg: "#e07c2a", participateBg: "#e07c2a", cardBg: "#FFFAF5",
                      },
                      {
                        border: "#D22B75", imageBg: "#FFF0F5", priceColor: "#D22B75",
                        badgeBg: "#FCE4EF", badgeText: "#9D174D",
                        radioBg: "#D22B75", participateBg: "#D22B75", cardBg: "#FFF8FB",
                      },
                      {
                        border: "#4F6B20", imageBg: "#F4F8EC", priceColor: "#4F6B20",
                        badgeBg: "#E8F2D4", badgeText: "#3A5018",
                        radioBg: "#4F6B20", participateBg: "#4F6B20", cardBg: "#F9FBF5",
                      },
                      {
                        border: "#836814", imageBg: "#FAF7ED", priceColor: "#836814",
                        badgeBg: "#F5EECF", badgeText: "#5C4910",
                        radioBg: "#836814", participateBg: "#836814", cardBg: "#FDFAF2",
                      },
                    ];

                    return displayPackages.map((pkg, idx) => {
                      const isSelected = selectedPackageId === pkg.id;
                      const theme = themes[idx] || themes[0];
                      const personLabel = idx === 0 ? "1 Person" : idx === 1 ? "2 Person" : idx === 2 ? "4 Person" : "6 Person";
                      const imageUrl = pkg.imageUrl || puja.imageUrl || "https://images.unsplash.com/photo-1601024445121-e5b82f020549?auto=format&fit=crop&w=150&q=80";

                      return (
                        <button
                          key={pkg.id}
                          onClick={() => setSelectedPackageId(pkg.id)}
                          style={{
                            borderColor: isSelected ? theme.border : "#e5e7eb",
                            backgroundColor: isSelected ? theme.cardBg : "#ffffff",
                          }}
                          className="relative flex flex-col p-3 rounded-2xl border-2 transition-all text-left overflow-hidden min-h-[180px] shadow-sm hover:shadow-md"
                        >
                          {/* Top row: person badge + radio */}
                          <div className="flex items-center justify-between w-full mb-2">
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors"
                              style={{
                                backgroundColor: isSelected ? theme.participateBg : theme.badgeBg,
                                color: isSelected ? "#ffffff" : theme.badgeText
                              }}
                            >
                              <i className="fa-solid fa-user text-[9px]"></i>
                              {personLabel}
                            </span>
                            <div
                              className="h-[22px] w-[22px] rounded-full flex items-center justify-center transition-colors"
                              style={{
                                border: isSelected ? 'none' : '1px solid #d1d5db',
                                backgroundColor: isSelected ? theme.radioBg : "#ffffff",
                              }}
                            >
                              {isSelected && <i className="fa-solid fa-check text-white text-[12px]"></i>}
                            </div>
                          </div>

                          {/* Package name */}
                          <h4 className="text-[14px] font-bold text-[#1f1f1f] leading-snug w-[65%] z-10 mt-1">{pkg.name}</h4>

                          {/* Price */}
                          <span
                            className="mt-auto text-[18px] font-black z-10"
                            style={{ color: isSelected ? theme.priceColor : "#1f1f1f" }}
                          >
                            {currencySymbol} {getDisplayPrice(pkg)}
                          </span>

                          {/* Bottom-right image */}
                          <div className="absolute -bottom-1 -right-1 w-[72px] h-[72px] rounded-tl-[36px] rounded-br-2xl overflow-hidden z-0">
                            <img src={imageUrl} alt={pkg.name} className="w-full h-full object-cover opacity-90" />
                          </div>
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>

            {/* Trust Badges — Marquee Scroll (Fixed) */}
            <div className="border-t border-b border-gray-100 bg-[#f8f9fa] overflow-hidden py-1">
              <div className="flex" style={{ animation: 'marqueeScroll 35s linear infinite', width: 'max-content' }}>
                {[
                  { icon: "fa-shield-halved", label: "100% Money Back Guarantee" },
                  { icon: "fa-shield-halved", label: "No Hidden Cost" },
                  { icon: "fa-certificate", label: "ISO 9001 Certified" },
                  { icon: "fa-place-of-worship", label: "Official Temple Partner" },
                  { icon: "fa-headset", label: "24/7 Support" },
                  { icon: "fa-shield-halved", label: "100% Money Back Guarantee" },
                  { icon: "fa-shield-halved", label: "No Hidden Cost" },
                  { icon: "fa-certificate", label: "ISO 9001 Certified" },
                  { icon: "fa-place-of-worship", label: "Official Temple Partner" },
                  { icon: "fa-headset", label: "24/7 Support" },
                ].map((badge, i) => (
                  <div key={i} className="flex items-center gap-2 px-5 py-2 shrink-0 border-r border-gray-200">
                    <i className={`fa-solid ${badge.icon} text-[#6869F9] text-[13px]`}></i>
                    <span className="text-[12px] font-semibold text-gray-600 whitespace-nowrap">{badge.label}</span>
                  </div>
                ))}
              </div>
              <style>{`@keyframes marqueeScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
            </div>

            {/* Bottom Action Bar — full-width green proceed button */}
            <div className="bg-white px-4 py-4 sm:px-6 sm:py-5">
              <button
                onClick={() => {
                  if (selectedPackageId) {
                    if (isIndian) {
                      setShowPackageModal(false);
                      setShowDetailsModal(true);
                    } else {
                      handleAddPujaToCart();
                    }
                  }
                }}
                className="flex w-full items-center justify-between bg-[#0f7a50] hover:bg-[#0c6843] active:bg-[#0a5c3a] transition-colors px-6 py-4 rounded-xl shadow-md"
              >
                {/* Left: price + name */}
                <div className="flex flex-col text-left">
                  <span className="text-[22px] font-black text-white leading-tight">
                    {currencySymbol}{selectedPackage ? getDisplayPrice(selectedPackage) : '—'}
                  </span>
                  <span className="text-[12px] font-semibold text-white/90">{selectedPackage?.name ?? 'Select a package'}</span>
                </div>
                {/* Right: Proceed + arrow */}
                <div className="flex items-center gap-2">
                  <span className="text-[18px] font-bold text-white">Proceed</span>
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Collection Modal */}
      {showDetailsModal && puja && (
        <div className="fixed inset-0 z-110 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-sm">
          <div className="relative w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] bg-white p-5 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setShowPackageModal(true);
                }}
                className="h-10 w-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-900" />
              </button>
              <h3 className="text-xl font-bold text-gray-900">Fill your details for Puja</h3>
            </div>

            <div className="space-y-8">
              {/* WhatsApp Number Field */}
              {isIndian && (
                <div>
                  <label className="block text-gray-900 font-bold text-sm mb-2">Enter Your Whatsapp Mobile Number</label>
                  <p className="text-[11px] text-gray-400 mb-4 leading-relaxed font-medium">Your Puja booking updates like Puja Photos, Videos and other details will be sent on WhatsApp on below number.</p>
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[#1f1f1f] font-bold">
                      <i className="fa-brands fa-whatsapp text-lg"></i>
                      <span className="text-sm">+91</span>
                    </div>
                    <input
                      type="tel"
                      maxLength={16}
                      value={userDetails.whatsapp}
                      onChange={(e) => {
                        let digits = e.target.value.replace(/\D/g, '');
                        if ((digits.startsWith('91') && digits.length > 10) || digits.length === 12) {
                          digits = digits.slice(2);
                        }
                        setUserDetails(prev => ({ ...prev, whatsapp: digits.slice(0, 10) }));
                      }}
                      className="w-full bg-white border-2 border-blue-500 rounded-2xl py-4 pl-24 pr-12 font-bold text-gray-900 outline-none shadow-[0_0_0_1px_rgba(59,130,246,0.1)]"
                      placeholder="8192812323"
                    />
                    {userDetails.whatsapp && (
                      <button
                        onClick={() => setUserDetails(prev => ({ ...prev, whatsapp: "" }))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500"
                      >
                        <i className="fa-solid fa-circle-xmark opacity-50"></i>
                      </button>
                    )}
                    <div className="absolute -top-2.5 left-6 bg-white px-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Your mobile Number</div>
                  </div>
                </div>
              )}

              {/* Name Field */}
              <div>
                <label className="block text-gray-900 font-bold text-sm mb-4">Enter Your Name</label>
                <div className="relative group">
                  <input
                    type="text"
                    value={userDetails.name}
                    onChange={(e) => setUserDetails(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 font-bold text-gray-900 outline-none shadow-sm focus:border-blue-500 transition-all"
                    placeholder="enter your name"
                  />
                  {userDetails.name && (
                    <button
                      onClick={() => setUserDetails(prev => ({ ...prev, name: "" }))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500"
                    >
                      <i className="fa-solid fa-circle-xmark opacity-50"></i>
                    </button>
                  )}
                  <div className="absolute -top-2 left-6 bg-white px-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Your full Name</div>
                </div>
              </div>

              {cartError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-xs font-semibold text-red-500 mt-2">
                  {cartError}
                </p>
              )}

              {/* Next Button */}
              <button
                disabled={!userDetails.name || (isIndian && userDetails.whatsapp.length < 10) || addingToCart}
                onClick={handleAddPujaToCart}
                className="w-full rounded-2xl bg-gray-900 py-4 font-bold text-white transition-all hover:bg-gray-800 disabled:opacity-50"
              >
                {addingToCart ? "Processing..." : "Next"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 z-200 flex flex-col bg-black">
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 text-white">
            <button onClick={() => setShowGallery(false)} className="flex items-center gap-4 hover:text-gray-300">
              <ArrowLeftIcon className="h-5 w-5" />
              <span className="font-bold text-lg">Puja Gallery</span>
            </button>
            <button className="flex items-center gap-2 rounded-full bg-[#1b2b25] px-4 py-2 text-sm font-semibold text-[#48c985] hover:bg-[#253b33] border border-[#253b33]">
              <i className="fa-brands fa-whatsapp"></i> Share
            </button>
          </div>

          {/* Main Image */}
          <div className="flex flex-1 items-center justify-center overflow-hidden p-4 relative group">
            <img src={images[currentImageIndex]} className="max-h-[60vh] w-auto max-w-full object-contain" />
          </div>

          {/* Thumbnails and Actions */}
          <div className="flex flex-col items-center pb-6">
            {images.length > 1 && (
              <div className="flex items-center gap-3 mb-6">
                <button onClick={handlePrevImage} className="h-7 w-7 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 text-xs transition-colors">
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`h-2 w-2 rounded-full transition-all ${idx === currentImageIndex ? "bg-[#6869F9]" : "bg-white/40 hover:bg-white/60"}`}
                  />
                ))}
                <button onClick={handleNextImage} className="h-7 w-7 flex items-center justify-center rounded-full bg-[#6869F9] text-white hover:bg-[#e06b1a] text-xs transition-colors">
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            )}

            <div className="flex overflow-x-auto gap-3 px-4 max-w-full no-scrollbar pb-4 justify-center">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`h-[72px] w-[108px] shrink-0 rounded-md overflow-hidden border-[3px] transition-colors ${idx === currentImageIndex ? "border-[#2563eb]" : "border-transparent opacity-50 hover:opacity-100"}`}
                >
                  <img src={img} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>

            <div className="w-full max-w-xl px-4 mt-2">
              <button
                onClick={() => {
                  setShowGallery(false);
                  setShowPackageModal(true);
                }}
                className="w-full bg-[#00b268] text-white py-4 rounded-xl font-bold text-[15px] hover:bg-[#009e5c] transition-colors shadow-lg shadow-[#00b268]/20 flex items-center justify-center gap-2"
              >
                Explore Puja Packages Now <ArrowLeftIcon className="h-4 w-4 rotate-180" />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Mobile Floating "Select puja package" Bar */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-40 transition-transform duration-300 ${isPackagesVisible ? 'translate-y-full' : 'translate-y-0'
          }`}
      >
        <button
          onClick={() => setShowPackageModal(true)}
          className="w-full bg-[#00b268] text-white py-3.5 rounded-lg font-bold text-[15px] flex items-center justify-center gap-2 shadow-sm active:bg-[#009e5c] transition-colors"
        >
          Select puja package
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </>
  );
}


