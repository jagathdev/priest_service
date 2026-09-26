"use client";
import React, { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import { SparklesIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useTranslation } from "@/contexts/LanguageContext";
import ReviewsSection from "@/components/common/ReviewsSection";
import HowItWorksCarousel from "@/components/common/HowItWorksCarousel";

interface homa {
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
// Each option has a `value` (what we store) and `keywords` (matched against homa text)
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
  Shiva: "/images/Navagraha-Shanti-homa.jpg",
  Vishnu: "/images/Lakshmi-Beej-Mantra.jpg",
  Hanuman: "/images/Navagraha-Shanti-homa.jpg",
  Durga: "/images/maa-kali.jpg",
  Saraswati: "/images/Maa-saraswathi.jpg",
  Ekadashi: "/images/Lakshmi-Beej-Mantra.jpg",
  Purnima: "/images/Maa-saraswathi.jpg",
  Amavasya: "/images/maa-kali.jpg",
  Pradosh: "/images/Navagraha-Shanti-homa.jpg",
  Navami: "/images/Ganesh-Chaturthi-Mahapuja.jpg",
  "Mangal Dosha": "/images/Navagraha-Shanti-homa.jpg",
  "Kala Sarpa": "/images/maa-kali.jpg",
  "Pitru Dosha": "/images/Lakshmi-Homam.jpg",
  "Shani Dosha": "/images/Navagraha-Shanti-homa.jpg",
  Prosperity: "/images/Lakshmi-Homam.jpg",
  Protection: "/images/maa-kali.jpg",
  Peace: "/images/Maa-saraswathi.jpg",
  Health: "/images/Lakshmi-Beej-Mantra.jpg",
  Career: "/images/Ganesh-Chaturthi-Mahapuja.jpg",
  Marriage: "/images/Lakshmi-Homam.jpg",
  "Tamil Nadu": "/images/Maa-saraswathi.jpg",
  Karnataka: "/images/Ganesh-Chaturthi-Mahapuja.jpg",
  Kerala: "/images/Lakshmi-Beej-Mantra.jpg",
  "Uttar Pradesh": "/images/Navagraha-Shanti-homa.jpg",
  "Andhra Pradesh": "/images/Lakshmi-Homam.jpg",
  Rajasthan: "/images/maa-kali.jpg",
};

/** Returns true if the homa matches ALL active filters */
function pujaMatchesFilters(homa: homa, filters: FilterState): boolean {
  const fieldMapping: Record<string, keyof homa> = {
    Deity: "deity",
    Tithis: "tithis",
    Dosha: "dosha",
    Benefits: "benefit",
    Location: "filterLocation",
  };

  const searchText = [
    homa.title,
    homa.subtitle,
    homa.description,
    homa.location,
    homa.badge,
    ...(homa.details?.benefits?.map((b) => `${b.title} ${b.description}`) ?? []),
    homa.details?.templeLocation,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  for (const group of filterGroups) {
    const selectedValues = filters[group.label];
    if (!selectedValues || selectedValues.length === 0) continue;

    const groupMatches = selectedValues.some((selectedValue) => {
      const fieldName = fieldMapping[group.label];
      const savedValue = fieldName ? homa[fieldName] : undefined;

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
          <h3 className="text-xl font-black text-[#1f1f1f]">homa Filters</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close homa filters"
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

// --- Main Page ----------------------------------------------------------------
export default function PujaPage() {
  const { t } = useTranslation();
  const [allPujas, setAllPujas] = useState<homa[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Fetch all homas once
  useEffect(() => {
    fetch("/api/homa")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: homa[]) => setAllPujas(Array.isArray(data) ? data : []))
      .catch(() => setAllPujas([]))
      .finally(() => setIsLoading(false));
  }, []);

  const defaultBanners: homa[] = [
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
      title: "Navagraha Shanti homa",
      location: "Tamil Nadu",
      date: "Available Daily",
      imageUrl: "/images/Navagraha-Shanti-homa.jpg",
      buttonText: "Participate Now",
      slug: "navagraha-shanti-homa",
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

  // Limit carousel to first 5 homas, or use default static banners if not loaded
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

  // -- Apply filters to get displayed homas --
  const displayedPujas = allPujas.filter((p) => pujaMatchesFilters(p, filters));
  const howItWorksSteps = [
    {
      title: t.puja.step1Title,
      description: t.puja.step1Desc,
      imageSrc: "/images/app-banner1.jpg",
      imageAlt: "Choose a homa from the list",
      tag: "Book homa",
      cta: t.puja.bookNow,
    },
    {
      title: t.puja.step2Title,
      description: t.puja.step2Desc,
      imageSrc: "/images/app-banner2.jpg",
      imageAlt: "Fill devotee information for the homa",
      tag: "Sankalp Details",
      cta: t.puja.bookNow,
    },
    {
      title: t.puja.step3Title,
      description: t.puja.step3Desc,
      imageSrc: "/images/app-banner3.jpg",
      imageAlt: "Receive homa video on WhatsApp",
      tag: "homa Video",
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
      <main className="min-h-screen bg-[#f9f9ff] py-10">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8">

          {/* Page Heading */}
          <h1 className="mb-8 text-center text-[18px] font-bold leading-tight text-[#3b0764] md:text-[36px]">
            {t.puja.heading}
          </h1>

          {/* Banner Carousel — instant render */}
          <div className="relative overflow-hidden rounded-2xl border border-[#e3d9f8] shadow-[0_18px_48px_rgba(80,44,150,0.12)]">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
              >
                {carouselPujas.map((homa, idx) => (
                  <div
                    key={homa._id}
                    className="relative h-[460px] sm:h-[480px] w-full shrink-0 md:h-[400px] flex flex-col md:block bg-linear-to-br from-[#2e1065] via-[#3b0764] to-[#1e1b4b] overflow-hidden"
                  >
                    {/* Image Area: Top on mobile, Right on desktop */}
                    <div className="relative w-full h-[220px] sm:h-[240px] md:absolute md:inset-y-0 md:right-0 md:w-[45%] md:h-full overflow-hidden flex items-center justify-center bg-black/10 select-none shrink-0">
                      {/* Ambient background glow of the image (desktop only) */}
                      <div
                        className="absolute inset-0 opacity-20 blur-xl scale-125 hidden md:block"
                        style={{
                          backgroundImage: `url(${homa.imageUrl})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />

                      {/* Main Image */}
                      <img
                        src={homa.imageUrl}
                        alt={homa.title}
                        className={`w-full h-full object-cover object-top transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${idx === activeIndex ? 'scale-100 opacity-90 md:opacity-100' : 'scale-108 opacity-40'}`}
                      />

                      {/* Mobile bottom fade to blend top image into bottom purple area */}
                      <div className="absolute inset-0 md:hidden bg-gradient-to-t from-[#3b0764] via-[#3b0764]/30 to-transparent" />

                      {/* Premium Vignette Fade transition on desktop */}
                      <div className="absolute inset-y-0 left-0 w-24 bg-linear-to-r from-[#3b0764] to-transparent hidden md:block z-20" />
                    </div>

                    {/* Content Area: Bottom on mobile, Left on desktop */}
                    <div className="relative md:absolute md:inset-0 z-10 flex flex-col justify-center items-center md:items-start text-center md:text-left md:w-[60%] p-6 md:p-10 text-white flex-1">
                      <div className="space-y-4 md:space-y-6 w-full flex flex-col items-center md:items-start">
                        <h2
                          className={`max-w-xl text-xl font-extrabold leading-tight sm:text-2xl md:text-3xl lg:text-4xl text-white md:text-transparent md:bg-clip-text md:bg-linear-to-r md:from-white md:via-slate-100 md:to-amber-100 drop-shadow-md transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${idx === activeIndex ? 'opacity-100 translate-y-0 delay-150' : 'opacity-0 translate-y-6 duration-300 delay-0'}`}
                        >
                          {homa.title}
                        </h2>

                        <div
                          className={`flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 sm:gap-6 w-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${idx === activeIndex ? 'opacity-100 translate-y-0 delay-300' : 'opacity-0 translate-y-6 duration-300 delay-0'}`}
                        >
                          {/* Location */}
                          {homa.location && (
                            <div className="flex items-center gap-1.5 text-xs md:text-sm text-gray-200 md:text-purple-200">
                              <svg className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="line-clamp-1">{homa.location}</span>
                            </div>
                          )}

                          {/* CTA Button visible on mobile and desktop */}
                          <Link
                            href={`/homa/${homa.slug || slugify(homa.title)}`}
                            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-black text-[#3b0764] hover:bg-amber-400 transition-all hover:scale-105 shadow-lg shadow-amber-500/20 shrink-0"
                          >
                            {homa.buttonText || t.puja.bookNow}
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Dots */}
            <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
              {carouselPujas.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${i === activeIndex ? "w-8 bg-white" : "w-2 bg-white/50"}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setCurrentIndex((p) => (p === 0 ? carouselPujas.length - 1 : p - 1))}
              aria-label="Previous slide"
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/30 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/50"
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                <path d="m12.5 4.5-5 5 5 5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setCurrentIndex((p) => (p === carouselPujas.length - 1 ? 0 : p + 1))}
              aria-label="Next slide"
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/30 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/50"
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                <path d="m7.5 4.5 5 5-5 5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>


          {/* Section */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-[#3b0764] md:text-3xl">
              {t.puja.sectionTitle}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#1f1f1f] md:text-base">
              {t.puja.sectionSubtitle}
            </p>

            {/* -- Filter bar -- */}
            <div className="mt-6">
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(true)}
                  className="flex shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-[#6869F9] shadow-sm transition hover:border-[#6869F9]/40 hover:bg-[#f5f3ff]"
                >
                  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                    <path d="M3 5h14M6 10h8M9 15h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  {t.puja.filter}
                </button>

                <div className="h-6 w-px shrink-0 bg-gray-200" />

                {filterGroups.map((group) => {
                  const activeCount = filters[group.label]?.length || 0;
                  const isActive = activeCount > 0;
                  return (
                    <button
                      key={group.label}
                      type="button"
                      onClick={() => setIsFilterModalOpen(true)}
                      className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-3 text-sm font-semibold transition ${isActive
                        ? "bg-[#6869F9] text-white shadow-sm"
                        : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
                        }`}
                    >
                      <span>{isActive ? (activeCount === 1 ? filters[group.label][0] : `${group.label} (${activeCount})`) : group.label}</span>
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        className="h-3.5 w-3.5"
                      >
                        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  )
                })}

                {/* Clear all */}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="flex shrink-0 items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-500 transition hover:bg-red-100"
                  >
                    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
                      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    {t.puja.clearAll}
                  </button>
                )}
              </div>

              {/* Active filter tags */}
              {hasActiveFilters && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{t.puja.active}</span>
                  {Object.entries(filters)
                    .filter(([, v]) => v && v.length > 0)
                    .flatMap(([key, values]) => values.map((val) => (
                      <span
                        key={`${key}-${val}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#6869F9]/10 px-3 py-1 text-xs font-semibold text-[#6869F9]"
                      >
                        {key}: {val}
                        <button
                          type="button"
                          onClick={() => setFilters((p) => ({ ...p, [key]: p[key].filter(v => v !== val) }))}
                          aria-label={`Remove ${key} filter`}
                          className="ml-0.5 rounded-full hover:opacity-70 transition-opacity"
                        >
                          <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
                            <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </button>
                      </span>
                    )))}
                </div>
              )}
            </div>

            {isFilterModalOpen && (
              <PujaFilterModal
                filters={filters}
                onClose={() => setIsFilterModalOpen(false)}
                onApply={applyFilters}
                onClear={clearFilters}
              />
            )}

            {/* Result count */}
            {!isLoading && (
              <p className="mt-4 text-sm text-[#1f1f1f]">
                {hasActiveFilters
                  ? `${t.puja.showingPujas} ${displayedPujas.length} ${t.puja.of} ${allPujas.length} ${t.puja.homas}`
                  : `${allPujas.length} ${t.puja.allPujas}`}
              </p>
            )}

            {/* -- homa Cards -- */}
            {isLoading ? null : displayedPujas.length === 0 ? (
              <div className="mt-16 flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-[#c4b8ef] bg-white py-16 text-center">
                <SparklesIcon className="h-10 w-10 text-[#1f1f1f]" />
                <p className="text-lg font-semibold text-[#3b0764]">{t.puja.noMatch}</p>
                <p className="text-sm text-[#1f1f1f]">{t.puja.noMatchSub}</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-2 rounded-full bg-[#6869F9] px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#5657e8] transition"
                >
                  {t.puja.clearFilters}
                </button>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 lg:gap-10 lg:grid-cols-3">
                {displayedPujas.map((homa) => (
                  <div
                    key={homa._id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col p-5"
                  >
                    {/* Image Section */}
                    <div className="relative h-[220px] w-full rounded-xl overflow-hidden shrink-0">
                      <img
                        src={homa.imageUrl || "https://images.unsplash.com/photo-1601024445121-e5b82f020549?auto=format&fit=crop&w=800&q=80"}
                        alt={homa.title}
                        className="w-full h-full object-fit"
                      />
                      {/* Top Left Badge */}
                      {homa.badge && (
                        <div className="absolute top-3 left-3 bg-[#ffc107] text-[#1f1f1f] text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
                          {homa.badge}
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="pt-5 pb-1 px-1 flex flex-col flex-1 text-left">
                      <p className="text-[#6869F9] text-[11px] font-bold uppercase tracking-widest mb-3 text-center w-full">
                        {homa.subtitle || "SPECIAL homa & YAGYA"}
                      </p>
                      <h3 className="text-[18px] font-bold text-[#1f1f1f] mb-3 leading-snug">
                        {homa.title}
                      </h3>
                      <p className="text-gray-500 text-[14px] leading-relaxed line-clamp-2 mb-6 flex-1">
                        {homa.description || "Join us for this sacred ritual to seek divine blessings."}
                      </p>

                      {/* Location & Date */}
                      <div className="flex items-start gap-2.5 mb-3 text-[13px] text-gray-500">
                        <svg className="w-[16px] h-[16px] text-[#a78bfa] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span className="line-clamp-2 leading-tight">{homa.location || "Sacred Temple, India"}</span>
                      </div>
                      <div className="flex items-start gap-2.5 mb-6 text-[13px] text-gray-500">
                        <svg className="w-[16px] h-[16px] text-[#a78bfa] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span className="leading-tight">{homa.date || t.puja.announcedSoon}</span>
                      </div>

                      <Link href={`/homa/${homa.slug || slugify(homa.title)}`} className="w-full bg-[#6869F9] text-white text-[15px] font-bold tracking-wide py-3.5 rounded-lg hover:bg-[#5657e8] transition-colors flex items-center justify-center gap-1.5">
                        {homa.buttonText || t.puja.bookNow}
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* -- Reviews -- */}
          <section className="mt-20 border-t border-gray-100 pt-16 pb-16">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-[#1f1f1f] md:text-3xl">{t.puja.devoteesTitle}</h2>
              <p className="mt-2 text-sm text-gray-600 md:text-base">{t.puja.devoteesSubtitle}</p>
            </div>
            <ReviewsSection />
          </section>

          {/* -- Stats Section -- */}
          <section className="mt-20">
            <h2 className="mb-2 text-2xl font-bold text-[#1f1f1f] md:text-3xl">
              {t.puja.sacredJourney}
            </h2>
            <p className="mb-8 text-sm text-gray-600">{t.puja.whyBook}</p>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl bg-linear-to-br from-[#eff6ff] to-[#dbeafe] p-8 text-center shadow-sm border border-[#bfdbfe]/50 flex flex-col items-center justify-center">
                <h3 className="text-2xl font-black text-[#2563eb] whitespace-nowrap">10,00,000+</h3>
                <p className="mt-1 text-sm font-semibold text-[#3b82f6]">{t.puja.pujasDone}</p>
              </div>
              <div className="rounded-2xl bg-linear-to-br from-[#f5f3ff] to-[#ede8ff] p-8 text-center shadow-sm border border-[#e0d9ff]/50 flex flex-col items-center justify-center">
                <h3 className="text-2xl font-black text-[#7c3aed] whitespace-nowrap">300,000+</h3>
                <p className="mt-1 text-sm font-semibold text-[#8b5cf6]">{t.puja.happyDevotees}</p>
              </div>
              <div className="rounded-2xl bg-linear-to-br from-[#fdf2f8] to-[#fce7f3] p-8 text-center shadow-sm border border-[#fbcfe8]/50 flex flex-col items-center justify-center">
                <h3 className="text-2xl font-black text-[#db2777] whitespace-nowrap">100+</h3>
                <p className="mt-1 text-sm font-semibold text-[#ec4899]">{t.puja.famousTemples}</p>
              </div>
              <div className="rounded-2xl bg-linear-to-br from-[#fff7ed] to-[#ffedd5] p-8 text-center shadow-sm border border-[#fed7aa]/50 flex flex-col items-center justify-center">
                <h3 className="text-2xl font-black text-[#d97706] whitespace-nowrap">{t.puja.sankalp}</h3>
                <p className="mt-1 text-sm font-semibold text-[#f59e0b]">{t.puja.sankalpDesc}</p>
              </div>
            </div>
          </section>

          <HowItWorksCarousel title={t.puja.howItWorks} steps={howItWorksSteps} />
        </div>
      </main>
    </>
  );
}


