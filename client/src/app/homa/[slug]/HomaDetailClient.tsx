"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LoginModal from "@/components/auth/LoginModal";
import { checkAuthStatus } from "@/lib/authCheck";
import { XMarkIcon } from "@heroicons/react/24/solid";
import WishlistButton from "@/components/common/WishlistButton";
import PujaCountdownCard from "@/components/common/PujaCountdownCard";
import GalleryLightboxModal from "@/components/common/GalleryLightboxModal";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  MessageCircle,
  Share2,
  Check,
  Phone,
  Flame,
  ArrowRight,
} from "lucide-react";

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
  buttonText?: string;
  trustBadges?: string[];
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
  const safeEncode = (url: string) => {
    try {
      return encodeURI(decodeURI(url));
    } catch {
      return encodeURI(url);
    }
  };
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) {
    return safeEncode(trimmed);
  }
  if (trimmed.startsWith("/")) {
    return safeEncode(trimmed);
  }
  return `/${safeEncode(trimmed)}`;
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
  const [galleryLightboxOpen, setGalleryLightboxOpen] = useState(false);
  const [lightboxImageIdx, setLightboxImageIdx] = useState(0);
  const [failedGalleryImages, setFailedGalleryImages] = useState<Record<string, boolean>>({});
  const heroCtaRef = useRef<HTMLButtonElement | null>(null);
  const tabsContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (tabsContainerRef.current) {
      const activeEl = tabsContainerRef.current.querySelector(`[data-tab-id="${activeTab}"]`) as HTMLElement;
      if (activeEl) {
        const container = tabsContainerRef.current;
        const left = activeEl.offsetLeft - (container.offsetWidth / 2) + (activeEl.offsetWidth / 2);
        container.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
      }
    }
  }, [activeTab]);

  // Scroll handler to show bottom sticky bar ONLY after user has scrolled into the below sections
  useEffect(() => {
    const handleScroll = () => {
      // If user is near the top (in hero), NEVER show the sticky bar
      if (window.scrollY < 350) {
        setShowStickyBar(false);
        return;
      }

      const aboutSec = document.getElementById("about");
      const heroCta = heroCtaRef.current;

      // If the hero CTA button is still on screen, do not show sticky bar yet
      if (heroCta) {
        const ctaRect = heroCta.getBoundingClientRect();
        if (ctaRect.bottom > 40) {
          setShowStickyBar(false);
          return;
        }
      }

      if (aboutSec) {
        const aboutRect = aboutSec.getBoundingClientRect();
        // Only show once user is actively viewing/scrolling the below sections
        setShowStickyBar(aboutRect.top <= 140);
      } else {
        setShowStickyBar(window.scrollY > 600);
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

        const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
        const isClient = typeof window !== "undefined";
        const isLanMobile = isClient && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" && rawBaseUrl.includes("localhost");
        const backendUrl = isLanMobile ? "" : rawBaseUrl;
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

  // Handle Tab Scroll Listener (Accurate getBoundingClientRect viewport detection for iOS & Desktop)
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["about", "benefits", "process", "temple", "receive", "faqs", "gallery"];
      const headerOffset = window.innerWidth < 640 ? 120 : 150;

      // Check if user has reached or scrolled near the bottom of the page
      const scrollBottom = window.innerHeight + window.pageYOffset;
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight
      );
      const isAtBottom = scrollBottom >= docHeight - 120;

      if (isAtBottom && document.getElementById("gallery")) {
        setActiveTab("gallery");
        return;
      }

      let currentSection = sections[0];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= headerOffset + 50) {
            currentSection = sectionId;
          }
        }
      }

      setActiveTab((prev) => (prev !== currentSection ? currentSection : prev));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll-triggered viewport reveal observer (only appears when element enters viewport for the first time)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const revealEl = (el: HTMLElement) => {
      el.setAttribute("data-revealed", "true");
      el.classList.add("is-revealed");
    };

    const checkAndReveal = () => {
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const elements = document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed='true'])");
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= windowHeight - 30) {
          revealEl(el);
        }
      });
    };

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              revealEl(entry.target as HTMLElement);
              observer?.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0,
          rootMargin: "0px 0px -30px 0px",
        }
      );

      const elements = document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed='true'])");
      elements.forEach((el) => observer?.observe(el));
    }

    checkAndReveal();
    window.addEventListener("scroll", checkAndReveal, { passive: true });
    window.addEventListener("resize", checkAndReveal, { passive: true });

    const timer1 = setTimeout(checkAndReveal, 100);
    const timer2 = setTimeout(checkAndReveal, 350);

    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", checkAndReveal);
      window.removeEventListener("resize", checkAndReveal);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [loading, homa]);



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

  // Auto-advance banner every 5 seconds
  useEffect(() => {
    if (bannerImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [bannerImages.length]);

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

  const galleryList = (
    Array.isArray(homa.gallery) && homa.gallery.length > 0
      ? homa.gallery.map((img: string) => getHomaImageUrl(img)).filter(Boolean)
      : Array.isArray(homa.galleryUrl) && homa.galleryUrl.length > 0
        ? homa.galleryUrl.map((img: string) => getHomaImageUrl(img)).filter(Boolean)
        : typeof homa.galleryUrl === "string" && homa.galleryUrl.trim()
          ? [getHomaImageUrl(homa.galleryUrl)]
          : []
  ).filter((img: string) => !failedGalleryImages[img]);

  const templeImage =
    (typeof homa.templeImageUrl === "string" && homa.templeImageUrl.trim()) ||
    (typeof homa.templeImage === "string" && homa.templeImage.trim()) ||
    (typeof homa.details?.templeImageUrl === "string" && homa.details.templeImageUrl.trim()) ||
    (typeof homa.details?.templeImage === "string" && homa.details.templeImage.trim()) ||
    "";

  const subHomaTabs = [
    { id: "about", label: "About homa" },
    { id: "benefits", label: "Homa Benefits" },
    { id: "process", label: "Homa Procedure" },
    { id: "temple", label: "Temple Details" },
    { id: "receive", label: "What will you receive" },
    { id: "faqs", label: "FAQs" },
  ];

  const renderAboutContent = (text: string) => {
    if (!text) return null;

    let blocks: string[] = [];
    if (text.includes("\n")) {
      blocks = text
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean);
    } else {
      const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g);
      if (sentences && sentences.length > 1) {
        blocks = sentences.map((s) => s.trim()).filter(Boolean);
      } else {
        blocks = [text];
      }
    }

    if (blocks.length <= 1) {
      return (
        <p className="text-stone-700 text-sm sm:text-base leading-relaxed font-medium mb-6">
          {text}
        </p>
      );
    }

    const [lead, ...details] = blocks;

    return (
      <div className="space-y-4 mb-6">
        <div className="bg-[#faf6f0] border-l-4 border-[#F47820] rounded-r-2xl p-4 sm:p-5 shadow-2xs">
          <p className="text-stone-800 text-sm sm:text-[15px] font-semibold leading-relaxed">
            {lead}
          </p>
        </div>

        <div className="space-y-2.5 pt-1">
          {details.map((point, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 bg-white/90 border border-[#f0e4d0] rounded-xl p-3 sm:p-3.5 hover:shadow-xs transition-all"
            >
              <span className="w-5 h-5 rounded-full bg-amber-100 text-[#F47820] flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 shadow-2xs">
                ✦
              </span>
              <p className="text-stone-700 text-xs sm:text-sm leading-relaxed font-medium">
                {point}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-white text-[#1f1f1f] font-sans pb-52 sm:pb-56 lg:pb-40">
      <Navbar />

      {/* ── 1. Top Hero Section ── */}
      <section data-reveal className="bg-[#faf9f6] border-b border-[#f0e4d0] py-8 sm:py-12">
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left 6 Cols: Main Banner Image (Slightly Increased Width) */}
            <div className="lg:col-span-6 flex flex-col relative">
              <div className="relative w-full aspect-[4/3] min-h-[260px] sm:min-h-0 sm:aspect-auto sm:h-[350px] md:h-[390px] lg:h-[410px] rounded-3xl overflow-hidden border border-stone-200/90 shadow-md group">
                <Image
                  src={bannerImages[activeBannerIndex] || (homa ? getHomaImageUrl(homa.imageUrl) : "/images/Ganesh-Chaturthi-Mahapuja.jpg")}
                  alt={`${homa?.title || "Homa"} - Sacred Ritual Banner ${activeBannerIndex + 1}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  unoptimized
                  className="w-full h-full object-cover object-center transition-all duration-300 cursor-pointer"
                  onClick={handleAddHomaToCart}
                />
              </div>

              {/* Navigation Arrows: Outside image card on Tablet & Laptop/Desktop (hidden on mobile < sm) */}
              {bannerImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveBannerIndex((prev) => (prev - 1 + bannerImages.length) % bannerImages.length);
                    }}
                    aria-label="Previous banner image"
                    className="absolute -left-3.5 sm:-left-4 md:-left-5 xl:-left-6 top-[calc(50%-18px)] -translate-y-1/2 z-30 hidden sm:flex h-9 w-9 xl:h-11 xl:w-11 items-center justify-center rounded-full bg-white/95 hover:bg-white text-stone-800 border border-stone-200/90 shadow-xl transition-all duration-200 active:scale-95 cursor-pointer hover:scale-110 backdrop-blur-sm"
                  >
                    <ChevronLeft className="w-5 h-5 xl:w-6 xl:h-6 text-stone-800" strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveBannerIndex((prev) => (prev + 1) % bannerImages.length);
                    }}
                    aria-label="Next banner image"
                    className="absolute -right-3.5 sm:-right-4 md:-right-5 xl:-right-6 top-[calc(50%-18px)] -translate-y-1/2 z-30 hidden sm:flex h-9 w-9 xl:h-11 xl:w-11 items-center justify-center rounded-full bg-white/95 hover:bg-white text-stone-800 border border-stone-200/90 shadow-xl transition-all duration-200 active:scale-95 cursor-pointer hover:scale-110 backdrop-blur-sm"
                  >
                    <ChevronRight className="w-5 h-5 xl:w-6 xl:h-6 text-stone-800" strokeWidth={2.5} />
                  </button>
                </>
              )}

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
              <div className="hidden lg:flex flex-row items-center justify-between gap-2 xl:gap-3 mt-3 w-full">
                {/* Stats Container */}
                <div className="flex items-center justify-between flex-1 py-0 px-0">
                  {/* Stat 1: Ratings */}
                  <div className="text-center flex-1 px-0.5 xl:px-1">
                    <span className="block text-sm lg:text-[14px] xl:text-base 2xl:text-lg font-extrabold text-[#1f1a17] leading-tight whitespace-nowrap">10M+</span>
                    <span className="text-[10px] xl:text-[11px] 2xl:text-xs text-stone-500 font-medium block mt-0.5 leading-tight">poojas performed</span>
                  </div>

                  <div className="w-[1px] h-5 xl:h-6 bg-stone-300/80 shrink-0" />

                  {/* Stat 2: Homas Conducted */}
                  <div className="text-center flex-1 px-0.5 xl:px-1">
                    <span className="block text-sm lg:text-[14px] xl:text-base 2xl:text-lg font-extrabold text-[#1f1a17] leading-tight whitespace-nowrap">180+</span>
                    <span className="text-[10px] xl:text-[11px] 2xl:text-xs text-stone-500 font-medium block mt-0.5 leading-tight">scholars and priests</span>
                  </div>

                  <div className="w-[1px] h-5 xl:h-6 bg-stone-300/80 shrink-0" />

                  {/* Stat 3: Years of Vedic Expertise */}
                  <div className="text-center flex-1 px-0.5 xl:px-1">
                    <span className="block text-sm lg:text-[14px] xl:text-base 2xl:text-lg font-extrabold text-[#1f1a17] leading-tight whitespace-nowrap">25+ years</span>
                    <span className="text-[10px] xl:text-[11px] 2xl:text-xs text-stone-500 font-medium block mt-0.5 leading-tight">of Vedic expertise</span>
                  </div>
                </div>

                {/* Action Buttons: Wishlist & Share */}
                <div className="flex items-center justify-end gap-1.5 xl:gap-2 shrink-0">
                  <WishlistButton
                    itemId={homa._id}
                    text="Wishlist"
                    className="flex-initial border border-stone-300 hover:border-stone-500 bg-white text-stone-800 font-medium text-xs xl:text-sm px-3 xl:px-4 py-1.5 rounded-full flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs"
                    iconClassName="w-3.5 h-3.5 xl:w-4 xl:h-4"
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
                    className="flex-initial border border-stone-300 hover:border-stone-500 bg-white text-stone-800 font-medium text-xs xl:text-sm px-3 xl:px-4 py-1.5 rounded-full flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs"
                  >
                    <Share2 className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                    <span>{shareSuccess ? "Copied!" : "Share"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right 6 Cols: Details & CTA */}
            <div className="lg:col-span-6 flex flex-col lg:pl-[10px]">
              {/* Filigree Subtag */}
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                <div className="w-8 h-[1px] bg-[#F47820]/40" />
                <span className="text-[#F47820] font-serif font-extrabold text-xs sm:text-[13px] tracking-wider uppercase flex items-center gap-1.5">
                  <span className="text-[10px]">♦</span> {badgeText} <span className="text-[10px]">♦</span>
                </span>
                <div className="w-8 h-[1px] bg-[#F47820]/40" />
              </div>

              {/* Title */}
              <h1 className="font-serif font-bold text-[#1f1a17] text-2xl sm:text-3xl lg:text-4xl leading-snug mb-3 text-center lg:text-left">
                {homa.title}
              </h1>

              {/* Subtitle / Description */}
              <p className="text-stone-600 text-sm sm:text-base font-medium leading-relaxed mb-6 text-center lg:text-left">
                {descriptionText}
              </p>

              {/* Dynamic Countdown & Temple Card fetched from Dashboard */}
              <PujaCountdownCard
                templeVenue={templeVenueText || "Sacred Temple Yagashala"}
                location={homa.location || homa.templeLocation || "India"}
                dateText={homa.date || "Saturday, 10 October"}
                occasionText={homa.subtitle || (homa as any).occasion || (homa as any).dateOccasion || homa.badge || (homa as any).tithis || "Special Vedic Homa"}
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
                            ? "border-[#14395C] bg-[#F1F5F9] shadow-xs"
                            : "border-stone-200 hover:border-stone-300 bg-white"
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
                            <h4 className="font-extrabold text-stone-900 text-sm sm:text-xs lg:text-[13px] leading-tight break-words">
                              {pkg.name}
                            </h4>
                            <span className="text-xs sm:text-[11px] font-medium text-stone-500 block leading-tight truncate">
                              {devoteesText}
                            </span>
                            <div className="flex items-center justify-between mt-1 sm:mt-0.5">
                              <span className={`font-extrabold text-base sm:text-sm lg:text-base ${isSelected ? "text-[#14395C]" : "text-stone-900"}`}>
                                ₹{displayPrice}
                              </span>
                              {/* Checkmark Badge on Selected Package */}
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-[#14395C] text-white flex items-center justify-center shrink-0 shadow-xs ml-1">
                                  <Check className="w-3 h-3" strokeWidth={3.5} />
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
                className="w-full bg-[#14395C] hover:bg-[#0f2d4a] active:scale-[0.98] text-white font-extrabold text-lg sm:text-2xl py-3.5 sm:py-4.5 px-6 sm:px-8 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 sm:gap-4 mb-4 tracking-wide group"
              >
                <span className="tabular-nums font-black">₹{priceVal.toLocaleString("en-IN")}</span>
                <span className="opacity-40 font-light select-none">|</span>
                <span className="flex items-center gap-2">
                  {homa.buttonText || "Book Now"}
                </span>
              </button>

              {/* Secondary WhatsApp & Call Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://wa.me/919566777645"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 bg-white border border-[#CBD5E1] text-[#14395C] hover:bg-slate-50 font-extrabold text-xs sm:text-sm py-2.5 px-4 rounded-full transition-colors shadow-xs"
                >
                  <MessageCircle className="w-5 h-5 shrink-0 text-[#25D366] fill-[#25D366]" />
                  <span>Book via WhatsApp</span>
                </a>
                <a
                  href="tel:+919677391108"
                  className="flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 bg-white border border-[#CBD5E1] text-[#1E293B] hover:bg-slate-50 font-extrabold text-xs sm:text-sm py-2.5 px-4 rounded-full transition-colors shadow-xs"
                >
                  <Phone className="w-4 h-4 min-w-[16px] min-h-[16px] text-[#14395C]" />
                  <span>Book via Call</span>
                </a>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ── 2. Trust Strip Badges ── */}
      {(() => {
        const defaultBadges = [
          { icon: "🎥", text: "Homa Video Delivered Within 48 hours" },
          { icon: "✓", text: "Verified & Experienced Pandits" },
          { icon: "🏛", text: "Homa Performed in Sacred Temples" },
          { icon: "📜", text: "100% Authentic Vedic Rituals" },
        ];
        const icons = ["🎥", "✓", "🏛", "📜", "⭐", "✨"];
        const badgeList = (Array.isArray(homa.trustBadges) && homa.trustBadges.length > 0)
          ? homa.trustBadges.map((text, i) => ({ icon: icons[i % icons.length], text }))
          : defaultBadges;

        // Two identical tracks with badges repeated twice each, separated with pr-8 sm:pr-12 for 100% seamless infinite loop without blank gaps below 1440px
        const trackBadges = [...badgeList, ...badgeList];

        return (
          <div data-reveal className="w-full bg-[#F1F5F9] border-y border-slate-200 py-3.5 sm:py-4.5 overflow-hidden">
            {/* Continuous Marquee on all screens below 1440px */}
            <div className="badge-marquee-below-1440 min-[1440px]:hidden overflow-hidden w-full relative">
              <div className="flex animate-marquee">
                <div className="flex shrink-0 items-center gap-8 sm:gap-12 pr-8 sm:pr-12 text-xs sm:text-sm font-bold text-[#14395C]">
                  {trackBadges.map((b, idx) => (
                    <span key={`t1-${idx}`} className="flex items-center gap-2 shrink-0 whitespace-nowrap">
                      <span className="bg-white text-[#14395C] shadow-2xs rounded-full p-1">{b.icon}</span> {b.text}
                    </span>
                  ))}
                </div>
                <div className="flex shrink-0 items-center gap-8 sm:gap-12 pr-8 sm:pr-12 text-xs sm:text-sm font-bold text-[#14395C]" aria-hidden="true">
                  {trackBadges.map((b, idx) => (
                    <span key={`t2-${idx}`} className="flex items-center gap-2 shrink-0 whitespace-nowrap">
                      <span className="bg-white text-[#14395C] shadow-2xs rounded-full p-1">{b.icon}</span> {b.text}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Standard layout on 1440px and wider desktop screens (>= 1440px) */}
            <div className="badge-static-1440 hidden min-[1440px]:flex max-w-[1350px] mx-auto items-center justify-around gap-6 px-4 text-xs sm:text-sm font-bold text-[#14395C] whitespace-nowrap">
              {badgeList.map((b, idx) => (
                <span key={idx} className="flex items-center gap-2">
                  <span className="bg-white text-[#14395C] shadow-2xs rounded-full p-1">{b.icon}</span> {b.text}
                </span>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ── 2b. Ratings Stats & Action Strip (Wishlist & Share) Above Nav Tabs (Below 1000px only) ── */}
      <div data-reveal className="lg:hidden w-full bg-white border-b border-stone-200/90 py-3 sm:py-3.5">
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-3">
          {/* Stats Container */}
          <div className="flex items-center gap-3 sm:gap-6 md:gap-8 overflow-x-auto no-scrollbar py-0.5">
            {/* Stat 1: Poojas Performed */}
            <div className="text-left shrink-0">
              <span className="block text-xs sm:text-base lg:text-lg font-extrabold text-[#1f1a17] leading-tight">
                10M+
              </span>
              <span className="text-[10px] sm:text-xs text-stone-500 font-medium block mt-0.5 leading-tight">
                poojas performed
              </span>
            </div>

            <div className="w-[1px] h-6 sm:h-7 bg-stone-200 shrink-0" />

            {/* Stat 2: Scholars and Priests */}
            <div className="text-left shrink-0">
              <span className="block text-xs sm:text-base lg:text-lg font-extrabold text-[#1f1a17] leading-tight">
                180+
              </span>
              <span className="text-[10px] sm:text-xs text-stone-500 font-medium block mt-0.5 leading-tight">
                scholars and priests
              </span>
            </div>

            <div className="w-[1px] h-6 sm:h-7 bg-stone-200 shrink-0" />

            {/* Stat 3: Years of Vedic Expertise */}
            <div className="text-left shrink-0">
              <span className="block text-xs sm:text-base lg:text-lg font-extrabold text-[#1f1a17] leading-tight">
                25+ years
              </span>
              <span className="text-[10px] sm:text-xs text-stone-500 font-medium block mt-0.5 leading-tight">
                of Vedic expertise
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
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
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
            ref={tabsContainerRef}
            className="w-full flex items-center justify-start lg:justify-between overflow-x-auto no-scrollbar gap-7 sm:gap-6 lg:gap-8 text-xs sm:text-sm font-bold text-stone-600 scroll-smooth px-3 sm:px-1"
          >
            {subHomaTabs.map((tab) => (
              <a
                key={tab.id}
                href={`#${tab.id}`}
                data-tab-id={tab.id}
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
                className={`py-3 sm:py-3.5 px-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${activeTab === tab.id
                  ? "border-[#14395C] text-[#14395C]"
                  : "border-transparent hover:text-stone-900"
                  }`}
              >
                {tab.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. Main 2-Column Body Layout ── */}
      <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-20 sm:pb-24 lg:pb-36 grid grid-cols-1 lg:grid-cols-12 gap-y-8 lg:gap-10">

        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-12">

          {/* Section: About Homa */}
          <section id="about" data-reveal className="scroll-mt-32">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1a17] mb-6">About homa</h2>

            <div className="bg-[#fdfbf7] border border-[#f0e4d0] rounded-3xl p-6 sm:p-8 relative overflow-hidden">
              {renderAboutContent(aboutText)}

              <div className="flex flex-row items-center justify-around gap-6 border-t border-[#f0e4d0] pt-6 text-xs text-stone-700">
                <div>
                  <span className="text-stone-400 font-bold block mb-1 uppercase tracking-wider">Occasion</span>
                  <span className="font-extrabold text-stone-900 text-sm sm:text-base">{homa.date || "Auspicious Tithis"}</span>
                </div>
                <div className="w-px h-8 bg-[#f0e4d0]" />
                <div>
                  <span className="text-stone-400 font-bold block mb-1 uppercase tracking-wider">Venue</span>
                  <span className="font-extrabold text-stone-900 text-sm sm:text-base">{templeVenueText || "Temple Yagashala"}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Homa Benefits */}
          <section id="benefits" data-reveal className="scroll-mt-32">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1a17] mb-6">Homa Benefits</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {benefitsList.map((b, idx) => (
                <div key={idx} data-reveal data-delay={((idx % 4) * 100).toString()} className="bg-white border border-stone-200/90 rounded-2xl p-5 flex items-start gap-4 shadow-xs hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-[#800000] text-white flex items-center justify-center shrink-0 font-bold">
                    {b.icon || "🔥"}
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm sm:text-base mb-1">{b.title}</h3>
                    <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Homa Procedure */}
          <section id="process" data-reveal className="scroll-mt-32">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1a17] mb-6">Homa Procedure</h2>
            <div className="space-y-4">
              {processList.map((step, idx) => (
                <div key={idx} data-reveal data-delay={((idx % 4) * 100).toString()} className="bg-white border border-stone-200/90 rounded-2xl p-5 flex items-start gap-4 shadow-xs">
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
          <section id="temple" data-reveal className="scroll-mt-32">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1a17] mb-6">Temple Details</h2>
            <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-center shadow-xs">
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
          <section id="receive" data-reveal className="scroll-mt-32">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1a17] mb-6">What will you receive</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {inclusionsList.map((inc: any, idx: number) => {
                const title = typeof inc === "string" ? inc : inc.title || inc.name || `Inclusion ${idx + 1}`;
                const desc = typeof inc === "string" ? "Included in your sacred booking." : inc.description || "Included in your sacred booking.";
                return (
                  <div key={idx} data-reveal data-delay={((idx % 4) * 100).toString()} className="bg-white border border-stone-200/90 rounded-2xl p-5 flex items-start gap-4 shadow-xs">
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
          <section id="faqs" data-reveal className="scroll-mt-32">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1a17] mb-6">Frequently Asked Questions (FAQs)</h2>
            <div className="space-y-3">
              {faqList.map((faq, idx) => (
                <div
                  key={idx}
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className={`border rounded-2xl px-5 py-4 transition-all duration-300 cursor-pointer select-none ${openFaqIndex === idx ? 'border-[#14395C] bg-white shadow-xs' : 'border-stone-200 bg-[#faf9f6]'}`}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm sm:text-base font-bold text-stone-800">{faq.question}</h4>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ml-4 ${openFaqIndex === idx ? 'bg-[#14395C] text-white' : 'bg-stone-200 text-stone-600'}`}>
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
            <section id="gallery" data-reveal className="scroll-mt-32 pb-32 sm:pb-36 lg:pb-44">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1a17] mb-6">Homa Gallery</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {galleryList.map((img: string, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setLightboxImageIdx(idx);
                      setGalleryLightboxOpen(true);
                    }}
                    className="h-48 rounded-2xl overflow-hidden border border-stone-200 shadow-xs relative cursor-pointer group"
                  >
                    {/* Full Image */}
                    <Image
                      src={img}
                      alt={`${homa?.title || "Homa"} - Sacred Ritual Photo ${idx + 1}`}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      unoptimized
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={() => {
                        setFailedGalleryImages((prev) => ({ ...prev, [img]: true }));
                      }}
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/90 text-stone-800 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                        <ZoomIn className="w-5 h-5 text-stone-900" strokeWidth={2} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* Right Sidebar Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6 pt-0 pb-16 sm:pb-20 lg:pb-36">

          {/* Dedicated Vedic Homa Sticky Card */}
          <div data-reveal className="bg-[#fdfbf7] border border-[#f0e4d0] rounded-3xl p-5 sm:p-6 pb-7 sm:pb-8 shadow-xs static lg:sticky lg:top-[140px] xl:top-[144px] space-y-4 sm:space-y-5 mb-0 lg:mb-28">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#800000] text-white flex items-center justify-center font-bold shrink-0">🔥</div>
              <div>
                <h3 className="font-serif font-bold text-stone-900 text-base">Dedicated Vedic Homa</h3>
                <span className="text-xs text-stone-500 font-semibold">100% Authentic Fire Lab</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm text-stone-700 font-medium">
              <div className="flex items-start gap-2.5">
                <span className="text-[#14395C] font-bold text-base shrink-0">✓</span>
                <span>Personalized Sankalpam performed with your Name, Gotra &amp; Wish</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-[#14395C] font-bold text-base shrink-0">✓</span>
                <span>Full Homa Video Recording delivered on WhatsApp within 48 hours</span>
              </div>
            </div>

            {/* WhatsApp Agent Container with Dedicated Margin & Padding */}
            <div className="border-t border-[#f0e4d0] pt-5 mt-4 mb-2 pb-1">
              <h4 className="font-bold text-stone-900 text-sm mb-1.5">Unsure which homa to book?</h4>
              <p className="text-stone-600 text-xs mb-3.5 leading-relaxed font-medium">
                Our devotee care team is available 24/7. Reach them on WhatsApp.
              </p>
              <div className="mt-3 mb-1">
                <a
                  href="https://wa.me/919566777645"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#14395C] hover:bg-[#0f2d4a] text-white font-extrabold text-xs sm:text-sm py-3 px-4 rounded-full transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageCircle className="w-5 h-5 shrink-0 text-white" />
                  <span>WhatsApp Agent</span>
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ── 5. Sticky Floating Action Bar at Bottom ── */}
      <div
        style={{
          bottom: "calc(74px + env(safe-area-inset-bottom, 0px))",
        }}
        className={`fixed lg:!bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-[1250px] transition-all duration-300 transform ${showStickyBar
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-12 opacity-0 pointer-events-none"
          }`}
      >
        <div className="bg-[#14395C] text-white rounded-2xl sm:rounded-3xl p-2.5 sm:py-3.5 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 shadow-2xl shadow-slate-950/30 border border-slate-700/30 backdrop-blur-md">
          {/* Left Column: Lotus Icon + Uppercase Title + Price */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white text-[#14395C] flex items-center justify-center shrink-0 shadow-sm">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-[#14395C]" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] sm:text-xs font-extrabold text-slate-200 tracking-wider uppercase block truncate max-w-[120px] sm:max-w-none">
                {homa.title}
              </span>
              <span className="text-base sm:text-2xl font-black text-white block leading-tight mt-0.5 whitespace-nowrap">
                ₹{priceVal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Right Column: White Pill Button with Navy Circle Arrow */}
          <button
            onClick={handleAddHomaToCart}
            className="bg-white hover:bg-slate-100 active:scale-95 text-[#14395C] font-extrabold text-xs sm:text-sm px-3 sm:px-6 py-2 sm:py-2.5 rounded-full shadow-md transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap cursor-pointer"
          >
            <span className="max-w-[125px] sm:max-w-none truncate">{homa.buttonText || "Book Now"}</span>
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#14395C] text-white flex items-center justify-center shrink-0">
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
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
                        ? "border-[#14395C] bg-[#F1F5F9] shadow-xs"
                        : "border-stone-200 hover:border-stone-400 bg-white"
                        }`}
                    >
                      <div>
                        <h4 className="font-bold text-stone-900 text-base">{pkg.name}</h4>
                        <p className="text-stone-600 text-xs mt-1">{pkg.description || "Includes personalized sankalpam and video proof."}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-lg text-stone-900 block">₹{getDisplayPrice(pkg)}</span>
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
              className="w-full bg-[#14395C] hover:bg-[#0f2d4a] text-white font-extrabold text-base py-3.5 rounded-full shadow-md transition-all"
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

      {/* ── 9. Sacred Homa Gallery Lightbox ── */}
      <GalleryLightboxModal
        isOpen={galleryLightboxOpen}
        onClose={() => setGalleryLightboxOpen(false)}
        images={galleryList}
        initialIndex={lightboxImageIdx}
      />

      <Footer />
    </main>
  );
}
