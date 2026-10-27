"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LoginModal from "@/components/auth/LoginModal";
import { checkAuthStatus } from "@/lib/authCheck";
import { XMarkIcon } from "@heroicons/react/24/solid";
import WishlistButton from "@/components/common/WishlistButton";
import PujaCountdownCard from "@/components/common/PujaCountdownCard";
import ShareModal from "@/components/common/ShareModal";
import GalleryLightboxModal from "@/components/common/GalleryLightboxModal";
import Image from "next/image";
import { getStartingPriceINR } from "@/lib/pricing";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  "/images/package_family.png",
];

export default function PujaDetailClient({
  initialPuja,
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
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingSankalpUrl, setPendingSankalpUrl] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [galleryCarouselIdx, setGalleryCarouselIdx] = useState(0);
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

        const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
        const isClient = typeof window !== "undefined";
        const isLanMobile = isClient && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" && rawBaseUrl.includes("localhost");
        const backendUrl = isLanMobile ? "" : rawBaseUrl;
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
          // If the top of the section is at or past the sticky header threshold
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
  }, [loading, puja]);



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

    if (puja?.packages && puja.packages.length > 0) {
      return puja.packages.map((pkg: any, idx: number) => {
        const basePrice = pkg.priceINR ?? pkg.price ?? getStartingPriceINR(puja) ?? 0;
        const defaultDevotees = idx === 0 ? "1 Devotee" : idx === 1 ? "2 Devotees" : idx === 2 ? "4 Devotees" : "Multiple Devotees";
        return {
          id: pkg.id || pkg._id || `pkg-${idx + 1}`,
          name: normalizePackageName(pkg.name, idx),
          devoteeCount: pkg.devoteeCount || pkg.devotees || defaultDevotees,
          priceINR: basePrice,
          priceUSD: pkg.priceUSD,
          priceMYR: pkg.priceMYR,
          description: pkg.description || "Includes personalized sankalpam and video proof.",
          imageUrl: DEFAULT_PACKAGE_AVATARS[idx % DEFAULT_PACKAGE_AVATARS.length],
        };
      });
    }

    const basePrice = getStartingPriceINR(puja) ?? 0;
    return [
      {
        id: "pkg-1",
        name: "Individual",
        devoteeCount: "1 Devotee",
        priceINR: basePrice,
        description: "Personalized Sankalpam for 1 Person with video recording.",
        imageUrl: DEFAULT_PACKAGE_AVATARS[0],
      },
      {
        id: "pkg-2",
        name: "Couple",
        devoteeCount: "2 Devotees",
        priceINR: basePrice + 200,
        description: "Personalized Sankalpam for Couple / 2 Devotees.",
        imageUrl: DEFAULT_PACKAGE_AVATARS[1],
      },
      {
        id: "pkg-3",
        name: "Family",
        devoteeCount: "4 Devotees",
        priceINR: basePrice + 400,
        description: "Personalized Sankalpam for 4 Family Members.",
        imageUrl: DEFAULT_PACKAGE_AVATARS[2],
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
    return item?.[`price${currency}`] ?? item?.priceINR ?? item?.price ?? getStartingPriceINR(item) ?? 0;
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
    : getStartingPriceINR(puja) ?? 0;

  const handleAddPujaToCart = async () => {
    try {
      const { is_user } = await checkAuthStatus();
      const actualPujaId = puja?._id || (puja as any)?.id || slug;
      const totalAmount = priceVal;

      const sankalpUrl = `/sankalp?pujaId=${encodeURIComponent(actualPujaId)}&amount=${totalAmount}&type=puja&pkg=${selectedPackageId || ""}&title=${encodeURIComponent(puja?.title || "")}&slug=${encodeURIComponent(
        slug || ""
      )}`;

      if (!is_user) {
        setPendingSankalpUrl(sankalpUrl);
        setShowLoginModal(true);
        return;
      }
      window.location.href = sankalpUrl;
    } catch (err: any) {
      console.error("Error booking puja:", err);
    }
  };

  const DEFAULT_BANNER_IMAGE = "/images/Navagraha-Shanti-Puja.jpg";

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

  // Auto-advance banner every 5 seconds
  useEffect(() => {
    if (bannerImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [bannerImages.length]);

  const galleryList = useMemo(() => {
    if (!puja) return [];
    const list: string[] = [];
    const addImg = (val: any) => {
      if (!val) return;
      if (typeof val === "string") {
        const parts = val.split(/[\n,]+/);
        for (const p of parts) {
          const trimmed = p.trim();
          if (trimmed) {
            const formatted = getPujaImageUrl(trimmed);
            if (formatted && !list.includes(formatted)) {
              list.push(formatted);
            }
          }
        }
      } else if (Array.isArray(val)) {
        for (const item of val) {
          addImg(item);
        }
      }
    };

    addImg(puja.gallery);
    addImg((puja as any).galleryUrl);
    if ((puja as any).details?.gallery) addImg((puja as any).details.gallery);
    return list.filter((img) => !failedGalleryImages[img]);
  }, [puja, failedGalleryImages]);

  const subNavTabs = useMemo(() => [
    { id: "about", label: "About puja" },
    { id: "benefits", label: "Puja Benefits" },
    { id: "process", label: "Puja Procedure" },
    { id: "temple", label: "Temple Details" },
    { id: "receive", label: "What will you receive" },
    { id: "faqs", label: "FAQs" },
    ...(galleryList.length > 0 ? [{ id: "gallery", label: "Puja Gallery" }] : []),
  ], [galleryList.length]);

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
            className="bg-[#14395C] text-white font-extrabold px-8 py-3 rounded-full hover:bg-[#0f2d4a] transition-colors"
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

  const templeImage =
    (typeof (puja as any).templeImageUrl === "string" && (puja as any).templeImageUrl.trim()) ||
    (typeof puja.templeImage === "string" && puja.templeImage.trim()) ||
    (typeof (puja as any).details?.templeImageUrl === "string" && (puja as any).details.templeImageUrl.trim()) ||
    (typeof puja.details?.templeImage === "string" && puja.details.templeImage.trim()) ||
    "";
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
    <main className="min-h-screen bg-white text-[#1f1f1f] font-sans">
      <Navbar />

      {/* ── 1. Top Hero Section ── */}
      <section data-reveal className="bg-[#ffffff] border-b border-[#f0e4d0] py-8 sm:py-12">
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left 6 Cols: Main Banner Image (Slightly Increased Width) */}
            <div className="lg:col-span-6 flex flex-col relative">
              <div className="relative w-full aspect-[4/3] min-h-[260px] sm:min-h-0 sm:aspect-auto sm:h-[350px] md:h-[390px] lg:h-[410px] rounded-xl overflow-hidden border border-stone-200/90 shadow-md group">
                <Image
                  src={bannerImages[activeBannerIndex] || (puja ? getPujaImageUrl(puja.imageUrl) : "/images/Ganesh-Chaturthi-Mahapuja.jpg")}
                  alt={`${puja?.title || "Puja"} - Sacred Ritual Banner ${activeBannerIndex + 1}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  unoptimized
                  className="w-full h-full object-cover object-center transition-all duration-300 cursor-pointer"
                  onClick={handleAddPujaToCart}
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
                  {/* Stat 1: Poojas Performed */}
                  <div className="text-center flex-1 px-0.5 xl:px-1">
                    <span className="block text-sm lg:text-[14px] xl:text-base 2xl:text-lg font-extrabold text-[#1f1a17] leading-tight whitespace-nowrap">10M+</span>
                    <span className="text-[10px] xl:text-[11px] 2xl:text-xs text-stone-500 font-medium block mt-0.5 leading-tight">poojas performed</span>
                  </div>

                  <div className="w-[1px] h-5 xl:h-6 bg-stone-300/80 shrink-0" />

                  {/* Stat 2: Scholars and Priests */}
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
                    itemId={puja._id}
                    text="Wishlist"
                    className="flex-initial border border-stone-300 hover:border-stone-500 bg-white text-stone-800 font-medium text-xs xl:text-sm px-3 xl:px-4 py-1.5 rounded-full flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs"
                    iconClassName="w-3.5 h-3.5 xl:w-4 xl:h-4"
                  />

                  <button
                    type="button"
                    aria-label="Share puja"
                    onClick={() => setShareModalOpen(true)}
                    className="flex-initial border border-stone-300 hover:border-stone-500 bg-white text-stone-800 font-medium text-xs xl:text-sm px-3 xl:px-4 py-1.5 rounded-full flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs"
                  >
                    <svg className="w-3.5 h-3.5 xl:w-4 xl:h-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right 6 Cols: Details & CTA */}
            <div className="lg:col-span-6 flex flex-col lg:pl-[10px]">
              {/* Filigree Subtag */}
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                <div className="w-8 h-[1px] bg-[#F47820]/40" />
                <span className="text-[#F47820] font-serif font-extrabold text-xs sm:text-[13px] tracking-wider uppercase flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-[10px]">♦</span> {badgeText} <span className="text-[10px]">♦</span>
                </span>
                <div className="w-8 h-[1px] bg-[#F47820]/40" />
              </div>

              {/* Title */}
              <h1 className="font-serif font-bold text-[#1f1a17] text-2xl sm:text-3xl lg:text-4xl leading-snug mb-3 text-center lg:text-left">
                {puja.title}
              </h1>

              {/* Subtitle / Description */}
              <p className="text-stone-600 text-sm sm:text-base font-medium leading-relaxed mb-6 text-center lg:text-left">
                {descriptionText}
              </p>

              {/* Dynamic Countdown & Temple Card fetched from Dashboard */}
              <PujaCountdownCard
                templeVenue={templeVenueText || "Kamrup Teerth Kshetra"}
                location={puja.location || puja.templeLocation || "Guwahati, Assam"}
                dateText={puja.date || "Saturday, 10 October"}
                occasionText={puja.subtitle || (puja as any).occasion || (puja as any).dateOccasion || puja.badge || (puja as any).tithis || "Mahalaya Amavasya"}
                eventDateTime={puja.eventDateTime}
                showTimer={puja.showTimer}
                title="Reserve your sankalp"
                badgeLabel="MUHURAT ENDS IN"
                className="mb-5"
              />

              {/* Package Selection Cards Grid */}
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
                            alt={`${pkg.name || "Package"} - ${puja?.title || "Puja"}`}
                            width={56}
                            height={56}
                            unoptimized
                            className="w-full h-full object-cover object-center"
                          />
                        </div>

                        {/* Details on the Right */}
                        <div className="flex-1 min-w-0 text-left space-y-0.5 sm:space-y-0.5">
                          <h4 className="font-extrabold text-stone-900 text-sm sm:text-xs lg:text-[13px] leading-tight truncate">
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

              {/* Primary Participate / Book Now CTA Button */}
              <button
                ref={heroCtaRef}
                onClick={handleAddPujaToCart}
                className="w-full bg-[#14395C] hover:bg-[#0f2d4a] active:scale-[0.98] text-white font-extrabold text-lg sm:text-2xl py-3.5 sm:py-4.5 px-6 sm:px-8 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 sm:gap-4 mb-4 tracking-wide group"
              >
                <span className="tabular-nums font-black">₹{priceVal.toLocaleString("en-IN")}</span>
                <span className="opacity-40 font-light select-none">|</span>
                <span className="flex items-center gap-2">
                  {puja.buttonText || "Book Now"}
                </span>
              </button>

              {/* Secondary WhatsApp & Call Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <a
                  href="https://wa.me/919566777645"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 bg-white border border-[#CBD5E1] text-[#14395C] hover:bg-slate-50 font-extrabold text-xs sm:text-sm py-2.5 px-4 rounded-full transition-colors shadow-xs"
                >
                  <svg className="w-5 h-5 shrink-0 fill-[#25D366]" viewBox="0 0 24 24">
                    <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.758.459 3.474 1.33 4.982L2 22l5.144-1.348c1.455.793 3.097 1.21 4.864 1.21 5.505 0 9.989-4.478 9.99-9.985 0-5.506-4.484-9.984-9.986-9.984zm5.794 14.15c-.244.686-1.437 1.344-1.982 1.393-.526.048-1.018.257-3.418-.686-2.905-1.141-4.757-4.088-4.901-4.281-.144-.193-1.177-1.564-1.177-2.984 0-1.42.747-2.119 1.011-2.408.264-.289.576-.361.769-.361.192 0 .385.001.552.009.178.008.417-.067.653.498.243.582.83 2.023.902 2.168.072.144.12.312.024.504-.096.192-.144.312-.288.48-.144.168-.303.376-.432.504-.144.144-.294.302-.126.59.168.289.747 1.233 1.603 1.996 1.101.98 2.03 1.285 2.318 1.429.288.144.456.12.624-.072.168-.192.721-.84.913-1.128.192-.288.384-.24.648-.144.264.096 1.677.791 1.965.935.288.144.48.216.552.336.072.12.072.696-.172 1.382z" />
                  </svg>
                  <span>Book via WhatsApp</span>
                </a>
                <a
                  href="tel:+919677391108"
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 bg-white border border-[#CBD5E1] text-[#1E293B] hover:bg-slate-50 font-extrabold text-xs sm:text-sm py-2.5 px-4 rounded-full transition-colors shadow-xs"
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
      {(() => {
        const defaultBadges = [
          { icon: "🎥", text: "Puja Video Delivered Within 48 hours" },
          { icon: "✓", text: "Verified & Experienced Pandits" },
          { icon: "🏛", text: "Puja Performed in Sacred Temples" },
          { icon: "📜", text: "100% Authentic Vedic Rituals" },
        ];
        const icons = ["🎥", "✓", "🏛", "📜", "⭐", "✨"];
        const badgeList = (Array.isArray(puja.trustBadges) && puja.trustBadges.length > 0)
          ? puja.trustBadges.map((text, i) => ({ icon: icons[i % icons.length], text }))
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

            {/* Static spread layout on 1440px and wider desktop screens (>= 1440px) */}
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
        {/* Mobile layout: stats left, buttons right */}
        <div className="md:hidden w-full px-4 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-start gap-3 sm:gap-6 overflow-x-auto no-scrollbar py-0.5">
            <div className="text-left shrink-0">
              <span className="block text-xs font-extrabold text-[#1f1a17] leading-tight">10M+</span>
              <span className="text-[10px] text-stone-500 font-medium block mt-0.5 leading-tight">poojas performed</span>
            </div>
            <div className="w-[1px] self-stretch bg-stone-200 shrink-0" />
            <div className="text-left shrink-0">
              <span className="block text-xs font-extrabold text-[#1f1a17] leading-tight">180+</span>
              <span className="text-[10px] text-stone-500 font-medium block mt-0.5 leading-tight">scholars and priests</span>
            </div>
            <div className="w-[1px] self-stretch bg-stone-200 shrink-0" />
            <div className="text-left shrink-0">
              <span className="block text-xs font-extrabold text-[#1f1a17] leading-tight">25+ years</span>
              <span className="text-[10px] text-stone-500 font-medium block mt-0.5 leading-tight">of Vedic expertise</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <WishlistButton
              itemId={puja._id}
              className="w-9 h-9 rounded-full border border-stone-300 hover:border-stone-500 bg-white flex items-center justify-center text-stone-700 shadow-2xs hover:bg-stone-50 transition-all active:scale-95"
              iconClassName="w-4 h-4"
            />
            <button
              type="button"
              aria-label="Share puja"
              onClick={() => setShareModalOpen(true)}
              className="w-9 h-9 rounded-full border border-stone-300 hover:border-stone-500 bg-white flex items-center justify-center text-stone-700 shadow-2xs hover:bg-stone-50 transition-all active:scale-95"
            >
              <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tablet layout (md=768px): all 5 items equal space */}
        <div className="hidden md:flex lg:hidden w-full px-6 md:px-8 items-center">
          {/* Stat 1 */}
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="block text-base font-extrabold text-[#1f1a17] leading-tight">10M+</span>
            <span className="text-xs text-stone-500 font-medium block mt-0.5 leading-tight">poojas performed</span>
          </div>
          <div className="w-[1px] h-7 bg-stone-200 shrink-0" />
          {/* Stat 2 */}
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="block text-base font-extrabold text-[#1f1a17] leading-tight">180+</span>
            <span className="text-xs text-stone-500 font-medium block mt-0.5 leading-tight">scholars and priests</span>
          </div>
          <div className="w-[1px] h-7 bg-stone-200 shrink-0" />
          {/* Stat 3 */}
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="block text-base font-extrabold text-[#1f1a17] leading-tight">25+ years</span>
            <span className="text-xs text-stone-500 font-medium block mt-0.5 leading-tight">of Vedic expertise</span>
          </div>
          <div className="w-[1px] h-7 bg-stone-200 shrink-0" />
          {/* Wishlist */}
          <div className="flex-1 flex items-center justify-center">
            <WishlistButton
              itemId={puja._id}
              className="w-10 h-10 rounded-full border border-stone-300 hover:border-stone-500 bg-white flex items-center justify-center text-stone-700 shadow-2xs hover:bg-stone-50 transition-all active:scale-95"
              iconClassName="w-5 h-5"
            />
          </div>
          <div className="w-[1px] h-7 bg-stone-200 shrink-0" />
          {/* Share */}
          <div className="flex-1 flex items-center justify-center">
            <button
              type="button"
              aria-label="Share puja"
              onClick={() => setShareModalOpen(true)}
              className="w-10 h-10 rounded-full border border-stone-300 hover:border-stone-500 bg-white flex items-center justify-center text-stone-700 shadow-2xs hover:bg-stone-50 transition-all active:scale-95"
            >
              <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
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
            {subNavTabs.map((tab) => (
              <a
                key={tab.id}
                href={`#${tab.id}`}
                data-tab-id={tab.id}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(tab.id);
                  const el = document.getElementById(tab.id);
                  if (el) {
                    const headerHeight = window.innerWidth < 640 ? 110 : window.innerWidth < 1024 ? 120 : 130;
                    const y = el.getBoundingClientRect().top + window.pageYOffset - headerHeight;
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

          {/* Section: About Puja */}
          <section id="about" data-reveal className="scroll-mt-36">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1a17] mb-6">About puja</h2>

            <div className="bg-[#ffffff] border border-[#f0e4d0] rounded-3xl p-6 sm:p-8 relative overflow-hidden">
              {renderAboutContent(aboutText)}

              <div className="flex flex-row items-center justify-around gap-6 border-t border-[#f0e4d0] pt-6 text-xs text-stone-700">
                <div>
                  <span className="text-stone-400 font-bold block mb-1 uppercase tracking-wider">Occasion</span>
                  <span className="font-extrabold text-stone-900 text-sm sm:text-base">{puja.date || "Auspicious Tithis"}</span>
                </div>
                <div className="w-px h-8 bg-[#f0e4d0]" />
                <div>
                  <span className="text-stone-400 font-bold block mb-1 uppercase tracking-wider">Venue</span>
                  <span className="font-extrabold text-stone-900 text-sm sm:text-base">{templeVenueText || "Temple Yagashala"}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Puja Benefits */}
          <section id="benefits" data-reveal className="scroll-mt-36">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1a17] mb-6">Puja Benefits</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {benefitsList.map((b, idx) => (
                <div key={idx} data-reveal data-delay={((idx % 4) * 100).toString()} className="bg-white border border-stone-200/90 rounded-2xl p-5 flex items-start gap-4 shadow-xs hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-[#800000] text-white flex items-center justify-center shrink-0 font-bold">
                    {b.icon || "❖"}
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm sm:text-base mb-1">{b.title}</h3>
                    <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Puja Procedure */}
          <section id="process" data-reveal className="scroll-mt-36">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1a17] mb-6">Puja Procedure</h2>
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
          <section id="temple" data-reveal className="scroll-mt-36">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1a17] mb-6">Temple Details</h2>
            <div className="bg-white border border-stone-200/90 rounded-3xl flex flex-col md:flex-row gap-6 items-center shadow-xs overflow-hidden">
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
                <h3 className="font-serif font-bold text-stone-900 text-xl mb-2">{templeVenueText}</h3>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-medium mb-4">
                  {templeNoteText}
                </p>
                <span className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-[#F47820]">
                  📍 {templeLocationText}
                </span>
              </div>
            </div>
          </section>

          {/* Section: What will you receive */}
          <section id="receive" data-reveal className="scroll-mt-36">
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
          <section id="faqs" data-reveal className="scroll-mt-36">
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

          {/* Section: Puja Gallery */}
          {galleryList.length > 0 && (
            <section id="gallery" data-reveal className="scroll-mt-36 pb-32 sm:pb-36 lg:pb-44">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1a17] mb-6">Puja Gallery</h2>

              {/* Mobile: Carousel */}
              <div className="sm:hidden relative">
                <div
                  onClick={() => {
                    setLightboxImageIdx(galleryCarouselIdx);
                    setGalleryLightboxOpen(true);
                  }}
                  className="relative h-64 rounded-2xl overflow-hidden border border-stone-200 shadow-xs cursor-pointer group"
                >
                  {/* Full Image */}
                  <Image
                    src={galleryList[galleryCarouselIdx] as string}
                    alt={`${puja?.title || "Puja"} - Sacred Ritual Photo ${galleryCarouselIdx + 1}`}
                    fill
                    sizes="100vw"
                    unoptimized
                    className="w-full h-full object-cover transition-all duration-300"
                    onError={() => {
                      const brokenImg = galleryList[galleryCarouselIdx] as string;
                      if (brokenImg) {
                        setFailedGalleryImages((prev) => ({ ...prev, [brokenImg]: true }));
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-xs">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                      </svg>
                    </div>
                  </div>
                  {galleryList.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setGalleryCarouselIdx((prev) => (prev - 1 + galleryList.length) % galleryList.length);
                        }}
                        aria-label="Previous gallery image"
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition-all shadow-md z-10"
                      >
                        <ChevronLeft className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setGalleryCarouselIdx((prev) => (prev + 1) % galleryList.length);
                        }}
                        aria-label="Next gallery image"
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition-all shadow-md z-10"
                      >
                        <ChevronRight className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </button>
                    </>
                  )}
                </div>
                {galleryList.length > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-3">
                    {galleryList.map((_: string, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setGalleryCarouselIdx(idx)}
                        aria-label={`Go to gallery image ${idx + 1}`}
                        className={idx === galleryCarouselIdx ? "w-6 h-2 bg-[#14395C] rounded-full transition-all" : "w-2 h-2 bg-stone-300 hover:bg-stone-400 rounded-full transition-all"}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* sm+ : Grid */}
              <div className="hidden sm:grid grid-cols-2 sm:grid-cols-3 gap-4">
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
                      alt={`${puja?.title || "Puja"} - Sacred Ritual Photo ${idx + 1}`}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      unoptimized
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={() => {
                        setFailedGalleryImages((prev) => ({ ...prev, [img]: true }));
                      }}
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/90 text-stone-800 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                        <svg className="w-5 h-5 text-stone-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                        </svg>
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

          {/* Dedicated Vedic Puja Sticky Card */}
          <div data-reveal className="bg-[#ffffff] border border-[#f0e4d0] rounded-3xl p-5 sm:p-6 pb-6 sm:pb-8 shadow-xs static lg:sticky lg:top-[140px] xl:top-[144px] space-y-4 sm:space-y-5 mb-0 lg:mb-28">
            <div className="flex items-center gap-3">

              <div>
                <h3 className="font-serif font-bold text-stone-900 text-base">Dedicated Vedic Puja</h3>
                <span className="text-xs text-stone-500 font-semibold">100% Authentic Rituals</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm text-stone-700 font-medium">
              <div className="flex items-start gap-2.5">
                <span className="text-[#14395C] font-bold text-base shrink-0">✓</span>
                <span>Personalized Sankalpam performed with your Name, Gotra &amp; Wish</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-[#14395C] font-bold text-base shrink-0">✓</span>
                <span>Full Puja Video Recording delivered on WhatsApp within 48 hours</span>
              </div>
            </div>

            {/* WhatsApp Agent Container with Dedicated Margin & Padding */}
            <div className="border-t border-[#f0e4d0] pt-5 mt-4 mb-2 pb-1">
              <h4 className="font-bold text-stone-900 text-sm mb-1.5">Unsure which puja to book?</h4>
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
              <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-[#14395C]" viewBox="0 0 24 24">
                <path d="M12 3c-1.5 2.5-3 5-3 7.5 0 2.5 1.5 4.5 3 4.5s3-2 3-4.5C15 8 13.5 5.5 12 3zm0 14c-4.5 0-7.5-2.5-9-5 1.5 4.5 5.5 7.5 9 7.5s7.5-3 9-7.5c-1.5 2.5-4.5 5-9 5z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] sm:text-xs font-extrabold text-slate-200 tracking-wider uppercase block truncate max-w-[120px] sm:max-w-none">
                {puja.title}
              </span>
              <span className="text-base sm:text-2xl font-black text-white block leading-tight mt-0.5 whitespace-nowrap">
                ₹{priceVal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Right Column: White Pill Button with Navy Circle Arrow */}
          <button
            onClick={handleAddPujaToCart}
            className="bg-white hover:bg-slate-100 active:scale-95 text-[#14395C] font-extrabold text-xs sm:text-sm px-3 sm:px-6 py-2 sm:py-2.5 rounded-full shadow-md transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap cursor-pointer"
          >
            <span className="max-w-[125px] sm:max-w-none truncate">{puja.buttonText || "Book Now"}</span>
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#14395C] text-white flex items-center justify-center shrink-0">
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="3">
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

            <button
              onClick={() => {
                setShowPackageModal(false);
                handleAddPujaToCart();
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

      {/* ── 9. Dynamic Share Modal ── */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        data={{
          title: puja.title,
          description: puja.heroSubtitle || puja.subtitle || puja.description || puja.about,
          templeVenue: puja.templeVenue,
          location: puja.location || puja.templeLocation,
          url: typeof window !== "undefined" ? window.location.href : undefined,
        }}
      />

      {/* ── 10. Sacred Puja Gallery Lightbox ── */}
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
