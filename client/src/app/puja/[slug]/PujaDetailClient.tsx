"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LoginModal from "@/components/auth/LoginModal";
import { checkAuthStatus } from "@/lib/authCheck";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import WishlistButton from "@/components/common/WishlistButton";
import PujaCountdownCard from "@/components/common/PujaCountdownCard";

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
  additionalImages?: string[];
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
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const heroCtaRef = useRef<HTMLButtonElement | null>(null);

  // Scroll observer to show bottom sticky bar only when hero CTA button scrolls out of view
  useEffect(() => {
    const el = heroCtaRef.current;
    if (!el) {
      const handleScroll = () => {
        setShowStickyBar(window.scrollY > 450);
      };
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loading]);

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

        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://priestservices.astroved.com";
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
    "/images/package_individual.webp",
    "/images/partner.webp",
    "/images/package_family.png",
  ];

  // Compute normalized package list from Admin data or defaults
  const packagesList = useMemo(() => {
    const normalizePackageName = (rawName: string, idx: number) => {
      const lower = (rawName || "").toLowerCase();
      if (lower.includes("individual")) return "Individual Puja";
      if (lower.includes("couple")) return "Couple Puja";
      if (lower.includes("family")) return "Family Puja";
      if (idx === 0) return "Individual Puja";
      if (idx === 1) return "Couple Puja";
      if (idx === 2) return "Family Puja";
      return rawName || `Package ${idx + 1}`;
    };

    if (puja?.packages && puja.packages.length > 0) {
      return puja.packages.map((pkg: any, idx: number) => {
        const basePrice = pkg.priceINR ?? pkg.price ?? puja.price ?? 501;
        const defaultDevotees = idx === 0 ? "1 Devotee" : idx === 1 ? "2 Devotees" : idx === 2 ? "4 Devotees" : "Multiple Devotees";
        return {
          id: pkg.id || pkg._id || `pkg-${idx + 1}`,
          name: normalizePackageName(pkg.name, idx),
          devoteeCount: pkg.devoteeCount || pkg.devotees || defaultDevotees,
          priceINR: basePrice,
          priceUSD: pkg.priceUSD,
          priceMYR: pkg.priceMYR,
          description: pkg.description || "Includes personalized sankalpam and video proof.",
          imageUrl: defaultPackageAvatars[idx % defaultPackageAvatars.length],
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

  const DEFAULT_BANNER_IMAGE =
    "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&w=1600&q=80";

  const bannerImages: string[] = useMemo(() => {
    if (!puja) return [DEFAULT_BANNER_IMAGE];
    const list: string[] = [];

    const addUrl = (val: any) => {
      if (!val) return;
      if (typeof val === "string") {
        const parts = val.split(/[\n,]+/);
        for (const p of parts) {
          const trimmed = p.trim();
          if (trimmed) {
            const formatted = getPujaImageUrl(trimmed);
            if (formatted) {
              list.push(formatted);
            }
          }
        }
      } else if (Array.isArray(val)) {
        for (const item of val) {
          addUrl(item);
        }
      }
    };

    // 1. Primary main image
    if (puja.imageUrl && typeof puja.imageUrl === "string" && puja.imageUrl.trim()) {
      addUrl(puja.imageUrl);
    }

    // 2. Additional carousel images
    const addImgs = puja.additionalImages || (puja as any).additionalImageUrls;
    const hasAdditional =
      (Array.isArray(addImgs) && addImgs.length > 0) ||
      (typeof addImgs === "string" && Boolean((addImgs as string).trim()));

    if (hasAdditional) {
      addUrl(addImgs);
    } else {
      // 3. Fallback to gallery images if no additionalImages provided
      addUrl(puja.gallery);
      addUrl((puja as any).galleryUrl);
      addUrl((puja as any).details?.gallery);
    }

    // 4. Details sub-object main image
    if (list.length === 0) {
      addUrl((puja?.details as any)?.imageUrl);
    }

    // Fallback default image if no image exists in DB at all
    if (list.length === 0) {
      list.push(DEFAULT_BANNER_IMAGE);
    }

    return list;
  }, [puja]);

  const handlePrevBanner = () => {
    if (bannerImages.length <= 1) return;
    setActiveBannerIndex((prev) => (prev - 1 + bannerImages.length) % bannerImages.length);
  };

  const handleNextBanner = () => {
    if (bannerImages.length <= 1) return;
    setActiveBannerIndex((prev) => (prev + 1) % bannerImages.length);
  };

  return (
    <main className="min-h-screen bg-white text-[#1f1f1f] font-sans pb-24">
      <Navbar />

      {/* ── 1. Top Hero Section ── */}
      <section className="bg-[#ffffff] border-b border-[#f0e4d0] py-8 sm:py-12">
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left 6 Cols: Main Banner Image (Slightly Increased Width) */}
            <div className="lg:col-span-6 flex flex-col">
              <div className="relative w-full h-[280px] sm:h-[350px] md:h-[390px] lg:h-[410px] rounded-xl overflow-hidden border border-stone-200/90 shadow-md group">
                <img
                  src={bannerImages[activeBannerIndex] || (puja ? getPujaImageUrl(puja.imageUrl) : "")}
                  alt={puja?.title || "Puja Image"}
                  className="w-full h-full object-cover object-center transition-all duration-300"
                />

                {/* Left and Right Navigation Buttons (shown when more than 1 image) */}
                {bannerImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevBanner}
                      aria-label="Previous image"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition-all shadow-md active:scale-95 z-10"
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={handleNextBanner}
                      aria-label="Next image"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition-all shadow-md active:scale-95 z-10"
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Carousel Dots (Shown ONLY when > 1 image, rendering exact length of bannerImages) */}
              {bannerImages.length > 1 && (
                <div className="flex items-center justify-center gap-2 mt-3 mb-1">
                  {bannerImages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveBannerIndex(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={
                        idx === activeBannerIndex
                          ? "w-7 h-2 bg-[#00b050] rounded-full transition-all cursor-pointer"
                          : "w-2.5 h-2.5 bg-stone-300 hover:bg-stone-400 rounded-full transition-all cursor-pointer"
                      }
                    />
                  ))}
                </div>
              )}

              {/* Frameless Ratings / Stat & Action Strip Under Image (Fits exact image width) */}
              <div className="flex items-center justify-between gap-1.5 sm:gap-2 mt-2.5 w-full px-0.5">
                {/* Stat 1: Ratings */}
                <div className="text-center flex-1 min-w-0">
                  <span className="block text-sm sm:text-base lg:text-lg font-extrabold text-[#1f1a17] leading-none">4.36L+</span>
                  <span className="text-[10px] sm:text-xs text-stone-500 font-medium block mt-1 leading-none">ratings</span>
                </div>

                <div className="w-[1px] h-5 sm:h-6 bg-stone-300/80 shrink-0" />

                {/* Stat 2: Pujas Conducted */}
                <div className="text-center flex-1 min-w-0">
                  <span className="block text-sm sm:text-base lg:text-lg font-extrabold text-[#1f1a17] leading-none">24L+</span>
                  <span className="text-[10px] sm:text-xs text-stone-500 font-medium block whitespace-nowrap mt-1 leading-none">pujas conducted</span>
                </div>

                <div className="w-[1px] h-5 sm:h-6 bg-stone-300/80 shrink-0" />

                {/* Stat 3: Average Ratings */}
                <div className="text-center flex-1 min-w-0">
                  <div className="flex items-center justify-center gap-0.5 sm:gap-1 leading-none">
                    <span className="text-sm sm:text-base lg:text-lg font-extrabold text-[#1f1a17]">4.9/5</span>
                    <span className="text-amber-400 text-xs sm:text-sm">⭐</span>
                  </div>
                  <span className="text-[10px] sm:text-xs text-stone-500 font-medium block whitespace-nowrap mt-1 leading-none">Average ratings</span>
                </div>

                {/* Action Buttons: Wishlist & Share */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {/* Wishlist Button */}
                  <WishlistButton
                    itemId={puja._id}
                    text="Wishlist"
                    className="border border-stone-400/90 hover:border-stone-700 bg-white text-stone-800 font-medium text-xs sm:text-sm px-3 sm:px-4 py-1.5 rounded-full flex items-center justify-center gap-1 sm:gap-1.5 transition-all active:scale-95 shrink-0"
                    iconClassName="w-3.5 h-3.5 sm:w-4 sm:h-4"
                  />

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
                    className="border border-stone-400/90 hover:border-stone-700 bg-white text-stone-800 font-medium text-xs sm:text-sm px-3 sm:px-4 py-1.5 rounded-full flex items-center justify-center gap-1 sm:gap-1.5 transition-all active:scale-95 shrink-0"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span>{shareSuccess ? "Copied!" : "Share"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right 6 Cols: Details & CTA */}
            <div className="lg:col-span-6 flex flex-col lg:pl-[10px]">
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

              {/* Dynamic Countdown & Temple Card fetched from Dashboard */}
              <PujaCountdownCard
                templeVenue={templeVenueText || "Kamrup Teerth Kshetra"}
                location={puja.location || puja.templeLocation || "Guwahati, Assam"}
                dateText={puja.date || "Saturday, 10 October"}
                occasionText={puja.subtitle || puja.badge || (puja as any).tithis || "Mahalaya Amavasya"}
                eventDateTime={puja.eventDateTime}
                title="Reserve your sankalp"
                badgeLabel="MUHURAT ENDS IN"
                className="mb-5"
              />

              {/* Package Selection Cards Grid (Border & top header removed) */}
              <div className="mb-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {packagesList.map((pkg, idx) => {
                    const isSelected = selectedPackage?.id === pkg.id;
                    const displayPrice = getDisplayPrice(pkg);
                    const pkgAvatar = defaultPackageAvatars[idx % defaultPackageAvatars.length];
                    const devoteesText = pkg.devoteeCount || (pkg as any).devotees || (idx === 0 ? "1 Devotee" : idx === 1 ? "2 Devotees" : idx === 2 ? "4 Devotees" : "Multiple Devotees");

                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPackageId(pkg.id)}
                        className={`relative border-2 rounded-2xl py-4 sm:py-5 px-3.5 cursor-pointer transition-all flex items-center gap-3 min-h-[88px] ${isSelected
                          ? "border-[#00b050] bg-green-50/50 shadow-xs"
                          : "border-stone-200 hover:border-stone-300 bg-white"
                          }`}
                      >
                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden shrink-0 border border-stone-200/90 bg-white shadow-2xs">
                          <img src={pkgAvatar} alt={pkg.name} className="w-full h-full object-cover object-center" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <h4 className="font-extrabold text-stone-900 text-xs sm:text-[13px] truncate">{pkg.name}</h4>
                          <span className="text-[11px] sm:text-xs font-semibold text-stone-500 block truncate">{devoteesText}</span>
                          <span className="font-extrabold text-sm sm:text-base text-[#00b050] block">₹{displayPrice}</span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#00b050] text-white flex items-center justify-center shrink-0 shadow-xs">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Primary Participate / Book Now CTA Button */}
              <button
                ref={heroCtaRef}
                onClick={handleAddPujaToCart}
                className="w-full bg-[#00b050] hover:bg-[#009644] active:scale-95 text-white font-extrabold text-xl sm:text-2xl py-4 sm:py-4.5 px-8 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 mb-3.5 tracking-wide"
              >
                <span>₹{priceVal.toLocaleString("en-IN")}</span>
                <span className="opacity-60 font-light">|</span>
                <span>Book Now</span>
              </button>

              {/* Secondary WhatsApp & Call Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://wa.me/9677391109"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 bg-white border border-[#00b050] text-[#009644] hover:bg-green-50/60 font-extrabold text-xs sm:text-sm py-2.5 px-4 rounded-full transition-colors shadow-xs"
                >
                  <svg className="w-5 h-5 shrink-0 fill-[#25D366]" viewBox="0 0 24 24">
                    <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.758.459 3.474 1.33 4.982L2 22l5.144-1.348c1.455.793 3.097 1.21 4.864 1.21 5.505 0 9.989-4.478 9.99-9.985 0-5.506-4.484-9.984-9.986-9.984zm5.794 14.15c-.244.686-1.437 1.344-1.982 1.393-.526.048-1.018.257-3.418-.686-2.905-1.141-4.757-4.088-4.901-4.281-.144-.193-1.177-1.564-1.177-2.984 0-1.42.747-2.119 1.011-2.408.264-.289.576-.361.769-.361.192 0 .385.001.552.009.178.008.417-.067.653.498.243.582.83 2.023.902 2.168.072.144.12.312.024.504-.096.192-.144.312-.288.48-.144.168-.303.376-.432.504-.144.144-.294.302-.126.59.168.289.747 1.233 1.603 1.996 1.101.98 2.03 1.285 2.318 1.429.288.144.456.12.624-.072.168-.192.721-.84.913-1.128.192-.288.384-.24.648-.144.264.096 1.677.791 1.965.935.288.144.48.216.552.336.072.12.072.696-.172 1.382z" />
                  </svg>
                  <span>Book via WhatsApp</span>
                </a>
                <a
                  href="tel:+919677391108"
                  className="flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 bg-white border border-[#2563eb] text-[#2563eb] hover:bg-blue-50/60 font-extrabold text-xs sm:text-sm py-2.5 px-4 rounded-full transition-colors shadow-xs"
                >
                  <svg className="w-4 h-4 min-w-[16px] min-h-[16px] fill-none stroke-[#2563eb]" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Book via Call</span>
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
      <div className="sticky top-[76px] z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-xs pt-2 sm:pt-3 w-full">
        <div className="w-full max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between overflow-x-auto no-scrollbar gap-2 sm:gap-4 text-xs sm:text-sm font-bold text-stone-600">
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
                  const yOffset = -150;
                  const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                  window.scrollTo({ top: y, behavior: "smooth" });
                }
              }}
              className={`flex-1 text-center py-3 sm:py-3.5 border-b-2 transition-colors whitespace-nowrap shrink-0 sm:shrink ${activeTab === tab.id
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
          <section id="about" className="scroll-mt-36">
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
            <div id="benefits" className="scroll-mt-36 pt-2">
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
          <section id="process" className="scroll-mt-36">
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
          <section id="temple" className="scroll-mt-36">
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
          <section id="receive" className="scroll-mt-36">
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
          <section id="faqs" className="scroll-mt-36">
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
            <section id="gallery" className="scroll-mt-36">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1a17] mb-6">Puja Gallery</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
        <div className="lg:col-span-4 space-y-6 pt-2 sm:pt-4">

          {/* Dedicated Vedic Puja Sticky Card */}
          <div className="bg-[#fdfbf7] border border-[#f0e4d0] rounded-3xl p-6 shadow-xs sticky top-[164px] space-y-6">
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
                <svg className="w-5 h-5 shrink-0 fill-white" viewBox="0 0 24 24">
                  <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.758.459 3.474 1.33 4.982L2 22l5.144-1.348c1.455.793 3.097 1.21 4.864 1.21 5.505 0 9.989-4.478 9.99-9.985 0-5.506-4.484-9.984-9.986-9.984zm5.794 14.15c-.244.686-1.437 1.344-1.982 1.393-.526.048-1.018.257-3.418-.686-2.905-1.141-4.757-4.088-4.901-4.281-.144-.193-1.177-1.564-1.177-2.984 0-1.42.747-2.119 1.011-2.408.264-.289.576-.361.769-.361.192 0 .385.001.552.009.178.008.417-.067.653.498.243.582.83 2.023.902 2.168.072.144.12.312.024.504-.096.192-.144.312-.288.48-.144.168-.303.376-.432.504-.144.144-.294.302-.126.59.168.289.747 1.233 1.603 1.996 1.101.98 2.03 1.285 2.318 1.429.288.144.456.12.624-.072.168-.192.721-.84.913-1.128.192-.288.384-.24.648-.144.264.096 1.677.791 1.965.935.288.144.48.216.552.336.072.12.072.696-.172 1.382z" />
                </svg>
                <span>WhatsApp Agent</span>
              </a>
            </div>
          </div>

        </div>

      </div>

      {/* ── 5. Sticky Floating Action Bar at Bottom ── */}
      <div
        className={`fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-[1250px] transition-all duration-300 transform ${showStickyBar
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-12 opacity-0 pointer-events-none"
          }`}
      >
        <div className="bg-[#00b050] text-white rounded-2xl sm:rounded-3xl p-3 sm:py-3.5 sm:px-6 flex items-center justify-between shadow-2xl shadow-green-950/30 border border-green-400/20 backdrop-blur-md">
          {/* Left Column: Lotus Icon + Uppercase Title + Price */}
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 pr-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white text-[#00b050] flex items-center justify-center shrink-0 shadow-sm">
              <svg className="w-6 h-6 fill-[#00b050]" viewBox="0 0 24 24">
                <path d="M12 3c-1.5 2.5-3 5-3 7.5 0 2.5 1.5 4.5 3 4.5s3-2 3-4.5C15 8 13.5 5.5 12 3zm0 14c-4.5 0-7.5-2.5-9-5 1.5 4.5 5.5 7.5 9 7.5s7.5-3 9-7.5c-1.5 2.5-4.5 5-9 5z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] sm:text-xs font-extrabold text-green-100 tracking-wider uppercase block truncate">
                {puja.title}
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-white block leading-tight mt-0.5">
                ₹{priceVal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Right Column: White Pill Button with Green Circle Arrow */}
          <button
            onClick={handleAddPujaToCart}
            className="bg-white hover:bg-green-50 active:scale-95 text-[#00b050] font-extrabold text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-full shadow-md transition-all flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer"
          >
            <span>Book Now</span>
            <div className="w-6 h-6 rounded-full bg-[#00b050] text-white flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </button>
        </div>
      </div>

      {/* ── 6. Package Selection Modal ── */}
      {showPackageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 pb-[90px] md:pb-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl relative max-h-[85vh] md:max-h-[90vh] overflow-y-auto">
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
