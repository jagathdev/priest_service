"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LoginModal from "@/components/auth/LoginModal";
import { checkAuthStatus } from "@/lib/authCheck";
import { X } from "lucide-react";
import WishlistButton from "@/components/common/WishlistButton";
import PujaCountdownCard from "@/components/common/PujaCountdownCard";
interface HomaPackage {
  id: string;
  name: string;
  priceINR?: number;
  priceUSD?: number;
  priceMYR?: number;
  price?: number;
  description?: string;
  imageUrl?: string;
}

interface HomaOffering {
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

interface Homa {
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
  showTimer?: boolean;
  slug: string;
  price?: number;
  productId?: number;
  benefits?: { title: string; description: string; icon?: string }[];
  process?: { title: string; description: string }[];
  inclusions?: (string | { title: string; description?: string })[];
  faq?: { question: string; answer: string }[];
  packages?: HomaPackage[];
  offerings?: HomaOffering[];
  gallery?: string[];
  galleryUrl?: string | string[];
  templeImage?: string;
  templeImageUrl?: string;
  details?: {
    heroTitle?: string;
    heroSubtitle?: string;
    about?: string;
    templeName?: string;
    templeLocation?: string;
    templeNote?: string;
    templeImage?: string;
    templeImageUrl?: string;
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

export const getHomaImageUrl = (imageUrl?: string): string => {
  if (!imageUrl || typeof imageUrl !== "string") return "";
  const trimmed = imageUrl.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:") || trimmed.startsWith("/")) {
    return trimmed;
  }
  return `/${trimmed}`;
};

const DEFAULT_PACKAGE_AVATARS = [
  "/images/package_individual.webp",
  "/images/partner.webp",
  "/images/package_family.webp",
];

export default function HomaDetailClient({
  initialHoma,
}: {
  initialHoma: Homa | null;
  recommendations?: Homa[];
}) {
  const params = useParams<{ slug: string }>();
  const slugParam = params?.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  const currency = "INR";

  const [homa, setHoma] = useState<Homa | null>(initialHoma);
  const [loading, setLoading] = useState(!initialHoma);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    initialHoma?.packages?.[0]?.id ?? null
  );
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState("about");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingSankalpUrl, setPendingSankalpUrl] = useState<string | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [shareSuccess, setShareSuccess] = useState(false);
  const heroCtaRef = useRef<HTMLButtonElement | null>(null);
  const tabsContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (tabsContainerRef.current) {
      const activeEl = tabsContainerRef.current.querySelector(`[href="#${activeTab}"]`) as HTMLElement;
      if (activeEl) {
        const container = tabsContainerRef.current;
        const left = activeEl.offsetLeft - container.offsetWidth / 2 + activeEl.offsetWidth / 2;
        container.scrollTo({ left, behavior: "smooth" });
      }
    }
  }, [activeTab]);

  // Scroll handler to show bottom sticky bar only after user scrolls past "About homa" / hero CTA
  useEffect(() => {
    const handleScroll = () => {
      const aboutSec = document.getElementById("about");
      const heroCta = heroCtaRef.current;

      if (aboutSec) {
        const aboutRect = aboutSec.getBoundingClientRect();
        // Show after scrolling down to or past the About Homa section
        setShowStickyBar(aboutRect.top <= 300);
      } else if (heroCta) {
        const ctaRect = heroCta.getBoundingClientRect();
        // Show after hero Book Now button has completely scrolled above the screen
        setShowStickyBar(ctaRect.bottom <= 0);
      } else {
        setShowStickyBar(window.scrollY > 450);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading]);

  // Fetch Homa details by slug
  useEffect(() => {
    if (initialHoma) {
      setHoma(initialHoma);
      setSelectedPackageId(initialHoma.packages?.[0]?.id ?? null);
      setLoading(false);
      return;
    }

    const loadHoma = async () => {
      try {
        if (!slug) {
          setHoma(null);
          return;
        }

        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
        const res = await fetch(`${backendUrl}/api/homas`);
        if (!res.ok) {
          setHoma(null);
          return;
        }

        const resData = await res.json();
        const list: Homa[] = resData?.data && Array.isArray(resData.data)
          ? resData.data
          : Array.isArray(resData)
            ? resData
            : [];

        const match = list.find(
          (h: Homa) => h.slug === slug || slugify(h.title) === slug || h._id === slug
        );

        if (match) {
          setHoma(match);
          setSelectedPackageId(match.packages?.[0]?.id ?? null);
        } else {
          setHoma(null);
        }
      } catch {
        setHoma(null);
      } finally {
        setLoading(false);
      }
    };

    loadHoma();
  }, [slug, initialHoma]);

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



  // Compute normalized package list from Admin data or defaults
  const packagesList = useMemo(() => {
    const normalizePackageName = (rawName: string, idx: number) => {
      const lower = (rawName || "").toLowerCase();
      if (lower.includes("individual")) return "Individual";
      if (lower.includes("couple")) return "Couple";
      if (lower.includes("family")) return "Family";
      if (idx === 0) return "Individual";
      if (idx === 1) return "Couple";
      if (idx === 2) return "Family";
      return rawName || `Package ${idx + 1}`;
    };

    if (homa?.packages && homa.packages.length > 0) {
      return homa.packages.map((pkg: any, idx: number) => {
        const basePrice = pkg.priceINR ?? pkg.price ?? homa.price ?? 1250;
        const defaultDevotees = idx === 0 ? "1 Devotee" : idx === 1 ? "2 Devotees" : idx === 2 ? "4 Devotees" : "Multiple Devotees";
        return {
          id: pkg.id || pkg._id || `pkg-${idx + 1}`,
          name: normalizePackageName(pkg.name, idx),
          devoteeCount: pkg.devoteeCount || pkg.devotees || defaultDevotees,
          priceINR: basePrice,
          priceUSD: pkg.priceUSD,
          priceMYR: pkg.priceMYR,
          description: pkg.description || "Includes personalized sankalpam and havan video proof.",
          imageUrl: DEFAULT_PACKAGE_AVATARS[idx % DEFAULT_PACKAGE_AVATARS.length],
        };
      });
    }

    const basePrice = homa?.price || 1250;
    return [
      {
        id: "pkg-1",
        name: "Individual",
        devoteeCount: "1 Devotee",
        priceINR: basePrice,
        description: "Personalized Sankalpam for 1 Person with havan video recording.",
        imageUrl: DEFAULT_PACKAGE_AVATARS[0],
      },
      {
        id: "pkg-2",
        name: "Couple",
        devoteeCount: "2 Devotees",
        priceINR: basePrice + 300,
        description: "Personalized Sankalpam for Couple / 2 Devotees.",
        imageUrl: DEFAULT_PACKAGE_AVATARS[1],
      },
      {
        id: "pkg-3",
        name: "Family",
        devoteeCount: "4 Devotees",
        priceINR: basePrice + 600,
        description: "Personalized Sankalpam for 4 Family Members.",
        imageUrl: DEFAULT_PACKAGE_AVATARS[2],
      },
    ];
  }, [homa]);

  // Auto-select first package if none selected
  useEffect(() => {
    if (packagesList.length > 0 && !selectedPackageId) {
      setSelectedPackageId(packagesList[0].id);
    }
  }, [packagesList, selectedPackageId]);

  const getDisplayPrice = (item: Record<string, any>) => {
    return item?.[`price${currency}`] ?? item?.priceINR ?? item?.price ?? 1250;
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
    : homa?.price || 1250;

  const handleAddHomaToCart = async () => {
    try {
      const { is_user } = await checkAuthStatus();
      const actualHomaId = homa?._id || (homa as any)?.id || slug;
      const totalAmount = priceVal;

      const sankalpUrl = `/sankalp?pujaId=${encodeURIComponent(actualHomaId)}&amount=${totalAmount}&type=homa&pkg=${selectedPackageId || ""}&title=${encodeURIComponent(homa?.title || "")}&slug=${encodeURIComponent(
        slug || ""
      )}`;

      if (!is_user) {
        setPendingSankalpUrl(sankalpUrl);
        setShowLoginModal(true);
        return;
      }
      window.location.href = sankalpUrl;
    } catch (err: unknown) {
      console.error("Error booking homa:", err);
    }
  };

  const DEFAULT_BANNER_IMAGE = "/images/Lakshmi-Homam.jpg";

  const bannerImages: string[] = useMemo(() => {
    if (!homa) return [DEFAULT_BANNER_IMAGE];
    const list: string[] = [];

    const addUrl = (val: any) => {
      if (!val) return;
      if (typeof val === "string") {
        const parts = val.split(/[\n,]+/);
        for (const p of parts) {
          const trimmed = p.trim();
          if (trimmed) {
            const formatted = getHomaImageUrl(trimmed);
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
    if (homa.imageUrl && typeof homa.imageUrl === "string" && homa.imageUrl.trim()) {
      addUrl(homa.imageUrl);
    }

    // 2. Additional carousel images
    const addImgs = homa.additionalImages || (homa as any).additionalImageUrls;
    const hasAdditional =
      (Array.isArray(addImgs) && addImgs.length > 0) ||
      (typeof addImgs === "string" && Boolean((addImgs as string).trim()));

    if (hasAdditional) {
      addUrl(addImgs);
    } else {
      // 3. Fallback to gallery images if no additionalImages provided
      addUrl(homa.gallery);
      addUrl((homa as any).galleryUrl);
      addUrl((homa as any).details?.gallery);
    }

    // 4. Details sub-object main image
    if (list.length === 0) {
      addUrl((homa?.details as any)?.imageUrl);
    }

    // Fallback default image if no image exists in DB at all
    if (list.length === 0) {
      list.push(DEFAULT_BANNER_IMAGE);
    }

    return list;
  }, [homa]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center text-[#1f1f1f] font-serif font-bold text-lg">
          Loading sacred homa details...
        </div>
        <Footer />
      </>
    );
  }

  if (!homa) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-3xl font-serif font-bold text-[#221f20] mb-4">Homa Not Found</h1>
          <p className="text-stone-600 mb-6">The requested homa offering could not be found.</p>
          <Link
            href="/homa"
            className="bg-[#14395C] text-white font-extrabold px-8 py-3 rounded-full hover:bg-[#0f2d4a] transition-colors"
          >
            Explore All Homas
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const defaultBenefits = [
    { title: "Courage to overcome obstacles", description: "Invocational fire lab blessing to grant strength and overcome hardships.", icon: "🛡️" },
    { title: "Fulfillment of efforts & endeavours", description: "Divine support for success in work, career, and personal goals.", icon: "🎯" },
    { title: "Divine grace for new ventures", description: "Auspicious fire lab with peace, protection, and growth.", icon: "✨" },
    { title: "Full Confidence & Willpower", description: "Strengthen focus, remove self-doubt and fear.", icon: "⚡" },
    { title: "Family Well-being", description: "Harmony, happiness, and health for all family members.", icon: "🏡" },
  ];

  const defaultProcess = [
    { title: "Sankalpam", description: "Offering devotee's names and gotram during the sacred fire lab by learned priests." },
    { title: "Ganapati Puja & Invocation", description: "Invoking Lord Ganesha for obstruction-free Homa and divine harmony." },
    { title: "Special Ahuti & Offerings", description: "Authentic homa fire offerings with sacred herbs, ghee, and mantras." },
    { title: "Archana & Chanting of Namas", description: "Chanting sacred vedic mantras and 108 names for fulfillment of noble desires." },
    { title: "Purnahuti & Bhasma Prasad", description: "Offering final purnahuti and receiving divine sacred ash blessings." },
  ];

  const defaultFaqs = [
    { question: "Where is this homa being performed?", answer: "This homa is performed at sacred temples by verified, experienced Vedic pandits following authentic rites." },
    { question: "Why is this homa performed?", answer: "It is performed to invoke sacred fire energy, remove karma and difficulties, and fulfill specific prayers for health, career, and family." },
    { question: "Who will perform the homa?", answer: "Highly experienced Vedic priests with proper initiations will conduct your sankalpam and rituals." },
    { question: "Do I need to be physically present?", answer: "No, physical presence is not required. The pandit recites your Name and Gotra in the Sankalpam, and a full video recording is sent to your WhatsApp within 48 hours." },
  ];

  // Resolve Admin fields with fallbacks
  const aboutText =
    homa.about ||
    homa.details?.about ||
    homa.description ||
    homa.subtitle ||
    homa.heroSubtitle ||
    homa.details?.heroSubtitle ||
    "In Vedic tradition, Homa (Fire Lab) is considered the most potent ritual to invoke divine energies through Agni Devata, burning away negative karmas.";

  const badgeText =
    homa.badge ||
    homa.shortTitle ||
    homa.subtitle ||
    homa.heroTitle ||
    homa.details?.heroTitle ||
    "SPECIAL VEDIC HOMA";

  const descriptionText =
    homa.description ||
    homa.subtitle ||
    homa.heroSubtitle ||
    homa.details?.heroSubtitle ||
    "A sacred fire lab for peace, prosperity, health, and divine protection.";

  const templeLocationText =
    homa.templeLocation ||
    homa.location ||
    homa.templeVenue ||
    homa.details?.templeLocation ||
    "Sacred Temple Yagashala, India";

  const templeVenueText =
    homa.templeVenue ||
    homa.details?.templeName ||
    homa.location ||
    "Sacred Temple Yagashala";

  const templeNoteText =
    homa.templeNote ||
    homa.details?.templeNote ||
    "This sacred yagashala is renowned for authentic fire lab rituals, powerful divine vibrations, and traditional Vedic chants.";

  const benefitsList =
    homa.benefits && homa.benefits.length > 0
      ? homa.benefits
      : homa.details?.benefits && homa.details.benefits.length > 0
        ? homa.details.benefits
        : defaultBenefits;

  const processList =
    homa.process && homa.process.length > 0
      ? homa.process
      : homa.details?.process && homa.details.process.length > 0
        ? homa.details.process
        : defaultProcess;

  const faqList =
    homa.faq && homa.faq.length > 0
      ? homa.faq
      : homa.details?.faq && homa.details.faq.length > 0
        ? homa.details.faq
        : defaultFaqs;

  const inclusionsList =
    homa.inclusions && homa.inclusions.length > 0
      ? homa.inclusions
      : homa.details?.inclusions && homa.details.inclusions.length > 0
        ? homa.details.inclusions
        : [
          { title: "Special Invocational Sankalpam", description: "Performed with your name, gotra, and specific prayer request by learned priests." },
          { title: "Full Homa Video Recording", description: "Delivered directly to your WhatsApp number within 48 hours of ritual completion." },
        ];

  const galleryList =
    Array.isArray(homa.gallery) && homa.gallery.length > 0
      ? homa.gallery.map((img: string) => getHomaImageUrl(img)).filter(Boolean)
      : Array.isArray(homa.galleryUrl) && homa.galleryUrl.length > 0
        ? homa.galleryUrl.map((img: string) => getHomaImageUrl(img)).filter(Boolean)
        : typeof homa.galleryUrl === "string" && homa.galleryUrl.trim()
          ? [getHomaImageUrl(homa.galleryUrl)]
          : [];

  const templeImage =
    (typeof homa.templeImageUrl === "string" && homa.templeImageUrl.trim()) ||
    (typeof homa.templeImage === "string" && homa.templeImage.trim()) ||
    (typeof homa.details?.templeImageUrl === "string" && homa.details.templeImageUrl.trim()) ||
    (typeof homa.details?.templeImage === "string" && homa.details.templeImage.trim()) ||
    "";

  const handlePrevBanner = () => {
    if (bannerImages.length <= 1) return;
    setActiveBannerIndex((prev) => (prev - 1 + bannerImages.length) % bannerImages.length);
  };

  const handleNextBanner = () => {
    if (bannerImages.length <= 1) return;
    setActiveBannerIndex((prev) => (prev + 1) % bannerImages.length);
  };

  const subHomaTabs = [
    { id: "about", label: "About homa" },
    { id: "benefits", label: "Homa Benefits" },
    { id: "process", label: "Homa Procedure" },
    { id: "temple", label: "Temple Details" },
    { id: "receive", label: "What will you receive" },
    { id: "faqs", label: "FAQs" },
    { id: "gallery", label: "Homa Gallery" },
  ];

  return (
    <main className="min-h-screen bg-[#FAFAFF] text-[#1E293B] font-sans pb-52 sm:pb-56 lg:pb-40">
      <Navbar />

      {/* ── 1. Top Hero Section ── */}
      <section className="bg-[#FAFAFF] border-b border-[#E2E8F0] py-8 sm:py-12">
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left 6 Cols: Main Banner Image (Slightly Increased Width) */}
            <div className="lg:col-span-6 flex flex-col">
              <div className="relative w-full h-[280px] sm:h-[350px] md:h-[390px] lg:h-[410px] rounded-3xl overflow-hidden border border-stone-200/90 shadow-md group">
                <Image
                  src={bannerImages[activeBannerIndex] || (homa ? getHomaImageUrl(homa.imageUrl) : "/images/Ganesh-Chaturthi-Mahapuja.jpg")}
                  alt={`${homa?.title || "Homa"} - Sacred Ritual Banner ${activeBannerIndex + 1}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  unoptimized
                  className="w-full h-full object-cover object-center transition-all duration-300 cursor-pointer"
                  onClick={handleAddHomaToCart}
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
                          ? "w-7 h-2 bg-[#14395C] rounded-full transition-all cursor-pointer"
                          : "w-2.5 h-2.5 bg-stone-300 hover:bg-stone-400 rounded-full transition-all cursor-pointer"
                      }
                    />
                  ))}
                </div>
              )}

              {/* Desktop Only (>=1024px): Frameless Ratings / Stat & Action Strip Under Image */}
              <div className="hidden lg:flex flex-row items-center justify-between gap-2.5 sm:gap-3 mt-3 w-full">
                {/* Stats Container */}
                <div className="flex items-center justify-between flex-1 py-0 px-0">
                  {/* Stat 1: Ratings */}
                  <div className="text-center flex-1 px-1">
                    <span className="block text-sm sm:text-base lg:text-lg font-extrabold text-[#1E293B] leading-tight">4.36L+</span>
                    <span className="text-[10px] sm:text-xs text-[#64748B] font-medium block mt-0.5 leading-tight">ratings</span>
                  </div>

                  <div className="w-[1px] h-6 bg-slate-200 shrink-0" />

                  {/* Stat 2: Homas Conducted */}
                  <div className="text-center flex-1 px-1">
                    <span className="block text-sm sm:text-base lg:text-lg font-extrabold text-[#1E293B] leading-tight">24L+</span>
                    <span className="text-[10px] sm:text-xs text-[#64748B] font-medium block mt-0.5 leading-tight">homas conducted</span>
                  </div>

                  <div className="w-[1px] h-6 bg-slate-200 shrink-0" />

                  {/* Stat 3: Average Ratings */}
                  <div className="text-center flex-1 px-1">
                    <div className="flex items-center justify-center gap-0.5 sm:gap-1 leading-tight">
                      <span className="text-sm sm:text-base lg:text-lg font-extrabold text-[#1E293B]">4.9/5</span>
                      <span className="text-amber-400 text-xs sm:text-sm">⭐</span>
                    </div>
                    <span className="text-[10px] sm:text-xs text-[#64748B] font-medium block mt-0.5 leading-tight">Average ratings</span>
                  </div>
                </div>

                {/* Action Buttons: Wishlist & Share */}
                <div className="flex items-center justify-end gap-2 shrink-0">
                  <WishlistButton
                    itemId={homa._id}
                    text="Wishlist"
                    className="flex-initial border border-stone-300 hover:border-stone-500 bg-white text-stone-800 font-medium text-xs sm:text-sm px-3.5 sm:px-4 py-1.5 rounded-full flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs"
                    iconClassName="w-3.5 h-3.5 sm:w-4 sm:h-4"
                  />

                  <button
                    type="button"
                    aria-label="Share homa"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: homa.title, url: window.location.href });
                      } else {
                        navigator.clipboard?.writeText(window.location.href);
                        setShareSuccess(true);
                        setTimeout(() => setShareSuccess(false), 2000);
                      }
                    }}
                    className="flex-initial border border-stone-300 hover:border-stone-500 bg-white text-stone-800 font-medium text-xs sm:text-sm px-3.5 sm:px-4 py-1.5 rounded-full flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs"
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
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                <div className="w-8 h-[1px] bg-[#881337]/35" />
                <span className="text-[#881337] font-serif font-extrabold text-xs sm:text-[13px] tracking-wider uppercase flex items-center gap-1.5">
                  <span className="text-[10px]">♦</span> {badgeText} <span className="text-[10px]">♦</span>
                </span>
                <div className="w-8 h-[1px] bg-[#881337]/35" />
              </div>

              {/* Title */}
              <h1 className="font-serif font-bold text-[#1E293B] text-2xl sm:text-3xl lg:text-4xl leading-snug mb-3 text-center lg:text-left">
                {homa.title}
              </h1>

              {/* Subtitle / Description */}
              <p className="text-[#64748B] text-sm sm:text-base font-medium leading-relaxed mb-6 text-center lg:text-left">
                {descriptionText}
              </p>

              {/* Dynamic Countdown & Temple Card fetched from Dashboard */}
              <PujaCountdownCard
                templeVenue={templeVenueText || "Sacred Temple Yagashala"}
                location={homa.location || homa.templeLocation || "India"}
                dateText={homa.date || "Saturday, 10 October"}
                occasionText={homa.subtitle || homa.badge || (homa as any).tithis || "Special Vedic Homa"}
                eventDateTime={homa.eventDateTime}
                showTimer={homa.showTimer}
                title="Reserve your sankalp"
                badgeLabel="MUHURAT ENDS IN"
                className="mb-5"
              />

              {/* Package Selection Cards Grid */}
              {packagesList.length > 0 && (
                <div className="mb-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                    {packagesList.map((pkg, idx) => {
                      const isSelected = selectedPackage?.id === pkg.id;
                      const displayPrice = getDisplayPrice(pkg);
                      const pkgAvatar = DEFAULT_PACKAGE_AVATARS[idx % DEFAULT_PACKAGE_AVATARS.length];
                      const devoteesText = pkg.devoteeCount || (pkg as any).devotees || (idx === 0 ? "1 Devotee" : idx === 1 ? "2 Devotees" : idx === 2 ? "4 Devotees" : "Multiple Devotees");

                      return (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedPackageId(pkg.id)}
                          className={`relative border-2 rounded-2xl p-3.5 sm:p-2.5 lg:p-3 cursor-pointer transition-all flex flex-row items-center justify-start min-h-[96px] sm:min-h-[80px] lg:min-h-[85px] hover:shadow-xs ${isSelected
                            ? "border-[#14395C] bg-[#F1F5F9]/70 shadow-xs"
                            : "border-[#E2E8F0] hover:border-[#CBD5E1] bg-white"
                            }`}
                        >
                          {/* Recommended Badge on Couple Package (idx === 1) */}
                          {idx === 1 && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#14395C] text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-xs z-10 whitespace-nowrap">
                              Recommended
                            </div>
                          )}

                          {/* Avatar Image on the Left */}
                          <div className="relative w-14 h-14 sm:w-12 sm:h-12 lg:w-13 lg:h-13 rounded-full overflow-hidden shrink-0 border border-stone-200/90 bg-white shadow-2xs mr-3.5 sm:mr-2.5 lg:mr-3">
                            <Image
                              src={pkgAvatar || "/images/Ganesh-Chaturthi-Mahapuja.jpg"}
                              alt={`${pkg.name || "Package"} - ${homa?.title || "Homa"}`}
                              width={56}
                              height={56}
                              unoptimized
                              className="w-full h-full object-cover object-center"
                            />
                          </div>

                          {/* Details on the Right */}
                          <div className="flex-1 min-w-0 text-left space-y-0.5 sm:space-y-0.5">
                            <h4 className="font-extrabold text-[#1E293B] text-sm sm:text-xs lg:text-[13px] leading-tight break-words">
                              {pkg.name}
                            </h4>
                            <span className="text-xs sm:text-[11px] font-medium text-[#64748B] block leading-tight truncate">
                              {devoteesText}
                            </span>
                            <div className="flex items-center justify-between mt-1 sm:mt-0.5">
                              <span className={`font-extrabold text-base sm:text-sm lg:text-base ${isSelected ? "text-[#14395C]" : "text-[#1E293B]"}`}>
                                ₹{displayPrice}
                              </span>
                              {/* Checkmark Badge on Selected Package */}
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-[#14395C] text-white flex items-center justify-center shrink-0 shadow-xs ml-1">
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Primary Participate / Book Now CTA Button */}
              <button
                ref={heroCtaRef}
                onClick={handleAddHomaToCart}
                className="w-full bg-[#14395C] hover:bg-[#0f2d4a] active:scale-95 text-white font-extrabold text-xl sm:text-2xl py-4 sm:py-4.5 px-8 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 mb-4 tracking-wide cursor-pointer"
              >
                <span>₹{priceVal.toLocaleString("en-IN")}</span>
                <span className="opacity-60 font-light">|</span>
                <span>Book Now</span>
              </button>

              {/* Secondary WhatsApp & Call Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://wa.me/9566777645"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 bg-white border border-[#CBD5E1] hover:border-[#14395C] text-[#1E293B] hover:bg-slate-50 font-extrabold text-xs sm:text-sm py-2.5 px-4 rounded-full transition-colors shadow-xs"
                >
                  <svg className="w-5 h-5 shrink-0 fill-[#14395C]" viewBox="0 0 24 24">
                    <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.758.459 3.474 1.33 4.982L2 22l5.144-1.348c1.455.793 3.097 1.21 4.864 1.21 5.505 0 9.989-4.478 9.99-9.985 0-5.506-4.484-9.984-9.986-9.984zm5.794 14.15c-.244.686-1.437 1.344-1.982 1.393-.526.048-1.018.257-3.418-.686-2.905-1.141-4.757-4.088-4.901-4.281-.144-.193-1.177-1.564-1.177-2.984 0-1.42.747-2.119 1.011-2.408.264-.289.576-.361.769-.361.192 0 .385.001.552.009.178.008.417-.067.653.498.243.582.83 2.023.902 2.168.072.144.12.312.024.504-.096.192-.144.312-.288.48-.144.168-.303.376-.432.504-.144.144-.294.302-.126.59.168.289.747 1.233 1.603 1.996 1.101.98 2.03 1.285 2.318 1.429.288.144.456.12.624-.072.168-.192.721-.84.913-1.128.192-.288.384-.24.648-.144.264.096 1.677.791 1.965.935.288.144.48.216.552.336.072.12.072.696-.172 1.382z" />
                  </svg>
                  <span>Book via WhatsApp</span>
                </a>
                <a
                  href="tel:+919677391108"
                  className="flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 bg-white border border-[#CBD5E1] hover:border-[#14395C] text-[#1E293B] hover:bg-slate-50 font-extrabold text-xs sm:text-sm py-2.5 px-4 rounded-full transition-colors shadow-xs"
                >
                  <svg className="w-4 h-4 min-w-[16px] min-h-[16px] fill-none stroke-[#14395C]" strokeWidth="2" viewBox="0 0 24 24">
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
      <div className="w-full bg-[#F1F5F9] border-y border-slate-200 py-3.5 sm:py-4.5 overflow-hidden">
        {/* Continuous Marquee on Phone, Tablet (Tab 768px) and 1024px screens (< xl) */}
        <div className="xl:hidden overflow-hidden w-full relative">
          <div className="flex animate-marquee gap-8 sm:gap-12 items-center text-xs sm:text-sm font-bold text-[#14395C]">
            {[
              { icon: "🎥", text: "Homa Video Delivered Within 48 hours" },
              { icon: "✓", text: "Verified & Experienced Pandits" },
              { icon: "🏛", text: "Homa Performed in Sacred Temples" },
              { icon: "📜", text: "100% Authentic Vedic Rituals" },
              { icon: "🎥", text: "Homa Video Delivered Within 48 hours" },
              { icon: "✓", text: "Verified & Experienced Pandits" },
              { icon: "🏛", text: "Homa Performed in Sacred Temples" },
              { icon: "📜", text: "100% Authentic Vedic Rituals" },
            ].map((b, idx) => (
              <span key={idx} className="flex items-center gap-2 shrink-0 whitespace-nowrap">
                <span className="bg-white rounded-full p-1 shadow-2xs text-[#14395C]">{b.icon}</span> {b.text}
              </span>
            ))}
          </div>
        </div>

        {/* Standard layout on XL desktop screens (>= 1280px) */}
        <div className="hidden xl:flex max-w-[1350px] mx-auto items-center justify-around gap-6 px-4 text-xs sm:text-sm font-bold text-[#14395C] whitespace-nowrap">
          <span className="flex items-center gap-2"><span className="bg-white rounded-full p-1 shadow-2xs text-[#14395C]">🎥</span> Homa Video Delivered Within 48 hours</span>
          <span className="flex items-center gap-2"><span className="bg-white rounded-full p-1 shadow-2xs text-[#14395C]">✓</span> Verified &amp; Experienced Pandits</span>
          <span className="flex items-center gap-2"><span className="bg-white rounded-full p-1 shadow-2xs text-[#14395C]">🏛</span> Homa Performed in Sacred Temples</span>
          <span className="flex items-center gap-2"><span className="bg-white rounded-full p-1 shadow-2xs text-[#14395C]">📜</span> 100% Authentic Vedic Rituals</span>
        </div>
      </div>

      {/* ── 2b. Ratings Stats & Action Strip (Wishlist & Share) Above Nav Tabs (Below 1000px only) ── */}
      <div className="lg:hidden w-full bg-white border-b border-stone-200/90 py-3 sm:py-3.5">
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-3">
          {/* Stats Container */}
          <div className="flex items-center gap-3 sm:gap-6 md:gap-8 overflow-x-auto no-scrollbar py-0.5">
            {/* Stat 1: Ratings */}
            <div className="text-left shrink-0">
              <span className="block text-xs sm:text-base lg:text-lg font-extrabold text-[#1f1a17] leading-tight">
                4.36L+
              </span>
              <span className="text-[10px] sm:text-xs text-stone-500 font-medium block mt-0.5 leading-tight">
                ratings
              </span>
            </div>

            <div className="w-[1px] h-6 sm:h-7 bg-stone-200 shrink-0" />

            {/* Stat 2: Homas Conducted */}
            <div className="text-left shrink-0">
              <span className="block text-xs sm:text-base lg:text-lg font-extrabold text-[#1f1a17] leading-tight">
                24L+
              </span>
              <span className="text-[10px] sm:text-xs text-stone-500 font-medium block mt-0.5 leading-tight">
                homas conducted
              </span>
            </div>

            <div className="w-[1px] h-6 sm:h-7 bg-stone-200 shrink-0" />

            {/* Stat 3: Average Ratings */}
            <div className="text-left shrink-0">
              <div className="flex items-center gap-0.5 sm:gap-1 leading-tight">
                <span className="text-xs sm:text-base lg:text-lg font-extrabold text-[#1f1a17]">
                  4.9/5
                </span>
                <span className="text-amber-400 text-xs sm:text-sm">⭐</span>
              </div>
              <span className="text-[10px] sm:text-xs text-stone-500 font-medium block mt-0.5 leading-tight">
                Average ratings
              </span>
            </div>
          </div>

          {/* Action Buttons: Wishlist & Share (Circular icon buttons matching Image 3) */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Circular Wishlist Button */}
            <WishlistButton
              itemId={homa._id}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-stone-300 hover:border-stone-500 bg-white flex items-center justify-center text-stone-700 shadow-2xs hover:bg-stone-50 transition-all active:scale-95"
              iconClassName="w-4 h-4 sm:w-5 sm:h-5"
            />

            {/* Circular Share Button */}
            <button
              type="button"
              aria-label="Share homa"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: homa.title, url: window.location.href });
                } else {
                  navigator.clipboard?.writeText(window.location.href);
                  setShareSuccess(true);
                  setTimeout(() => setShareSuccess(false), 2000);
                }
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-stone-300 hover:border-stone-500 bg-white flex items-center justify-center text-stone-700 shadow-2xs hover:bg-stone-50 transition-all active:scale-95 relative"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 fill-none stroke-current"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              {shareSuccess && (
                <span className="absolute -top-7 right-0 bg-stone-900 text-white text-[10px] font-semibold py-0.5 px-2 rounded shadow-sm whitespace-nowrap">
                  Copied!
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. Sticky Sub-navigation Tabs Bar ── */}
      <div className="sticky top-[60px] sm:top-[68px] lg:top-[70px] xl:top-[76px] z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-xs pt-1 sm:pt-2 w-full">
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-10">
          <div
            className="w-full flex items-center justify-between overflow-x-auto no-scrollbar gap-2 sm:gap-4 text-xs sm:text-sm font-bold text-stone-600 scroll-smooth"
          >
            {subHomaTabs.map((tab) => (
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
                className={`py-2.5 sm:py-3.5 border-b-2 transition-colors whitespace-nowrap shrink-0 sm:shrink ${activeTab === tab.id
                  ? "border-[#881337] text-[#881337]"
                  : "border-transparent hover:text-[#1E293B]"
                  }`}
              >
                {tab.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. Main 2-Column Body Layout ── */}
      <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-10 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-12">

          {/* Section: About Homa */}
          <section id="about" className="scroll-mt-36">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#881337] mb-6">About homa</h2>

            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xs">
              <p className="text-[#1E293B] text-sm sm:text-base leading-relaxed font-normal mb-6">
                {aboutText}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#E2E8F0] pt-6 text-xs text-[#64748B]">
                <div>
                  <span className="text-[#94A3B8] font-bold block mb-1 uppercase tracking-wider">Occasion</span>
                  <span className="font-extrabold text-[#1E293B]">{homa.date || "Auspicious Tithis"}</span>
                </div>
                <div>
                  <span className="text-[#94A3B8] font-bold block mb-1 uppercase tracking-wider">Duration</span>
                  <span className="font-extrabold text-[#1E293B]">~2 Hours</span>
                </div>
                <div>
                  <span className="text-[#94A3B8] font-bold block mb-1 uppercase tracking-wider">Venue</span>
                  <span className="font-extrabold text-[#1E293B]">Temple Yagashala</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Homa Benefits */}
          <section id="benefits" className="scroll-mt-36">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#881337] mb-6">Homa Benefits</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {benefitsList.map((b, idx) => {
                const iconPillStyles = [
                  "bg-amber-100 text-[#F59E0B]",
                  "bg-purple-100 text-[#7B61FF]",
                  "bg-purple-100 text-[#7B61FF]",
                  "bg-indigo-100 text-[#14395C]",
                  "bg-indigo-100 text-[#14395C]",
                ];
                const pillStyle = iconPillStyles[idx % iconPillStyles.length];

                return (
                  <div key={idx} className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-5 flex items-start gap-4 shadow-xs hover:shadow-md transition-shadow">
                    <div className={`w-10 h-10 rounded-xl ${pillStyle} flex items-center justify-center shrink-0 font-bold`}>
                      {b.icon || "🔥"}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1E293B] text-sm sm:text-base mb-1">{b.title}</h3>
                      <p className="text-[#64748B] text-xs sm:text-sm leading-relaxed">{b.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section: Homa Procedure */}
          <section id="process" className="scroll-mt-36">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#881337] mb-6">Homa Procedure</h2>
            <div className="space-y-4">
              {processList.map((step, idx) => (
                <div key={idx} className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-5 flex items-center justify-between gap-4 shadow-xs transition-all">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#14395C] text-white flex items-center justify-center shrink-0 font-bold text-sm">
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#1E293B] text-sm sm:text-base mb-0.5">{step.title}</h3>
                      <p className="text-[#64748B] text-xs sm:text-sm leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-[#94A3B8] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Temple Details */}
          <section id="temple" className="scroll-mt-36">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#881337] mb-6">Temple Details</h2>
            <div className="bg-white border border-[#E2E8F0] rounded-3xl flex flex-col md:flex-row gap-6 items-center shadow-xs overflow-hidden">
              {templeImage && (
                <div className="w-full md:w-1/3 h-48 rounded-2xl overflow-hidden bg-stone-100 shrink-0 relative">
                  <Image
                    src={templeImage}
                    alt={`${templeVenueText || "Temple"} - ${templeLocationText || "Sacred Temple Venue"}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 p-5 text-center sm:text-left">
                <h3 className="font-serif font-bold text-[#1E293B] text-xl mb-2">{templeVenueText}</h3>
                <p className="text-[#64748B] text-xs sm:text-sm leading-relaxed font-medium mb-4">
                  {templeNoteText}
                </p>
                <span className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-[#14395C]">
                  📍 {templeLocationText}
                </span>
              </div>
            </div>
          </section>

          {/* Section: What will you receive */}
          <section id="receive" className="scroll-mt-36">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#881337] mb-6">What will you receive</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {inclusionsList.map((inc: any, idx: number) => {
                const title = typeof inc === "string" ? inc : inc.title || inc.name || `Inclusion ${idx + 1}`;
                const desc = typeof inc === "string" ? "Included in your sacred booking." : inc.description || "Included in your sacred booking.";
                return (
                  <div key={idx} className="bg-white border border-[#E2E8F0] rounded-2xl p-5 flex items-start gap-4 shadow-xs">
                    <div className="w-10 h-10 rounded-full bg-[#14395C] text-white flex items-center justify-center shrink-0 font-bold text-sm">
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1E293B] text-sm sm:text-base mb-1">{title}</h3>
                      {desc && <p className="text-[#64748B] text-xs sm:text-sm leading-relaxed">{desc}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section: Frequently Asked Questions (FAQs) */}
          <section id="faqs" className="scroll-mt-36">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#881337] mb-6">Frequently Asked Questions (FAQs)</h2>
            <div className="space-y-3">
              {faqList.map((faq, idx) => (
                <div
                  key={idx}
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className={`border rounded-2xl px-5 py-4 transition-all duration-300 cursor-pointer select-none ${openFaqIndex === idx ? 'border-[#14395C] bg-white shadow-xs' : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'}`}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm sm:text-base font-bold text-[#1E293B]">{faq.question}</h4>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ml-4 ${openFaqIndex === idx ? 'bg-[#14395C] text-white' : 'bg-slate-100 text-[#64748B]'}`}>
                      {openFaqIndex === idx ? '−' : '+'}
                    </div>
                  </div>
                  {openFaqIndex === idx && (
                    <div className="mt-3 text-xs sm:text-sm text-[#64748B] leading-relaxed border-t border-slate-100 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Section: Homa Gallery */}
          {galleryList.length > 0 && (
            <section id="gallery" className="scroll-mt-36 pb-4 sm:pb-28 lg:pb-36">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E293B] mb-6">Homa Gallery</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {galleryList.map((img: string, idx: number) => (
                  <div key={idx} className="h-48 rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-xs relative">
                    <Image
                      src={img}
                      alt={`${homa?.title || "Homa"} - Sacred Ritual Photo ${idx + 1}`}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      unoptimized
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* Right Sidebar Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6 pt-0 sm:pt-4 pb-16 sm:pb-20 lg:pb-36">

          {/* Dedicated Vedic Homa Sticky Card */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 sm:p-6 pb-6 sm:pb-8 shadow-xs static lg:sticky lg:top-[140px] xl:top-[144px] space-y-4 sm:space-y-5 mb-0 lg:mb-28">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="font-serif font-bold text-[#1E293B] text-base">Dedicated Vedic Homa</h3>
                <span className="text-xs text-[#64748B] font-semibold">100% Authentic Fire Lab</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm text-[#1E293B] font-medium">
              <div className="flex items-start gap-2.5">
                <span className="text-[#16a34a] font-bold text-base shrink-0">✓</span>
                <span>Personalized Sankalpam performed with your Name, Gotra &amp; Wish</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-[#16a34a] font-bold text-base shrink-0">✓</span>
                <span>Full Homa Video Recording delivered on WhatsApp within 48 hours</span>
              </div>
            </div>

            {/* WhatsApp Agent Container with Dedicated Margin & Padding */}
            <div className="border-t border-[#E2E8F0] pt-5 mt-4 mb-2 pb-1">
              <h4 className="font-bold text-[#1E293B] text-sm mb-1.5">Unsure which homa to book?</h4>
              <p className="text-[#64748B] text-xs mb-3.5 leading-relaxed font-medium">
                Our devotee care team is available in 11 languages, 12 hours a day. Reach them on WhatsApp.
              </p>
              <div className="mt-3 mb-1">
                <a
                  href="https://wa.me/9566777645"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#14395C] hover:bg-[#0f2d4a] text-white font-extrabold text-xs sm:text-sm py-3 px-4 rounded-full transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
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

      </div>

      {/* ── 5. Sticky Floating Action Bar at Bottom ── */}
      <div
        className={`fixed bottom-[74px] sm:bottom-[78px] lg:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-[1250px] transition-all duration-300 transform ${showStickyBar
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-12 opacity-0 pointer-events-none"
          }`}
      >
        <div className="bg-[#14395C] text-white rounded-2xl sm:rounded-3xl p-3 sm:py-3.5 sm:px-6 flex items-center justify-between shadow-2xl shadow-slate-950/30 border border-slate-700/20 backdrop-blur-md">
          {/* Left Column: Lotus Icon + Uppercase Title + Price */}
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 pr-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white text-[#14395C] flex items-center justify-center shrink-0 shadow-sm">
              <svg className="w-6 h-6 fill-[#14395C]" viewBox="0 0 24 24">
                <path d="M12 3c-1.5 2.5-3 5-3 7.5 0 2.5 1.5 4.5 3 4.5s3-2 3-4.5C15 8 13.5 5.5 12 3zm0 14c-4.5 0-7.5-2.5-9-5 1.5 4.5 5.5 7.5 9 7.5s7.5-3 9-7.5c-1.5 2.5-4.5 5-9 5z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] sm:text-xs font-extrabold text-slate-200 tracking-wider uppercase block truncate">
                {homa.title}
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-white block leading-tight mt-0.5">
                ₹{priceVal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Right Column: White Pill Button with Navy Circle Arrow */}
          <button
            onClick={handleAddHomaToCart}
            className="bg-white hover:bg-slate-100 active:scale-95 text-[#14395C] font-extrabold text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-full shadow-md transition-all flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer"
          >
            <span>Book Now</span>
            <div className="w-6 h-6 rounded-full bg-[#14395C] text-white flex items-center justify-center shrink-0">
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
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-2xl font-serif font-bold text-[#1E293B] mb-2">Select Package</h3>
            <p className="text-[#64748B] text-xs sm:text-sm mb-6">Choose your desired package for sacred fire lab participation.</p>

            {packagesList.length > 0 && (
              <div className="space-y-4 mb-6">
                {packagesList.map((pkg) => {
                  const isSelected = selectedPackage?.id === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackageId(pkg.id)}
                      className={`border-2 rounded-2xl p-4 cursor-pointer transition-all flex items-center justify-between ${isSelected
                        ? "border-[#14395C] bg-[#F1F5F9]/60 shadow-xs"
                        : "border-[#E2E8F0] hover:border-[#CBD5E1] bg-white"
                        }`}
                    >
                      <div>
                        <h4 className="font-bold text-[#1E293B] text-base">{pkg.name}</h4>
                        <p className="text-[#64748B] text-xs mt-1">{pkg.description || "Includes personalized sankalpam and video proof."}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-lg text-[#1E293B] block">₹{getDisplayPrice(pkg)}</span>
                        <span className="text-[10px] font-bold text-[#14395C] uppercase">{isSelected ? "Selected ✓" : "Select"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => {
                setShowPackageModal(false);
                handleAddHomaToCart();
              }}
              className="w-full bg-[#14395C] hover:bg-[#0f2d4a] text-white font-extrabold text-base py-3.5 rounded-full shadow-md transition-all cursor-pointer"
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
