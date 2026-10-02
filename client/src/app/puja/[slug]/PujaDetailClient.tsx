"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LoginModal from "@/components/auth/LoginModal";
import { checkAuthStatus } from "@/lib/authCheck";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import WishlistButton from "@/components/common/WishlistButton";

interface PujaPackage {
  id: string;
  name: string;
  priceINR?: number;
  priceUSD?: number;
  priceMYR?: number;
  price?: number;
  description?: string;
  imageUrl?: string;
}

interface PujaOffering {
  id: string;
  name: string;
  priceINR?: number;
  priceUSD?: number;
  priceMYR?: number;
  price?: number;
  description?: string;
  badge?: string;
  imageUrl?: string;
  productId?: number;
}

interface Puja {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  badge?: string;
  shortTitle?: string;
  location?: string;
  templeVenue?: string;
  templeNote?: string;
  templeLocation?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  about?: string;
  strengthFor?: string;
  ritualSummary?: string;
  date?: string;
  eventDateTime?: string;
  slug: string;
  price?: number;
  productId?: number;
  benefits?: { title: string; description: string; icon?: string }[];
  process?: { title: string; description: string }[];
  inclusions?: (string | { title: string; description?: string })[];
  faq?: { question: string; answer: string }[];
  packages?: PujaPackage[];
  offerings?: PujaOffering[];
  gallery?: string[];
  templeImage?: string;
  details?: {
    heroTitle?: string;
    heroSubtitle?: string;
    about?: string;
    templeName?: string;
    templeLocation?: string;
    templeNote?: string;
    templeImage?: string;
    benefits?: { title: string; description: string; icon?: string }[];
    process?: { title: string; description: string }[];
    inclusions?: string[];
    faq?: { question: string; answer: string }[];
  };
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const getPujaImageUrl = (imageUrl?: string): string => {
  if (!imageUrl || typeof imageUrl !== "string") return "";
  const trimmed = imageUrl.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:") || trimmed.startsWith("/")) {
    return trimmed;
  }
  return `/${trimmed}`;
};

export default function PujaDetailClient({
  initialPuja,
  recommendations = [],
}: {
  initialPuja: Puja | null;
  recommendations?: any[];
}) {
  const params = useParams<{ slug: string }>();
  const slugParam = params?.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  const currency = "INR";

  const [puja, setPuja] = useState<Puja | null>(initialPuja);
  const [loading, setLoading] = useState(!initialPuja);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState("about");
  const [userDetails, setUserDetails] = useState({ name: "", whatsapp: "" });
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartError, setCartError] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingSankalpUrl, setPendingSankalpUrl] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Fetch Puja details by slug
  useEffect(() => {
    if (initialPuja) {
      setPuja(initialPuja);
      setLoading(false);
      return;
    }

    const loadPuja = async () => {
      try {
        if (!slug) {
          setPuja(null);
          return;
        }

        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://priest-service.onrender.com";
        const res = await fetch(`${backendUrl}/api/pujas`);
        if (!res.ok) {
          setPuja(null);
          return;
        }

        const resData = await res.json();
        const list: Puja[] = resData?.data && Array.isArray(resData.data)
          ? resData.data
          : Array.isArray(resData)
            ? resData
            : [];

        const match = list.find(
          (p: Puja) => p.slug === slug || slugify(p.title) === slug || p._id === slug
        );

        if (match) {
          setPuja(match);
        } else {
          setPuja(null);
        }
      } catch {
        setPuja(null);
      } finally {
        setLoading(false);
      }
    };

    loadPuja();
  }, [slug, initialPuja]);

  // Handle Tab Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["about", "benefits", "process", "temple", "receive", "faqs", "gallery"];
      const scrollPosition = window.scrollY + 220;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveTab(sections[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const defaultPackageAvatars = [
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1609234656388-0ff363383899?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=150&q=80",
  ];

  // Compute normalized package list from Admin data or defaults
  const packagesList = useMemo(() => {
    if (puja?.packages && puja.packages.length > 0) {
      return puja.packages.map((pkg: any, idx: number) => {
        const basePrice = pkg.priceINR ?? pkg.price ?? puja.price ?? 501;
        const defaultDevotees = idx === 0 ? "1 Devotee" : idx === 1 ? "2 Devotees" : idx === 2 ? "4 Devotees" : "Multiple Devotees";
        return {
          id: pkg.id || pkg._id || `pkg-${idx + 1}`,
          name: pkg.name || `Package ${idx + 1}`,
          devoteeCount: pkg.devoteeCount || pkg.devotees || defaultDevotees,
          priceINR: basePrice,
          priceUSD: pkg.priceUSD,
          priceMYR: pkg.priceMYR,
          description: pkg.description || "Includes personalized sankalpam and video proof.",
          imageUrl: pkg.imageUrl || defaultPackageAvatars[idx % defaultPackageAvatars.length],
        };
      });
    }

    const basePrice = puja?.price || 501;
    return [
      {
        id: "pkg-1",
        name: "Individual Puja",
        devoteeCount: "1 Devotee",
        priceINR: basePrice,
        description: "Personalized Sankalpam for 1 Person with video recording.",
        imageUrl: defaultPackageAvatars[0],
      },
      {
        id: "pkg-2",
        name: "Couple Puja",
        devoteeCount: "2 Devotees",
        priceINR: basePrice + 200,
        description: "Personalized Sankalpam for Couple / 2 Devotees.",
        imageUrl: defaultPackageAvatars[1],
      },
      {
        id: "pkg-3",
        name: "Family Puja",
        devoteeCount: "4 Devotees",
        priceINR: basePrice + 400,
        description: "Personalized Sankalpam for 4 Family Members.",
        imageUrl: defaultPackageAvatars[2],
      },
    ];
  }, [puja]);

  // Auto-select first package if none selected
  useEffect(() => {
    if (packagesList.length > 0 && !selectedPackageId) {
      setSelectedPackageId(packagesList[0].id);
    }
  }, [packagesList, selectedPackageId]);

  const getDisplayPrice = (item: any) => {
    return item?.[`price${currency}`] ?? item?.priceINR ?? item?.price ?? 516;
  };

  const selectedPackage = useMemo(() => {
    return (
      packagesList.find((pkg) => pkg.id === selectedPackageId) ??
      packagesList[0] ??
      null
    );
  }, [packagesList, selectedPackageId]);

  const priceVal = selectedPackage
    ? getDisplayPrice(selectedPackage)
    : puja?.price || 516;

  const handleAddPujaToCart = async () => {
    setAddingToCart(true);
    setCartError("");
    try {
      const { is_user } = await checkAuthStatus();
      const actualPujaId = puja?._id || (puja as any)?.id || slug;
      const totalAmount = priceVal;

      const sankalpUrl = `/sankalp?pujaId=${encodeURIComponent(actualPujaId)}&amount=${totalAmount}&type=puja&pkg=${selectedPackageId || ""}&name=${encodeURIComponent(
        userDetails.name
      )}&wa=${userDetails.whatsapp}&title=${encodeURIComponent(puja?.title || "")}&slug=${encodeURIComponent(
        slug || ""
      )}`;

      if (!is_user) {
        setPendingSankalpUrl(sankalpUrl);
        setShowLoginModal(true);
        return;
      }
      window.location.href = sankalpUrl;
    } catch (err: any) {
      setCartError(err.message || "An error occurred. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center text-[#1f1f1f] font-serif font-bold text-lg">
          Loading sacred puja details...
        </div>
        <Footer />
      </>
    );
  }

  if (!puja) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-3xl font-serif font-bold text-[#221f20] mb-4">Puja Not Found</h1>
          <p className="text-stone-600 mb-6">The requested puja offering could not be found.</p>
          <Link
            href="/puja"
            className="bg-[#00b050] text-white font-extrabold px-8 py-3 rounded-full hover:bg-[#009b46] transition-colors"
          >
            Explore All Pujas
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  // Fallback structures if admin data is not provided
  const defaultBenefits = [
    { title: "Divine Grace & Protection", description: "Invocational blessing to grant strength, peace, and protection.", icon: "🛡️" },
    { title: "Success & Obstacle Removal", description: "Divine support for overcoming difficulties and achieving success.", icon: "🎯" },
    { title: "Prosperity & Abundance", description: "Auspicious sacred rituals bringing prosperity and family wellbeing.", icon: "✨" },
    { title: "Positive Energy & Peace", description: "Strengthen focus, harmony, and positive vibrations at home.", icon: "⚡" },
    { title: "Family Wellbeing", description: "Harmony, happiness, and health for all family members.", icon: "🏡" },
  ];

  const defaultProcess = [
    { title: "Sankalpam", description: "Offering devotee's names and gotram during the sacred ritual by learned priests." },
    { title: "Ganapati Puja & Invocation", description: "Invoking Lord Ganesha for obstruction-free Puja and divine harmony." },
    { title: "Sacred Archana & Chanting", description: "Chanting sacred vedic mantras and 108 names for fulfillment of noble desires." },
    { title: "Mangalarathi & Prasad", description: "Offering final mangalarathi and receiving divine prasad blessings." },
  ];

  const defaultFaqs = [
    { question: "Where is this puja being performed?", answer: "This puja is performed at sacred temples by verified, experienced Vedic pandits following authentic rites." },
    { question: "Why is this puja performed?", answer: "It is performed to seek divine blessings, remove difficulties, and fulfill specific prayers for health, career, and family." },
    { question: "Who will perform the puja?", answer: "Highly experienced Vedic priests with proper initiations will conduct your sankalpam and rituals." },
    { question: "Do I need to be physically present?", answer: "No, physical presence is not required. The pandit recites your Name and Gotra in the Sankalpam, and a full video recording is sent to your WhatsApp within 48 hours." },
  ];

  // Resolve Admin fields with fallbacks
  const aboutText =
    puja.about ||
    puja.details?.about ||
    puja.description ||
    puja.subtitle ||
    puja.heroSubtitle ||
    puja.details?.heroSubtitle ||
    `Perform sacred ${puja.title} with authentic Vedic rituals to seek divine grace, peace, and fulfillment of prayers.`;

  const badgeText =
    puja.badge ||
    puja.shortTitle ||
    puja.subtitle ||
    puja.heroTitle ||
    puja.details?.heroTitle ||
    "SPECIAL SANKALPAM";

  const descriptionText =
    puja.description ||
    puja.subtitle ||
    puja.heroSubtitle ||
    puja.details?.heroSubtitle ||
    "A special sacred ritual for devotees seeking courage, prosperity, and fulfillment of noble wishes.";

  const templeLocationText =
    puja.templeLocation ||
    puja.location ||
    puja.templeVenue ||
    puja.details?.templeLocation ||
    puja.details?.templeName ||
    "Sacred Temple Venue, India";

  const templeVenueText =
    puja.templeVenue ||
    puja.details?.templeName ||
    puja.location ||
    puja.templeLocation ||
    "Sacred Temple Venue";

  const templeNoteText =
    puja.templeNote ||
    puja.details?.templeNote ||
    "This sacred temple is renowned for authentic Vedic rituals, powerful divine vibrations, and traditional archana services.";

  const benefitsList =
    puja.benefits && puja.benefits.length > 0
      ? puja.benefits
      : puja.details?.benefits && puja.details.benefits.length > 0
        ? puja.details.benefits
        : defaultBenefits;

  const processList =
    puja.process && puja.process.length > 0
      ? puja.process
      : puja.details?.process && puja.details.process.length > 0
        ? puja.details.process
        : defaultProcess;

  const faqList =
    puja.faq && puja.faq.length > 0
      ? puja.faq
      : puja.details?.faq && puja.details.faq.length > 0
        ? puja.details.faq
        : defaultFaqs;

  const inclusionsList =
    puja.inclusions && puja.inclusions.length > 0
      ? puja.inclusions
      : puja.details?.inclusions && puja.details.inclusions.length > 0
        ? puja.details.inclusions
        : [
          { title: "Special Invocational Sankalpam", description: "Performed with your name, gotra, and specific prayer request by learned priests." },
          { title: "Full Puja Video Recording", description: "Delivered directly to your WhatsApp number within 48 hours of ritual completion." },
        ];

  const galleryList =
    Array.isArray(puja.gallery) && puja.gallery.length > 0
      ? puja.gallery.map((img: string) => getPujaImageUrl(img)).filter(Boolean)
      : Array.isArray((puja as any).galleryUrl) && (puja as any).galleryUrl.length > 0
        ? (puja as any).galleryUrl.map((img: string) => getPujaImageUrl(img)).filter(Boolean)
        : typeof (puja as any).galleryUrl === "string" && (puja as any).galleryUrl.trim()
          ? [getPujaImageUrl((puja as any).galleryUrl)]
          : [];

  const templeImage =
    (typeof (puja as any).templeImageUrl === "string" && (puja as any).templeImageUrl.trim()) ||
    (typeof puja.templeImage === "string" && puja.templeImage.trim()) ||
    (typeof (puja as any).details?.templeImageUrl === "string" && (puja as any).details.templeImageUrl.trim()) ||
    (typeof puja.details?.templeImage === "string" && puja.details.templeImage.trim()) ||
    "";

  return (
    <main className="min-h-screen bg-white text-[#1f1f1f] font-sans pb-24">
      <Navbar />

      {/* ── 1. Top Hero Section ── */}
      <section className="bg-[#faf9f6] border-b border-[#f0e4d0] py-8 sm:py-12">
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left 6 Cols: Main Banner Image (Wider Layout) */}
            <div className="lg:col-span-6 flex flex-col">
              <div className="relative w-full h-[320px] sm:h-[400px] md:h-[450px] lg:h-[480px] rounded-3xl overflow-hidden border border-stone-200/90 shadow-md group">
                <img
                  src={getPujaImageUrl(puja.imageUrl)}
                  alt={puja.title}
                  className="w-full h-full object-cover object-center"
                />

                {/* Bottom Temple Overlay Banner */}
                {templeVenueText && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-r from-[#902400] via-[#b83808] to-[#902400] border-t-2 border-white py-2.5 px-4 flex items-center justify-center gap-2 text-white font-serif font-bold text-xs sm:text-sm tracking-wide z-10 shadow-md">
                    <span className="text-amber-300 text-sm sm:text-base">🛕</span>
                    <span className="truncate">{templeVenueText}</span>
                  </div>
                )}
              </div>

              {/* Ratings / Stat & Action Strip Under Image */}
              <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-3 bg-white border border-stone-200/90 rounded-2xl p-3 sm:p-3.5 mt-4 shadow-xs">
                {/* Stat 1: Ratings */}
                <div className="text-center flex-1 min-w-[65px]">
                  <span className="block text-sm sm:text-base font-extrabold text-[#1f1a17] leading-tight">4.17L+</span>
                  <span className="text-[11px] text-stone-500 font-medium block">ratings</span>
                </div>

                <div className="w-[1px] h-7 bg-stone-200 shrink-0 hidden sm:block" />

                {/* Stat 2: Pujas Conducted */}
                <div className="text-center flex-1 min-w-[95px]">
                  <span className="block text-sm sm:text-base font-extrabold text-[#1f1a17] leading-tight">22.92L+</span>
                  <span className="text-[11px] text-stone-500 font-medium block whitespace-nowrap">pujas conducted</span>
                </div>

                <div className="w-[1px] h-7 bg-stone-200 shrink-0 hidden sm:block" />

                {/* Stat 3: Average Ratings */}
                <div className="text-center flex-1 min-w-[90px]">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-sm sm:text-base font-extrabold text-[#1f1a17] leading-tight">4.9/5</span>
                    <span className="text-amber-400 text-xs sm:text-sm">⭐</span>
                  </div>
                  <span className="text-[11px] text-stone-500 font-medium block whitespace-nowrap">Average ratings</span>
                </div>

                {/* Action Buttons: Wishlist & Share */}
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-center mt-2 sm:mt-0">
                  {/* Wishlist Button */}
                  <WishlistButton itemId={puja._id} text="Wishlist" />

                  {/* Share Button */}
                  <button
                    aria-label="Share puja"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: puja.title, url: window.location.href });
                      } else {
                        navigator.clipboard?.writeText(window.location.href);
                        setShareSuccess(true);
                        setTimeout(() => setShareSuccess(false), 2000);
                      }
                    }}
                    className="border border-stone-300 hover:border-stone-400 bg-white text-stone-700 rounded-full px-3.5 py-1.5 flex items-center justify-center gap-1.5 font-bold text-xs transition-all active:scale-95 shadow-xs"
                  >
                    <svg className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span>{shareSuccess ? "Copied!" : "Share"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right 6 Cols: Details & CTA */}
            <div className="lg:col-span-6 flex flex-col">
              {/* Filigree Subtag */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-[1px] bg-[#F47820]/40" />
                <span className="text-[#F47820] font-serif font-extrabold text-xs sm:text-[13px] tracking-wider uppercase flex items-center gap-1.5">
                  <span className="text-[10px]">♦</span> {badgeText} <span className="text-[10px]">♦</span>
                </span>
                <div className="w-8 h-[1px] bg-[#F47820]/40" />
              </div>

              {/* Title */}
              <h1 className="font-serif font-bold text-[#1f1a17] text-2xl sm:text-3xl lg:text-4xl leading-snug mb-3">
                {puja.title}
              </h1>

              {/* Subtitle / Description */}
              <p className="text-stone-600 text-sm sm:text-base font-medium leading-relaxed mb-6">
                {descriptionText}
              </p>

              {/* Temple Location & Date Details Box */}
              <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-4 mb-5 space-y-3 text-xs sm:text-sm font-bold text-stone-800">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#F47820] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L9 6H15L12 2ZM8 7L6 11H18L16 7H8ZM5 12L3 17H21L19 12H5ZM2 18V21H22V18H2Z" /></svg>
                  <span>{templeLocationText}</span>
                </div>
                <div className="w-full h-[1px] bg-stone-200/70" />
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#F47820] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  <span>{puja.date || "Available Daily"}</span>
                </div>
              </div>

              {/* Package Selection Cards Grid */}
              <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 mb-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold tracking-wider text-stone-500 uppercase">Reserve your sankalp</span>
                  <span className="text-[11px] font-bold text-[#00b050] bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200/60">
                    Verified Pandits
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {packagesList.map((pkg, idx) => {
                    const isSelected = selectedPackage?.id === pkg.id;
                    const displayPrice = getDisplayPrice(pkg);
                    const pkgAvatar = pkg.imageUrl || defaultPackageAvatars[idx % defaultPackageAvatars.length];
                    const devoteesText = pkg.devoteeCount || (pkg as any).devotees || (idx === 0 ? "1 Devotee" : idx === 1 ? "2 Devotees" : idx === 2 ? "4 Devotees" : "Multiple Devotees");

                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPackageId(pkg.id)}
                        className={`relative border-2 rounded-2xl p-3 cursor-pointer transition-all flex items-center gap-3 ${isSelected
                          ? "border-[#00b050] bg-green-50/50 shadow-xs"
                          : "border-stone-200 hover:border-stone-300 bg-white"
                          }`}
                      >
                        <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-stone-200 bg-stone-100">
                          <img src={pkgAvatar} alt={pkg.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-extrabold text-stone-900 text-xs truncate">{pkg.name}</h4>
                          <span className="text-[11px] font-semibold text-stone-500 block truncate">{devoteesText}</span>
                          <span className="font-extrabold text-sm text-[#00b050] block">₹{displayPrice}</span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#00b050] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                            ✓
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Primary Participate / Book Now CTA Button */}
              <button
                onClick={handleAddPujaToCart}
                className="w-full bg-[#00b050] hover:bg-[#009644] active:scale-95 text-white font-extrabold text-lg py-4 px-6 rounded-2xl shadow-lg shadow-green-600/20 transition-all flex items-center justify-center gap-2 mb-4"
              >
                <span>₹{priceVal}</span>
                <span className="opacity-40 font-normal">|</span>
                <span>Book Now</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>

              {/* Secondary WhatsApp & Call Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://wa.me/9677391109"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 bg-white border border-stone-300 text-stone-700 hover:border-stone-400 font-extrabold text-xs sm:text-sm py-3 px-4 rounded-full transition-colors shadow-xs"
                >
                  <span className="text-[#25D366] text-base">💬</span> Book via WhatsApp
                </a>
                <a
                  href="tel:+917207202029"
                  className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 bg-white border border-stone-300 text-stone-700 hover:border-stone-400 font-extrabold text-xs sm:text-sm py-3 px-4 rounded-full transition-colors shadow-xs"
                >
                  <span className="text-stone-600 text-base">📞</span> Book via Call
                </a>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ── 2. Trust Strip Badges ── */}
      <div className="w-full bg-[#f0f8f1] border-y border-green-100 py-4 sm:py-5 overflow-x-auto no-scrollbar">
        <div className="max-w-[1350px] mx-auto flex items-center justify-around gap-6 px-4 text-xs sm:text-sm font-bold text-[#009e5b] whitespace-nowrap">
          <span className="flex items-center gap-2"><span className="bg-green-100 rounded-full p-1">🎥</span> Puja Video Delivered Within 48 hours</span>
          <span className="flex items-center gap-2"><span className="bg-green-100 rounded-full p-1">✓</span> Verified &amp; Experienced Pandits</span>
          <span className="flex items-center gap-2"><span className="bg-green-100 rounded-full p-1">🏛</span> Puja Performed in Sacred Temples</span>
          <span className="flex items-center gap-2"><span className="bg-green-100 rounded-full p-1">📜</span> 100% Authentic Vedic Rituals</span>
        </div>
      </div>

      {/* ── 3. Sticky Sub-navigation Tabs Bar ── */}
      <div className="sticky top-[60px] z-30 bg-white border-b border-stone-200 shadow-xs">
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-10 flex overflow-x-auto no-scrollbar gap-6 text-xs sm:text-sm font-bold text-stone-600">
          {[
            { id: "about", label: "About puja" },
            { id: "benefits", label: "Puja Benefits" },
            { id: "process", label: "Puja Procedure" },
            { id: "temple", label: "Temple Details" },
            { id: "receive", label: "What will you receive" },
            { id: "faqs", label: "Frequently Asked Questions (FAQs)" },
            { id: "gallery", label: "Puja Gallery" },
          ].map((tab) => (
            <a
              key={tab.id}
              href={`#${tab.id}`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(tab.id);
                const el = document.getElementById(tab.id);
                if (el) {
                  const yOffset = -120;
                  const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                  window.scrollTo({ top: y, behavior: "smooth" });
                }
              }}
              className={`py-4 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                ? "border-[#00b050] text-[#00b050]"
                : "border-transparent hover:text-stone-900"
                }`}
            >
              {tab.label}
            </a>
          ))}
        </div>
      </div>

      {/* ── 4. Main 2-Column Body Layout ── */}
      <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-10 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-12">

          {/* Section: About Puja */}
          <section id="about" className="scroll-mt-32">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1a17] mb-6">About puja</h2>

            <div className="bg-[#fdfbf7] border border-[#f0e4d0] rounded-3xl p-6 sm:p-8 relative overflow-hidden mb-8">
              <p className="text-stone-700 text-sm sm:text-base leading-relaxed font-medium mb-6">
                {aboutText}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#f0e4d0] pt-6 text-xs text-stone-700">
                <div>
                  <span className="text-stone-400 font-bold block mb-1 uppercase tracking-wider">Occasion</span>
                  <span className="font-extrabold text-stone-900">{puja.date || "Auspicious Tithis"}</span>
                </div>
                <div>
                  <span className="text-stone-400 font-bold block mb-1 uppercase tracking-wider">Duration</span>
                  <span className="font-extrabold text-stone-900">~2 Hours</span>
                </div>
                <div>
                  <span className="text-stone-400 font-bold block mb-1 uppercase tracking-wider">Venue</span>
                  <span className="font-extrabold text-stone-900">Temple Yagashala</span>
                </div>
              </div>
            </div>

            {/* Benefits Cards Grid */}
            <div id="benefits" className="scroll-mt-32 pt-2">
              <h3 className="text-xl font-serif font-bold text-[#1f1a17] mb-4">Puja Benefits</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {benefitsList.map((b, idx) => (
                  <div key={idx} className="bg-white border border-stone-200/90 rounded-2xl p-5 flex items-start gap-4 shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-[#800000] text-white flex items-center justify-center shrink-0 font-bold">
                      {b.icon || "❖"}
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm sm:text-base mb-1">{b.title}</h4>
                      <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">{b.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section: Puja Procedure */}
          <section id="process" className="scroll-mt-32">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1a17] mb-6">Puja Procedure</h2>
            <div className="space-y-4">
              {processList.map((step, idx) => (
                <div key={idx} className="bg-white border border-stone-200/90 rounded-2xl p-5 flex items-start gap-4 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-[#800000] text-white flex items-center justify-center shrink-0 font-bold text-sm">
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm sm:text-base mb-1">{step.title}</h3>
                    <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Temple Details */}
          <section id="temple" className="scroll-mt-32">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1a17] mb-6">Temple Details</h2>
            <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-center shadow-xs">
              {templeImage && (
                <div className="w-full md:w-1/3 h-48 rounded-2xl overflow-hidden bg-stone-100 shrink-0 relative">
                  <img
                    src={templeImage}
                    alt={templeVenueText}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-serif font-bold text-stone-900 text-xl mb-2">{templeVenueText}</h3>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-medium mb-4">
                  {templeNoteText}
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F47820]">
                  📍 {templeLocationText}
                </span>
              </div>
            </div>
          </section>

          {/* Section: What will you receive */}
          <section id="receive" className="scroll-mt-32">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1a17] mb-6">What will you receive</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {inclusionsList.map((inc: any, idx: number) => {
                const title = typeof inc === "string" ? inc : inc.title || inc.name || `Inclusion ${idx + 1}`;
                const desc = typeof inc === "string" ? "Included in your sacred booking." : inc.description || "Included in your sacred booking.";
                return (
                  <div key={idx} className="bg-white border border-stone-200/90 rounded-2xl p-5 flex items-start gap-4 shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-[#800000] text-white flex items-center justify-center shrink-0 font-bold text-sm">
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 text-sm sm:text-base mb-1">{title}</h3>
                      {desc && <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">{desc}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section: Frequently Asked Questions (FAQs) */}
          <section id="faqs" className="scroll-mt-32">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1a17] mb-6">Frequently Asked Questions (FAQs)</h2>
            <div className="space-y-3">
              {faqList.map((faq, idx) => (
                <div
                  key={idx}
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className={`border rounded-2xl px-5 py-4 transition-all duration-300 cursor-pointer select-none ${openFaqIndex === idx ? 'border-[#00b050] bg-white shadow-xs' : 'border-stone-200 bg-[#faf9f6]'}`}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm sm:text-base font-bold text-stone-800">{faq.question}</h4>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ml-4 ${openFaqIndex === idx ? 'bg-[#00b050] text-white' : 'bg-stone-200 text-stone-600'}`}>
                      {openFaqIndex === idx ? '−' : '+'}
                    </div>
                  </div>
                  {openFaqIndex === idx && (
                    <div className="mt-3 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Section: Puja Gallery */}
          {galleryList.length > 0 && (
            <section id="gallery" className="scroll-mt-32">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1a17] mb-6">Puja Gallery</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {galleryList.map((img: string, idx: number) => (
                  <div key={idx} className="h-48 rounded-2xl overflow-hidden border border-stone-200 shadow-xs">
                    <img
                      src={img}
                      alt={`Gallery photo ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* Right Sidebar Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Dedicated Vedic Puja Sticky Card */}
          <div className="bg-[#fdfbf7] border border-[#f0e4d0] rounded-3xl p-6 shadow-xs sticky top-28 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#800000] text-white flex items-center justify-center font-bold">🔥</div>
              <div>
                <h3 className="font-serif font-bold text-stone-900 text-base">Dedicated Vedic Puja</h3>
                <span className="text-xs text-stone-500 font-semibold">100% Authentic Rituals</span>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-stone-700 font-medium">
              <div className="flex items-start gap-2.5">
                <span className="text-[#00b050] font-bold text-base">✓</span>
                <span>Personalized Sankalpam performed with your Name, Gotra &amp; Wish</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-[#00b050] font-bold text-base">✓</span>
                <span>Full Puja Video Recording delivered on WhatsApp within 48 hours</span>
              </div>
            </div>

            <div className="border-t border-[#f0e4d0] pt-6">
              <h4 className="font-bold text-stone-900 text-sm mb-2">Unsure which puja to book?</h4>
              <p className="text-stone-600 text-xs mb-4 leading-relaxed font-medium">
                Our devotee care team is available in 11 languages, 12 hours a day. Reach them on WhatsApp.
              </p>
              <a
                href="https://wa.me/9677391109"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#00b050] hover:bg-[#009644] text-white font-extrabold text-xs sm:text-sm py-3 px-4 rounded-full transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>💬 WhatsApp Agent</span>
              </a>
            </div>
          </div>

        </div>

      </div>

      {/* ── 5. Sticky Floating Action Bar at Bottom ── */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-[1100px]">
        <div className="bg-[#00b050] text-white rounded-full p-3 sm:px-6 sm:py-3.5 flex items-center justify-between shadow-2xl shadow-green-900/40 border border-green-400/30 backdrop-blur-md">
          <div className="flex items-center gap-3 pl-2">
            <span className="bg-white text-[#00b050] rounded-full p-2 text-sm">🔥</span>
            <div>
              <span className="font-serif font-bold text-xs sm:text-sm block truncate max-w-[200px] sm:max-w-md">{puja.title}</span>
              <span className="font-extrabold text-lg sm:text-xl block leading-none">₹{priceVal}</span>
            </div>
          </div>
          <button
            onClick={() => setShowPackageModal(true)}
            className="bg-white text-[#00b050] hover:bg-green-50 active:scale-95 font-extrabold text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-md transition-all flex items-center gap-1.5"
          >
            <span>Participate</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      {/* ── 6. Package Selection Modal ── */}
      {showPackageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowPackageModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-2"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2">Select Package</h3>
            <p className="text-stone-600 text-xs sm:text-sm mb-6">Choose your desired package for sacred ritual participation.</p>

            <div className="space-y-4 mb-6">
              {packagesList.map((pkg) => {
                const isSelected = selectedPackage?.id === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackageId(pkg.id)}
                    className={`border-2 rounded-2xl p-4 cursor-pointer transition-all flex items-center justify-between ${isSelected
                      ? "border-[#00b050] bg-green-50/50 shadow-xs"
                      : "border-stone-200 hover:border-stone-400 bg-white"
                      }`}
                  >
                    <div>
                      <h4 className="font-bold text-stone-900 text-base">{pkg.name}</h4>
                      <p className="text-stone-600 text-xs mt-1">{pkg.description || "Includes personalized sankalpam and video proof."}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-lg text-stone-900 block">₹{getDisplayPrice(pkg)}</span>
                      <span className="text-[10px] font-bold text-[#00b050] uppercase">{isSelected ? "Selected ✓" : "Select"}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => {
                setShowPackageModal(false);
                handleAddPujaToCart();
              }}
              className="w-full bg-[#00b050] hover:bg-[#009644] text-white font-extrabold text-base py-3.5 rounded-full shadow-md transition-all"
            >
              Proceed to Details
            </button>
          </div>
        </div>
      )}

      {/* ── 8. Login Modal ── */}
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

      <Footer />
    </main>
  );
}
