"use client";
import React, { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import { SparklesIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useTranslation } from "@/contexts/LanguageContext";
import ReviewsSection from "@/components/common/ReviewsSection";
import HowItWorksCarousel from "@/components/common/HowItWorksCarousel";

interface Puja {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  badge?: string;
  shortTitle?: string;
  buttonText: string;
  location?: string;
  date?: string;
  slug?: string;
  details?: {
    benefits?: { title: string; description: string }[];
    templeLocation?: string;
  };
  deity?: string;
  tithis?: string;
  dosha?: string;
  benefit?: string;
  filterLocation?: string;
  productId?: number;
}


const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

// --- filter config ------------------------------------------------------------
// Each option has a `value` (what we store) and `keywords` (matched against puja text)
const filterGroups = [
  {
    label: "Deity",
    options: [
      { value: "All", keywords: [] },
      { value: "Ganapathi", keywords: ["ganapathi", "ganesh", "ganesha", "vinayaka"] },
      { value: "Lakshmi", keywords: ["lakshmi", "laxmi"] },
      { value: "Shiva", keywords: ["shiva", "shiv", "mahadev", "shankar"] },
      { value: "Vishnu", keywords: ["vishnu", "narayan", "narayana"] },
      { value: "Hanuman", keywords: ["hanuman", "anjaneya", "maruti"] },
      { value: "Durga", keywords: ["durga", "devi", "kali", "ambika"] },
      { value: "Saraswati", keywords: ["saraswati", "saraswathi"] },
    ],
  },
  {
    label: "Tithis",
    options: [
      { value: "All", keywords: [] },
      { value: "Ekadashi", keywords: ["ekadashi"] },
      { value: "Purnima", keywords: ["purnima", "poornima", "full moon"] },
      { value: "Amavasya", keywords: ["amavasya", "new moon"] },
      { value: "Pradosh", keywords: ["pradosh", "pradosham"] },
      { value: "Navami", keywords: ["navami"] },
    ],
  },
  {
    label: "Dosha",
    options: [
      { value: "All", keywords: [] },
      { value: "Mangal Dosha", keywords: ["mangal", "manglik"] },
      { value: "Kala Sarpa", keywords: ["kala sarpa", "kalasarpa", "kalsarpa"] },
      { value: "Pitru Dosha", keywords: ["pitru", "pitra", "ancestor"] },
      { value: "Shani Dosha", keywords: ["shani", "saturn", "sade sati"] },
    ],
  },
  {
    label: "Benefits",
    options: [
      { value: "All", keywords: [] },
      { value: "Prosperity", keywords: ["prosperity", "wealth", "financial", "money", "abundance", "lakshmi"] },
      { value: "Protection", keywords: ["protection", "shield", "guard", "safety"] },
      { value: "Peace", keywords: ["peace", "shanti", "calm", "harmony"] },
      { value: "Health", keywords: ["health", "healing", "disease", "wellness"] },
      { value: "Career", keywords: ["career", "job", "business", "success", "growth"] },
      { value: "Marriage", keywords: ["marriage", "wedding", "vivah", "spouse"] },
    ],
  },
  {
    label: "Location",
    options: [
      { value: "All", keywords: [] },
      { value: "Tamil Nadu", keywords: ["tamil nadu", "tamilnadu"] },
      { value: "Karnataka", keywords: ["karnataka", "bangalore", "bengaluru", "mysore"] },
      { value: "Kerala", keywords: ["kerala"] },
      { value: "Uttar Pradesh", keywords: ["uttar pradesh", "varanasi", "kashi", "mathura", "vrindavan", "ujjain"] },
      { value: "Andhra Pradesh", keywords: ["andhra", "tirupati", "hyderabad"] },
      { value: "Rajasthan", keywords: ["rajasthan", "jaipur", "pushkar"] },
    ],
  },
];

type FilterState = Record<string, string[]>; // label -> array of selected values

const defaultFilters: FilterState = {
  Deity: [],
  Tithis: [],
  Dosha: [],
  Benefits: [],
  Location: [],
};

const filterOptionImages: Record<string, string> = {
  Ganapathi: "/images/Ganesh-Chaturthi-Mahapuja.jpg",
  Lakshmi: "/images/Lakshmi-Homam.jpg",
  Shiva: "/images/Navagraha-Shanti-Puja.jpg",
  Vishnu: "/images/Lakshmi-Beej-Mantra.jpg",
  Hanuman: "/images/Navagraha-Shanti-Puja.jpg",
  Durga: "/images/maa-kali.jpg",
  Saraswati: "/images/Maa-saraswathi.jpg",
  Ekadashi: "/images/Lakshmi-Beej-Mantra.jpg",
  Purnima: "/images/Maa-saraswathi.jpg",
  Amavasya: "/images/maa-kali.jpg",
  Pradosh: "/images/Navagraha-Shanti-Puja.jpg",
  Navami: "/images/Ganesh-Chaturthi-Mahapuja.jpg",
  "Mangal Dosha": "/images/Navagraha-Shanti-Puja.jpg",
  "Kala Sarpa": "/images/maa-kali.jpg",
  "Pitru Dosha": "/images/Lakshmi-Homam.jpg",
  "Shani Dosha": "/images/Navagraha-Shanti-Puja.jpg",
  Prosperity: "/images/Lakshmi-Homam.jpg",
  Protection: "/images/maa-kali.jpg",
  Peace: "/images/Maa-saraswathi.jpg",
  Health: "/images/Lakshmi-Beej-Mantra.jpg",
  Career: "/images/Ganesh-Chaturthi-Mahapuja.jpg",
  Marriage: "/images/Lakshmi-Homam.jpg",
  "Tamil Nadu": "/images/Maa-saraswathi.jpg",
  Karnataka: "/images/Ganesh-Chaturthi-Mahapuja.jpg",
  Kerala: "/images/Lakshmi-Beej-Mantra.jpg",
  "Uttar Pradesh": "/images/Navagraha-Shanti-Puja.jpg",
  "Andhra Pradesh": "/images/Lakshmi-Homam.jpg",
  Rajasthan: "/images/maa-kali.jpg",
};

/** Returns true if the puja matches ALL active filters */
function pujaMatchesFilters(puja: Puja, filters: FilterState, searchQuery: string): boolean {
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    const searchMatches = [puja.title, puja.subtitle, puja.description, puja.location, puja.badge]
      .filter(Boolean)
      .some(text => text?.toLowerCase().includes(q));
    if (!searchMatches) return false;
  }

  const fieldMapping: Record<string, keyof Puja> = {
    Deity: "deity",
    Tithis: "tithis",
    Dosha: "dosha",
    Benefits: "benefit",
    Location: "filterLocation",
  };

  const searchText = [
    puja.title,
    puja.subtitle,
    puja.description,
    puja.location,
    puja.badge,
    ...(puja.details?.benefits?.map((b) => `${b.title} ${b.description}`) ?? []),
    puja.details?.templeLocation,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  for (const group of filterGroups) {
    const selectedValues = filters[group.label];
    if (!selectedValues || selectedValues.length === 0) continue;

    const groupMatches = selectedValues.some((selectedValue) => {
      const fieldName = fieldMapping[group.label];
      const savedValue = fieldName ? puja[fieldName] : undefined;

      if (typeof savedValue === "string" && savedValue.trim()) {
        return savedValue.trim().toLowerCase() === selectedValue.toLowerCase();
      }

      const optionConfig = group.options.find((o) => o.value === selectedValue);
      if (!optionConfig || optionConfig.keywords.length === 0) return false;
      return optionConfig.keywords.some((kw) => searchText.includes(kw));
    });

    if (!groupMatches) return false;
  }
  return true;
}


function PujaFilterModal({
  filters,
  onClose,
  onApply,
  onClear,
}: {
  filters: FilterState;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  onClear: () => void;
}) {
  const [draftFilters, setDraftFilters] = useState<FilterState>(filters);

  const selectFilter = (label: string, value: string) => {
    setDraftFilters((prev) => {
      const current = prev[label] || [];
      if (current.includes(value)) {
        return { ...prev, [label]: current.filter((v) => v !== value) };
      } else {
        return { ...prev, [label]: [...current, value] };
      }
    });
  };

  const renderCheckboxOption = (groupLabel: string, value: string) => {
    const selected = (draftFilters[groupLabel] || []).includes(value);

    return (
      <button
        key={value}
        type="button"
        onClick={() => selectFilter(groupLabel, value)}
        className="flex w-full items-start gap-3 text-left"
        aria-pressed={selected}
      >
        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition ${selected ? "border-[#2563eb] bg-[#2563eb] text-white" : "border-gray-200 bg-white text-transparent"
          }`}>
          <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
            <path d="M2.2 6.2 4.8 8.7 9.8 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="text-base font-bold leading-6 text-[#1f2937]">{value}</span>
      </button>
    );
  };

  const deityGroup = filterGroups.find((group) => group.label === "Deity");
  const compactGroups = filterGroups.filter((group) => ["Tithis", "Dosha", "Benefits"].includes(group.label));
  const locationGroup = filterGroups.find((group) => group.label === "Location");

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#111827]/55 px-0 sm:px-4 py-0 sm:py-6 backdrop-blur-[1px]">
      <div className="flex max-h-[92vh] sm:max-h-[92vh] w-full max-w-[920px] flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <h3 className="text-xl font-black text-[#1f1f1f]">Puja Filters</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close puja filters"
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-7">
          <div className="space-y-9">
            {deityGroup && (
              <section>
                <h4 className="mb-5 text-xl font-black text-[#1f1f1f]">{deityGroup.label}</h4>
                <div className="grid grid-cols-3 gap-x-4 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {deityGroup.options
                    .filter((option) => option.value !== "All")
                    .map((option) => {
                      const selected = (draftFilters[deityGroup.label] || []).includes(option.value);

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => selectFilter(deityGroup.label, option.value)}
                          className="text-center"
                          aria-pressed={selected}
                        >
                          <span className={`relative mx-auto block h-24 w-24 overflow-hidden rounded-lg border-2 transition ${selected ? "border-[#5B5BF6] shadow-[0_0_0_3px_rgba(91,91,246,0.2)]" : "border-transparent hover:border-gray-200"
                            }`}>
                            <img
                              src={filterOptionImages[option.value] || "/images/Lakshmi-Homam.jpg"}
                              alt={option.value}
                              className="h-full w-full object-cover"
                            />
                            {/* Selected overlay with big centered checkmark */}
                            {selected && (
                              <span className="absolute inset-0 flex items-center justify-center bg-[#5B5BF6]/50">
                                <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10 drop-shadow-lg">
                                  <circle cx="12" cy="12" r="11" fill="white" />
                                  <path d="M6.5 12.5 10.5 16.5 17.5 8" stroke="#5B5BF6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </span>
                            )}
                          </span>
                          <span className={`mt-2 block text-sm font-bold leading-5 ${selected ? "text-[#5B5BF6]" : "text-[#1f2937]"
                            }`}>
                            {option.value}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </section>
            )}

            <div className="grid gap-8 md:grid-cols-3">
              {compactGroups.map((group) => (
                <section key={group.label}>
                  <h4 className="mb-5 text-xl font-black text-[#1f1f1f]">{group.label}</h4>
                  <div className="space-y-4">
                    {group.options
                      .filter((option) => option.value !== "All")
                      .map((option) => renderCheckboxOption(group.label, option.value))}
                  </div>
                </section>
              ))}
            </div>

            {locationGroup && (
              <section>
                <h4 className="mb-5 text-xl font-black text-[#1f1f1f]">{locationGroup.label}</h4>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {locationGroup.options
                    .filter((option) => option.value !== "All")
                    .map((option) => renderCheckboxOption(locationGroup.label, option.value))}
                </div>
              </section>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-gray-100 px-6 py-5 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              setDraftFilters(defaultFilters);
              onClear();
            }}
            className="h-14 rounded border border-gray-200 bg-white px-12 text-base font-bold text-[#1f1f1f] transition hover:bg-gray-50"
          >
            Clear Filter
          </button>
          <button
            type="button"
            onClick={() => onApply(draftFilters)}
            className="h-14 rounded bg-[#2563eb] px-14 text-base font-bold text-white shadow-sm transition hover:bg-[#1d4ed8]"
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
}

function ShareModal({
  isOpen,
  onClose,
  pujaUrl
}: {
  isOpen: boolean;
  onClose: () => void;
  pujaUrl: string;
}) {
  if (!isOpen) return null;

  const handleShare = (platform: string) => {
    let url = "";
    const text = encodeURIComponent("Check out this sacred Puja!");
    const encodedPujaUrl = encodeURIComponent(pujaUrl);

    if (platform === "whatsapp") url = `https://wa.me/?text=${text}%20${encodedPujaUrl}`;
    if (platform === "facebook") url = `https://www.facebook.com/sharer/sharer.php?u=${encodedPujaUrl}`;
    if (platform === "twitter") url = `https://twitter.com/intent/tweet?text=${text}&url=${encodedPujaUrl}`;
    if (platform === "telegram") url = `https://t.me/share/url?url=${encodedPujaUrl}&text=${text}`;

    if (url) window.open(url, "_blank");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(pujaUrl);
    alert("Link copied!");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h3 className="text-lg font-bold text-gray-900 mb-6">Share Pooja</h3>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => handleShare("whatsapp")} className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-green-200 transition-colors">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white mb-2 shadow-sm">
              <i className="fa-brands fa-whatsapp text-xl"></i>
            </div>
            <span className="text-xs font-semibold text-gray-700">WhatsApp</span>
          </button>

          <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white mb-2 shadow-sm">
              <i className="fa-brands fa-instagram text-xl"></i>
            </div>
            <span className="text-xs font-semibold text-gray-700">Instagram</span>
          </button>

          <button onClick={() => handleShare("facebook")} className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-blue-200 transition-colors">
            <div className="w-10 h-10 bg-[#1877F2] rounded-full flex items-center justify-center text-white mb-2 shadow-sm">
              <i className="fa-brands fa-facebook-f text-xl"></i>
            </div>
            <span className="text-xs font-semibold text-gray-700">Facebook</span>
          </button>

          <button onClick={() => handleShare("twitter")} className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-gray-300 transition-colors">
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white mb-2 shadow-sm">
              <i className="fa-brands fa-x-twitter text-xl"></i>
            </div>
            <span className="text-xs font-semibold text-gray-700">Twitter</span>
          </button>

          <button onClick={() => handleShare("telegram")} className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-blue-200 transition-colors">
            <div className="w-10 h-10 bg-[#0088cc] rounded-full flex items-center justify-center text-white mb-2 shadow-sm">
              <i className="fa-brands fa-telegram text-xl"></i>
            </div>
            <span className="text-xs font-semibold text-gray-700">Telegram</span>
          </button>

          <button onClick={copyLink} className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 mb-2 shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            </div>
            <span className="text-xs font-semibold text-gray-700">Copy Link</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ----------------------------------------------------------------
export default function PujaPage() {
  const { t } = useTranslation();
  const [allPujas, setAllPujas] = useState<Puja[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const openShareModal = (url: string) => {
    setShareUrl(url);
    setShareModalOpen(true);
  };

  // Fetch all pujas once
  useEffect(() => {
    fetch("/api/puja")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Puja[]) => setAllPujas(Array.isArray(data) ? data : []))
      .catch(() => setAllPujas([]))
      .finally(() => setIsLoading(false));
  }, []);

  const defaultBanners: Puja[] = [
    {
      _id: "default-1",
      title: "Ganesh Chaturthi Mahapuja",
      location: "Maharashtra",
      date: "Available Daily",
      imageUrl: "/images/Ganesh-Chaturthi-Mahapuja.jpg",
      buttonText: "Participate Now",
      slug: "ganesh-chaturthi-mahapuja",
    },
    {
      _id: "default-2",
      title: "Navagraha Shanti Puja",
      location: "Tamil Nadu",
      date: "Available Daily",
      imageUrl: "/images/Navagraha-Shanti-Puja.jpg",
      buttonText: "Participate Now",
      slug: "navagraha-shanti-puja",
    },
    {
      _id: "default-3",
      title: "Lakshmi Homam",
      location: "Karnataka",
      date: "Available Daily",
      imageUrl: "/images/Lakshmi-Homam.jpg",
      buttonText: "Participate Now",
      slug: "lakshmi-homam",
    }
  ];

  // Limit carousel to first 5 pujas, or use default static banners if not loaded
  const carouselPujas = allPujas.length > 0 ? allPujas.slice(0, 5) : defaultBanners;

  // Banner auto-rotate
  useEffect(() => {
    if (carouselPujas.length <= 1) return;
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev === carouselPujas.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(id);
  }, [carouselPujas.length]);

  const activeIndex = carouselPujas.length === 0 ? 0 : Math.min(currentIndex, carouselPujas.length - 1);

  const clearFilters = () => setFilters(defaultFilters);
  const applyFilters = useCallback((nextFilters: FilterState) => {
    setFilters(nextFilters);
    setIsFilterModalOpen(false);
  }, []);

  const hasActiveFilters = Object.values(filters).some((arr) => arr && arr.length > 0);

  // -- Apply filters to get displayed pujas --
  const displayedPujas = allPujas.filter((p) => pujaMatchesFilters(p, filters, searchQuery));
  const howItWorksSteps = [
    {
      title: t.puja.step1Title,
      description: t.puja.step1Desc,
      imageSrc: "/images/app-banner1.jpg",
      imageAlt: "Choose a puja from the list",
      tag: "Book Puja",
      cta: t.puja.bookNow,
    },
    {
      title: t.puja.step2Title,
      description: t.puja.step2Desc,
      imageSrc: "/images/app-banner2.jpg",
      imageAlt: "Fill devotee information for the puja",
      tag: "Sankalp Details",
      cta: t.puja.bookNow,
    },
    {
      title: t.puja.step3Title,
      description: t.puja.step3Desc,
      imageSrc: "/images/app-banner3.jpg",
      imageAlt: "Receive puja video on WhatsApp",
      tag: "Puja Video",
      cta: t.puja.bookNow,
    },
    {
      title: t.puja.step4Title,
      description: t.puja.step4Desc,
      imageSrc: "/images/app-banner1.jpg",
      imageAlt: "Receive aashirwad box at the registered address",
      tag: "Aashirwad Box",
      cta: t.puja.bookNow,
    },
  ];

  return (
    <>
      <Navbar />
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        pujaUrl={shareUrl}
      />
      <main className="min-h-screen bg-[#faf8f5]">
        {/* Hero Section */}
        <div className="bg-[#fef8f4] py-16 text-center border-b border-[#fde8d4] relative">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#f0d6c4_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="relative z-10 px-4">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#5c2424] mb-4">Discover Sacred Pujas & Divine Blessings</h1>
            <p className="text-[#6b4c4c] text-sm md:text-base max-w-2xl mx-auto mb-10">
              Find authentic temples, rituals performed by qualified priests and receive personalized sankalpam, puja videos, and divine blessings.
            </p>

            {/* Search Bar + Filter */}
            <div className="max-w-2xl mx-auto flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="What puja are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-6 pr-10 py-3.5 rounded-full border border-[#f0d6c4] shadow-sm text-sm outline-none focus:border-[#d95a2b]"
                />
                <svg className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="bg-white border border-[#f0d6c4] text-[#d95a2b] w-12 h-12 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 shrink-0 relative"
              >
                {hasActiveFilters && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                )}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1200px] px-4 md:px-8 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-[#5c2424]">Upcoming Online Pujas</h2>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-semibold text-red-500 hover:text-red-700 underline"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Quick Categories Filter row */}
          <div className="flex overflow-x-auto gap-2.5 pb-4 no-scrollbar mb-6">
            <button
              onClick={clearFilters}
              className={`shrink-0 rounded-full px-5 py-2 text-sm font-bold transition-colors ${!hasActiveFilters ? "bg-[#d95a2b] text-white" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"}`}
            >
              All
            </button>
            {filterGroups.map(group => (
              <button
                key={group.label}
                onClick={() => setIsFilterModalOpen(true)}
                className={`shrink-0 rounded-full px-5 py-2 text-sm font-bold transition-colors border ${filters[group.label]?.length > 0 ? "bg-[#d95a2b] text-white border-[#d95a2b]" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}
              >
                {group.label}
              </button>
            ))}
          </div>

          {/* Filter Modal */}
          {isFilterModalOpen && (
            <PujaFilterModal
              filters={filters}
              onClose={() => setIsFilterModalOpen(false)}
              onApply={applyFilters}
              onClear={clearFilters}
            />
          )}

          {/* Grid of Cards */}
          {isLoading ? (
            <div className="mt-16 flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-[#d95a2b] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : displayedPujas.length === 0 ? (
            <div className="mt-16 flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-[#e3d1c2] bg-white py-16 text-center">
              <SparklesIcon className="h-10 w-10 text-[#d95a2b]" />
              <p className="text-lg font-semibold text-[#5c2424]">{t.puja.noMatch}</p>
              <p className="text-sm text-gray-500">{t.puja.noMatchSub}</p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-2 rounded-full bg-[#d95a2b] px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#b0451f] transition"
              >
                {t.puja.clearFilters}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8 lg:grid-cols-3">
              {displayedPujas.map((puja) => {
                const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}/puja/${puja.slug || slugify(puja.title)}` : '';
                return (
                  <div
                    key={puja._id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden group hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-[220px] w-full shrink-0">
                      <img
                        src={puja.imageUrl || "https://images.unsplash.com/photo-1601024445121-e5b82f020549?auto=format&fit=crop&w=800&q=80"}
                        alt={puja.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      {puja.badge && (
                        <div className="absolute top-4 left-0 bg-[#d92b2b] text-white text-[11px] font-bold px-3 py-1 shadow-sm rounded-r-md">
                          {puja.badge}
                        </div>
                      )}

                      <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-600 hover:text-red-500 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        </button>
                        <button onClick={() => openShareModal(fullUrl)} className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-600 hover:text-[#d95a2b] transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                        </button>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-1 text-left">
                      <p className="text-[#d95a2b] text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#d95a2b]"></span>
                        {puja.subtitle || "SPECIAL PUJA"}
                      </p>

                      <h3 className="text-[18px] font-bold text-gray-900 mb-2 leading-snug line-clamp-2">
                        {puja.title}
                      </h3>

                      <p className="text-gray-500 text-[13px] leading-relaxed line-clamp-2 mb-4 flex-1">
                        {puja.description || "Join us for this sacred ritual to seek divine blessings and fulfillment."}
                      </p>

                      <div className="border border-gray-100 rounded-lg p-3 space-y-2 mb-4 bg-gray-50/50">
                        <div className="flex items-center gap-2.5 text-[12px] text-gray-600">
                          <svg className="w-4 h-4 text-[#d95a2b] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          <span className="line-clamp-1">{puja.location || "Vaidika Yagashala"}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[12px] text-gray-600">
                          <svg className="w-4 h-4 text-[#d95a2b] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <span className="line-clamp-1">{puja.date || "Available Daily"}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <div>
                          {/* We will attempt to get a price, otherwise show a placeholder */}
                          <div className="text-[18px] font-black text-gray-900">₹{(puja as any).packages?.[0]?.priceINR || (puja as any).packages?.[0]?.price || '516'}</div>
                          <div className="text-[10px] text-gray-500 font-semibold uppercase">Per Booking</div>
                        </div>
                        <Link
                          href={`/puja/${puja.slug || slugify(puja.title)}`}
                          className="bg-[#009e5b] text-white text-[13px] font-bold px-5 py-2.5 rounded-full hover:bg-[#008c51] transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          Book Now
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {displayedPujas.length > 0 && !isLoading && (
            <div className="mt-12 text-center pb-10">
              <p className="text-[16px] sm:text-[18px] mb-2 font-medium text-gray-600">You've reached the end of available pujas</p>
              <p className="text-[14px] text-gray-500">{displayedPujas.length} of {displayedPujas.length} pujas shown</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}


