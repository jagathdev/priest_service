"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LoginModal from "@/components/auth/LoginModal";
import { checkAuthStatus } from "@/lib/authCheck";
import { XMarkIcon } from "@heroicons/react/24/solid";
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

export default function HomaDetailClient({
  initialHoma,
  recommendations = [],
}: {
  initialHoma: Homa | null;
  recommendations?: Homa[];
}) {
  const params = useParams<{ slug: string }>();
  const slugParam = params?.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  const currency = "INR";
  const currencySymbol = "₹";

  const [homa, setHoma] = useState<Homa | null>(initialHoma);
  const [loading, setLoading] = useState(!initialHoma);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    initialHoma?.packages?.[0]?.id ?? null
  );
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

        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://priestservices.astroved.com";
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

  const defaultPackageAvatars = [
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1609234656388-0ff363383899?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=150&q=80",
  ];

  // Compute normalized package list from Admin data or defaults
  const packagesList = useMemo(() => {
    const normalizePackageName = (rawName: string, idx: number) => {
      const lower = (rawName || "").toLowerCase();
      if (lower.includes("individual")) return "Individual Homa";
      if (lower.includes("couple")) return "Couple Homa";
      if (lower.includes("family")) return "Family Homa";
      if (idx === 0) return "Individual Homa";
      if (idx === 1) return "Couple Homa";
      if (idx === 2) return "Family Homa";
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
          imageUrl: pkg.imageUrl || defaultPackageAvatars[idx % defaultPackageAvatars.length],
        };
      });
    }

    const basePrice = homa?.price || 1250;
    return [
      {
        id: "pkg-1",
        name: "Individual Homa",
        devoteeCount: "1 Devotee",
        priceINR: basePrice,
        description: "Personalized Sankalpam for 1 Person with havan video recording.",
        imageUrl: defaultPackageAvatars[0],
      },
      {
        id: "pkg-2",
        name: "Couple Homa",
        devoteeCount: "2 Devotees",
        priceINR: basePrice + 300,
        description: "Personalized Sankalpam for Couple / 2 Devotees.",
        imageUrl: defaultPackageAvatars[1],
      },
      {
        id: "pkg-3",
        name: "Family Homa",
        devoteeCount: "4 Devotees",
        priceINR: basePrice + 600,
        description: "Personalized Sankalpam for 4 Family Members.",
        imageUrl: defaultPackageAvatars[2],
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
    setAddingToCart(true);
    setCartError("");
    try {
      const { is_user } = await checkAuthStatus();
      const actualHomaId = homa?._id || (homa as any)?.id || slug;
      const totalAmount = priceVal;

      const sankalpUrl = `/sankalp?pujaId=${encodeURIComponent(actualHomaId)}&amount=${totalAmount}&type=homa&pkg=${selectedPackageId || ""}&name=${encodeURIComponent(
        userDetails.name
      )}&wa=${userDetails.whatsapp}&title=${encodeURIComponent(homa?.title || "")}&slug=${encodeURIComponent(
        slug || ""
      )}`;

      if (!is_user) {
        setPendingSankalpUrl(sankalpUrl);
        setShowLoginModal(true);
        return;
      }
      window.location.href = sankalpUrl;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred. Please try again.";
      setCartError(errorMessage);
    } finally {
      setAddingToCart(false);
    }
  };

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
            className="bg-[#00b050] text-white font-extrabold px-8 py-3 rounded-full hover:bg-[#009b46] transition-colors"
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

  return (
    <main className="min-h-screen bg-white text-[#1f1f1f] font-sans pb-24">
      <Navbar />

      {/* ── 1. Top Hero Section ── */}
      <section className="bg-[#faf9f6] border-b border-[#f0e4d0] py-8 sm:py-12">
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left 6 Cols: Main Banner Image (Slightly Increased Width) */}
            <div className="lg:col-span-6 flex flex-col">
              <div className="relative w-full h-[280px] sm:h-[350px] md:h-[390px] lg:h-[410px] rounded-3xl overflow-hidden border border-stone-200/90 shadow-md group">
                <img
                  src={getHomaImageUrl(homa.imageUrl)}
                  alt={homa.title}
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {/* Carousel Dots */}
              <div className="flex items-center justify-center gap-2 mt-3 mb-1">
                <div className="w-7 h-2 bg-[#00b050] rounded-full transition-all" />
                <div className="w-2.5 h-2.5 bg-stone-300 rounded-full" />
                <div className="w-2.5 h-2.5 bg-stone-300 rounded-full" />
                <div className="w-2.5 h-2.5 bg-stone-300 rounded-full" />
              </div>

              {/* Frameless Ratings / Stat & Action Strip Under Image (Fits exact image width) */}
              <div className="flex items-center justify-between gap-1.5 sm:gap-2 mt-2.5 w-full px-0.5">
                {/* Stat 1: Ratings */}
                <div className="text-center flex-1 min-w-0">
                  <span className="block text-sm sm:text-base lg:text-lg font-extrabold text-[#1f1a17] leading-none">4.36L+</span>
                  <span className="text-[10px] sm:text-xs text-stone-500 font-medium block mt-1 leading-none">ratings</span>
                </div>

                <div className="w-[1px] h-5 sm:h-6 bg-stone-300/80 shrink-0" />

                {/* Stat 2: Homas Conducted */}
                <div className="text-center flex-1 min-w-0">
                  <span className="block text-sm sm:text-base lg:text-lg font-extrabold text-[#1f1a17] leading-none">24L+</span>
                  <span className="text-[10px] sm:text-xs text-stone-500 font-medium block whitespace-nowrap mt-1 leading-none">homas conducted</span>
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
                    itemId={homa._id}
                    text="Wishlist"
                    className="border border-stone-400/90 hover:border-stone-700 bg-white text-stone-800 font-medium text-xs sm:text-sm px-3 sm:px-4 py-1.5 rounded-full flex items-center justify-center gap-1 sm:gap-1.5 transition-all active:scale-95 shrink-0"
                    iconClassName="w-3.5 h-3.5 sm:w-4 sm:h-4"
                  />

                  {/* Share Button */}
                  <button
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
                {homa.title}
              </h1>

              {/* Subtitle / Description */}
              <p className="text-stone-600 text-sm sm:text-base font-medium leading-relaxed mb-6">
                {descriptionText}
              </p>

              {/* Dynamic Countdown & Temple Card fetched from Dashboard */}
              <PujaCountdownCard
                templeVenue={templeVenueText || "Sacred Temple Yagashala"}
                location={homa.location || homa.templeLocation || "India"}
                dateText={homa.date || "Saturday, 10 October"}
                occasionText={homa.subtitle || homa.badge || (homa as any).tithis || "Special Vedic Homa"}
                eventDateTime={homa.eventDateTime}
                title="Reserve your sankalp"
                badgeLabel="MUHURAT ENDS IN"
                className="mb-5"
              />

              {/* Package Selection Cards Grid (Border & top header removed) */}
              {packagesList.length > 0 && (
                <div className="mb-5">
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
              )}

              {/* Primary Participate / Book Now CTA Button */}
              <button
                ref={heroCtaRef}
                onClick={handleAddHomaToCart}
                className="w-full bg-[#00b050] hover:bg-[#009644] active:scale-95 text-white font-extrabold text-base sm:text-lg py-3 px-6 rounded-full shadow-md transition-all flex items-center justify-center gap-2.5 mb-3.5"
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
          <span className="flex items-center gap-2"><span className="bg-green-100 rounded-full p-1">🎥</span> Homa Video Delivered Within 48 hours</span>
          <span className="flex items-center gap-2"><span className="bg-green-100 rounded-full p-1">✓</span> Verified &amp; Experienced Pandits</span>
          <span className="flex items-center gap-2"><span className="bg-green-100 rounded-full p-1">🏛</span> Homa Performed in Sacred Temples</span>
          <span className="flex items-center gap-2"><span className="bg-green-100 rounded-full p-1">📜</span> 100% Authentic Vedic Rituals</span>
        </div>
      </div>

      {/* ── 3. Sticky Sub-navigation Tabs Bar ── */}
      <div className="sticky top-[76px] z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-xs pt-2 sm:pt-3">
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-10 flex overflow-x-auto no-scrollbar gap-6 text-xs sm:text-sm font-bold text-stone-600">
          {[
            { id: "about", label: "About homa" },
            { id: "benefits", label: "Homa Benefits" },
            { id: "process", label: "Homa Procedure" },
            { id: "temple", label: "Temple Details" },
            { id: "receive", label: "What will you receive" },
            { id: "faqs", label: "Frequently Asked Questions (FAQs)" },
            { id: "gallery", label: "Homa Gallery" },
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
              className={`py-3 sm:py-3.5 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
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

          {/* Section: About Homa */}
          <section id="about" className="scroll-mt-32">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1a17] mb-6">About homa</h2>

            <div className="bg-[#fdfbf7] border border-[#f0e4d0] rounded-3xl p-6 sm:p-8 relative overflow-hidden mb-8">
              <p className="text-stone-700 text-sm sm:text-base leading-relaxed font-medium mb-6">
                {aboutText}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#f0e4d0] pt-6 text-xs text-stone-700">
                <div>
                  <span className="text-stone-400 font-bold block mb-1 uppercase tracking-wider">Occasion</span>
                  <span className="font-extrabold text-stone-900">{homa.date || "Auspicious Tithis"}</span>
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
              <h3 className="text-xl font-serif font-bold text-[#1f1a17] mb-4">Homa Benefits</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {benefitsList.map((b, idx) => (
                  <div key={idx} className="bg-white border border-stone-200/90 rounded-2xl p-5 flex items-start gap-4 shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-[#800000] text-white flex items-center justify-center shrink-0 font-bold">
                      {b.icon || "🔥"}
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

          {/* Section: Homa Procedure */}
          <section id="process" className="scroll-mt-32">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1a17] mb-6">Homa Procedure</h2>
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

          {/* Section: Homa Gallery */}
          {galleryList.length > 0 && (
            <section id="gallery" className="scroll-mt-32">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1a17] mb-6">Homa Gallery</h2>
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
        <div className="lg:col-span-4 space-y-6 pt-2 sm:pt-4">

          {/* Dedicated Vedic Homa Sticky Card */}
          <div className="bg-[#fdfbf7] border border-[#f0e4d0] rounded-3xl p-6 shadow-xs sticky top-[164px] space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#800000] text-white flex items-center justify-center font-bold">🔥</div>
              <div>
                <h3 className="font-serif font-bold text-stone-900 text-base">Dedicated Vedic Homa</h3>
                <span className="text-xs text-stone-500 font-semibold">100% Authentic Fire Lab</span>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-stone-700 font-medium">
              <div className="flex items-start gap-2.5">
                <span className="text-[#00b050] font-bold text-base">✓</span>
                <span>Personalized Sankalpam performed with your Name, Gotra &amp; Wish</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-[#00b050] font-bold text-base">✓</span>
                <span>Full Homa Video Recording delivered on WhatsApp within 48 hours</span>
              </div>
            </div>

            <div className="border-t border-[#f0e4d0] pt-6">
              <h4 className="font-bold text-stone-900 text-sm mb-2">Unsure which homa to book?</h4>
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

      {/* ── 5. Sticky Floating Action Bar at Bottom (Only shows when hero Book Now button scrolls out of view) ── */}
      <div
        className={`fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-[1100px] transition-all duration-300 transform ${
          showStickyBar
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-12 opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-[#00b050] text-white rounded-full p-2 sm:p-3 sm:px-6 flex items-center justify-between shadow-2xl shadow-green-900/40 border border-green-400/30 backdrop-blur-md overflow-hidden">
          <div className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2 flex-1 min-w-0 pr-2">
            <span className="bg-white text-[#00b050] rounded-full flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 text-sm shrink-0 shadow-sm">🔥</span>
            <div className="flex-1 min-w-0">
              <span className="font-serif font-bold text-xs sm:text-sm block truncate w-full">{homa.title}</span>
              <span className="font-extrabold text-base sm:text-xl block leading-none mt-0.5">₹{priceVal}</span>
            </div>
          </div>
          <button
            onClick={() => setShowPackageModal(true)}
            className="bg-white text-[#00b050] hover:bg-green-50 active:scale-95 font-extrabold text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-full shadow-md transition-all flex items-center gap-1 sm:gap-1.5 shrink-0 whitespace-nowrap mr-1 sm:mr-0"
          >
            <span>Participate</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
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
            <p className="text-stone-600 text-xs sm:text-sm mb-6">Choose your desired package for sacred fire lab participation.</p>

            {packagesList.length > 0 && (
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
            )}

            <button
              onClick={() => {
                setShowPackageModal(false);
                handleAddHomaToCart();
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
