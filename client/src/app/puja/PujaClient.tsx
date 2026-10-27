"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import WishlistButton from "@/components/common/WishlistButton";
import { formatStartingPrice } from "@/lib/pricing";

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
  packages?: Array<{
    priceINR?: number | string;
    price?: number | string;
    [key: string]: unknown;
  }>;
  price?: number | string;
  priceINR?: number | string;
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

interface FilterGroup {
  label: string;
  options: { value: string }[];
}

type FilterState = Record<string, string[]>; // label -> array of selected values

const defaultFilters: FilterState = {
  Deity: [],
  Tithis: [],
  Dosha: [],
  Benefits: [],
  Location: [],
};

/** Returns true if the puja matches ALL active filters */
function pujaMatchesFilters(
  puja: Puja,
  filters: FilterState,
  searchQuery: string,
  filterGroups: FilterGroup[]
): boolean {
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    const searchMatches = [puja.title, puja.shortTitle, puja.subtitle, puja.description, puja.location, puja.badge]
      .filter(Boolean)
      .some((text) => text?.toLowerCase().includes(q));
    if (!searchMatches) return false;
  }

  const fieldMapping: Record<string, keyof Puja> = {
    Deity: "deity",
    Tithis: "tithis",
    Dosha: "dosha",
    Benefits: "benefit",
    Location: "filterLocation",
  };

  for (const group of filterGroups) {
    const selectedValues = filters[group.label];
    if (!selectedValues || selectedValues.length === 0) continue;

    const groupMatches = selectedValues.some((selectedValue) => {
      const fieldName = fieldMapping[group.label];
      const savedValue = fieldName ? puja[fieldName] : undefined;

      if (typeof savedValue === "string" && savedValue.trim()) {
        if (savedValue.trim().toLowerCase() === selectedValue.toLowerCase()) {
          return true;
        }
      }

      if (group.label === "Location" && puja.location) {
        if (puja.location.toLowerCase().includes(selectedValue.toLowerCase())) {
          return true;
        }
      }

      return false;
    });

    if (!groupMatches) return false;
  }
  return true;
}

function PujaFilterModal({
  filters,
  filterGroups,
  initialTab,
  onClose,
  onApply,
  onClear,
}: {
  filters: FilterState;
  filterGroups: FilterGroup[];
  initialTab?: string;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  onClear: () => void;
}) {
  const [draftFilters, setDraftFilters] = useState<FilterState>(filters);
  const [activeTab, setActiveTab] = useState<string>(
    (initialTab && filterGroups.some((g) => g.label === initialTab))
      ? initialTab
      : filterGroups[0]?.label || ""
  );
  const [searchQuery, setSearchQuery] = useState("");

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

  const activeGroup = filterGroups.find((g) => g.label === activeTab) || filterGroups[0];
  const filteredOptions = activeGroup
    ? activeGroup.options.filter((o) =>
      o.value.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  const totalSelectedCount = Object.values(draftFilters).reduce(
    (acc, curr) => acc + (curr?.length || 0),
    0
  );

  if (filterGroups.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-2.5 sm:p-4 backdrop-blur-sm transition-opacity duration-300">
      <div className="w-full max-w-[550px] h-[82vh] max-h-[580px] flex flex-col overflow-hidden rounded-[20px] bg-white shadow-2xl animate-[fadeIn_0.2s_ease-out]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-[#ebd5c1] shrink-0 bg-white">
          <h3 className="text-lg sm:text-[22px] font-serif font-bold text-ink">Puja Filters</h3>
          <button onClick={onClose} aria-label="Close filters" className="p-1 text-gray-400 hover:text-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Sidebar */}
          <div className="w-[36%] sm:w-1/3 border-r border-[#ebd5c1] overflow-y-auto bg-stone-50/50">
            {filterGroups.map((group) => {
              const isActive = group.label === activeTab;
              const groupSelectedCount = (draftFilters[group.label] || []).length;
              return (
                <button
                  key={group.label}
                  onClick={() => {
                    setActiveTab(group.label);
                    setSearchQuery("");
                  }}
                  className={`w-full text-left px-3 sm:px-4 py-3 sm:py-3.5 text-xs sm:text-sm font-bold transition-colors relative flex items-center justify-between ${isActive ? 'bg-[#F1F5F9] text-[#14395C]' : 'text-gray-700 hover:bg-gray-100/60'}`}
                >
                  <span className="truncate">{group.label}</span>
                  {groupSelectedCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#14395C] text-white text-[10px] font-bold flex items-center justify-center shrink-0 ml-1">
                      {groupSelectedCount}
                    </span>
                  )}
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#14395C]"></div>}
                </button>
              )
            })}
          </div>

          {/* Content */}
          <div className="w-[64%] sm:w-2/3 p-3.5 sm:p-5 overflow-y-auto relative custom-scrollbar bg-white">
            <h4 className="text-sm sm:text-base font-bold text-[#9e1c1c] mb-2.5 sm:mb-4">{activeGroup.label}</h4>

            {/* Search */}
            <div className="relative mb-3.5 sm:mb-5">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeGroup.label}`}
                className="w-full pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 border border-gray-200 rounded-full outline-none text-xs sm:text-sm focus:border-[#009644] transition-colors"
              />
              <svg className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>

            {/* Options */}
            <div className="space-y-3 sm:space-y-4">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = (draftFilters[activeGroup.label] || []).includes(option.value);
                  return (
                    <label key={option.value} className="flex items-start gap-2.5 cursor-pointer group select-none">
                      <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => selectFilter(activeGroup.label, option.value)}
                          className="peer w-[18px] h-[18px] appearance-none rounded-[4px] border border-gray-300 checked:bg-white checked:border-[#14395C] transition-colors cursor-pointer"
                        />
                        {/* Custom checkmark */}
                        <svg className="absolute w-3 h-3 text-transparent peer-checked:text-[#14395C] pointer-events-none transition-colors" viewBox="0 0 14 10" fill="none">
                          <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-gray-700 group-hover:text-gray-900 leading-snug pt-[1px]">{option.value}</span>
                    </label>
                  )
                })
              ) : (
                <p className="text-xs sm:text-sm text-gray-500 text-center py-4">No matching options found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between px-3.5 py-3 sm:px-6 sm:py-3.5 border-t border-[#ebd5c1] gap-2.5 sm:gap-3 bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-10">
          <button
            type="button"
            onClick={() => { setDraftFilters(defaultFilters); onClear(); }}
            className="flex-1 h-11 sm:h-12 border border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-full text-xs sm:text-sm font-bold text-gray-700 transition-all text-center flex items-center justify-center shadow-xs"
          >
            Clear Filter
          </button>
          <button
            type="button"
            onClick={() => onApply(draftFilters)}
            className="flex-1 h-11 sm:h-12 bg-[#14395C] hover:bg-[#0f2d4a] active:bg-[#091e32] text-white rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-md shadow-slate-900/20 active:scale-[0.99] transition-all group"
          >
            <span>Apply Filter</span>
            {totalSelectedCount > 0 && (
              <span className="bg-white/25 text-white text-[11px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {totalSelectedCount}
              </span>
            )}
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white group-hover:translate-x-0.5 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

import ShareModal, { ShareData } from "@/components/common/ShareModal";

// --- Main Page ----------------------------------------------------------------
export default function PujaClient({ initialPujas }: { initialPujas?: Puja[] }) {
  const allPujas = useMemo(() => initialPujas || [], [initialPujas]);
  const fetched = true;
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterModalInitialTab, setFilterModalInitialTab] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState<ShareData>({});
  const router = useRouter();

  const openFilterModal = (tabLabel?: string) => {
    setFilterModalInitialTab(tabLabel || "");
    setIsFilterModalOpen(true);
  };

  const openShareModal = (data: ShareData) => {
    setShareData(data);
    setShareModalOpen(true);
  };

  const clearFilters = () => setFilters(defaultFilters);
  const applyFilters = useCallback((nextFilters: FilterState) => {
    setFilters(nextFilters);
    setIsFilterModalOpen(false);
  }, []);

  const hasActiveFilters = Object.values(filters).some((arr) => arr && arr.length > 0);

  // Compute dynamic filter groups ONLY from values actually present in saved pujas
  const dynamicFilterGroups = useMemo(() => {
    const extractValues = (key: keyof Puja, altKey?: keyof Puja) => {
      const map = new Map<string, string>();
      allPujas.forEach((p) => {
        const val1 = p[key];
        if (typeof val1 === "string" && val1.trim()) {
          const trimmed = val1.trim();
          const lower = trimmed.toLowerCase();
          if (!map.has(lower)) {
            map.set(lower, trimmed);
          }
        }
        if (altKey) {
          const val2 = p[altKey];
          if (typeof val2 === "string" && val2.trim()) {
            const trimmed = val2.trim();
            const lower = trimmed.toLowerCase();
            if (!map.has(lower)) {
              map.set(lower, trimmed);
            }
          }
        }
      });
      return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
    };

    const deities = extractValues("deity");
    const tithis = extractValues("tithis");
    const doshas = extractValues("dosha");
    const benefits = extractValues("benefit");
    // Only extract from filterLocation so only admin entered filter values show
    const locations = extractValues("filterLocation");

    const groups: FilterGroup[] = [];

    if (deities.length > 0) {
      groups.push({
        label: "Deity",
        options: deities.map((v) => ({ value: v })),
      });
    }
    if (tithis.length > 0) {
      groups.push({
        label: "Tithis",
        options: tithis.map((v) => ({ value: v })),
      });
    }
    if (doshas.length > 0) {
      groups.push({
        label: "Dosha",
        options: doshas.map((v) => ({ value: v })),
      });
    }
    if (benefits.length > 0) {
      groups.push({
        label: "Benefit",
        options: benefits.map((v) => ({ value: v })),
      });
    }
    if (locations.length > 0) {
      groups.push({
        label: "Location",
        options: locations.map((v) => ({ value: v })),
      });
    }

    return groups;
  }, [allPujas]);

  // -- Open filter modal if URL has ?filter=... param --
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const filterParam = params.get("filter");
      if (filterParam) {
        const found = dynamicFilterGroups.find(
          (g) => g.label.toLowerCase() === filterParam.toLowerCase()
        );
        const modalTab = found ? found.label : (filterParam.toLowerCase() === "location" ? "Location" : "");
        if (modalTab) {
          const timeoutId = setTimeout(() => {
            openFilterModal(modalTab);
          }, 0);
          return () => clearTimeout(timeoutId);
        }
      }
    }
  }, [dynamicFilterGroups]);

  // -- Apply filters to get displayed pujas --
  const displayedPujas = useMemo(() => {
    return allPujas.filter((p) => pujaMatchesFilters(p, filters, searchQuery, dynamicFilterGroups));
  }, [allPujas, filters, searchQuery, dynamicFilterGroups]);

  return (
    <>
      <Navbar />
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        data={shareData}
      />
      <main className="min-h-screen">
        {/* Hero Section - Light Sacred Sandalwood Theme */}
        <div className="bg-gradient-to-b from-[#fff6ef] via-[#fdeee0] to-[#f9e3d0] py-12 md:py-16 text-center border-b border-[#fcd5b5] relative overflow-hidden">
          {/* Left Inverted Mandala Decoration */}
          <div className="absolute left-0 top-0 bottom-0 h-full pointer-events-none opacity-50 z-0 hidden min-[769px]:flex items-center">
            <Image
              src="/images/mandala.png"
              alt="Mandala Left"
              width={200}
              height={200}
              className="h-full w-auto object-contain -scale-x-100"
              style={{ transform: "scaleX(-1)" }}
            />
          </div>

          {/* Right Mandala Decoration */}
          <div className="absolute right-0 top-0 bottom-0 h-full pointer-events-none opacity-50 z-0 hidden min-[769px]:flex items-center">
            <Image
              src="/images/mandala.png"
              alt="Mandala Right"
              width={200}
              height={200}
              className="h-full w-auto object-contain"
            />
          </div>

          <div className="relative z-10 max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-10">
            <h1 className="text-3xl sm:text-4xl md:text-[48px] font-serif font-extrabold tracking-tight mb-4 leading-tight text-[#2c1209]">
              Book Authentic <span className="text-[#d95a2b]">Divine Pujas</span> Online
            </h1>
            <p className="text-stone-600 text-sm md:text-base max-w-2xl mx-auto mb-8 font-medium leading-relaxed">
              Performed by certified Vedic Pandits in ancient temples across India. Receive live video streaming, personalized sankalpam, and sacred prasadam.
            </p>

            {/* Light Search & Filter Container */}
            <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-xl shadow-orange-950/5 border border-[#fcd5b5] flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="What puja are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-5 pr-10 py-3 rounded-xl text-sm text-stone-800 outline-none placeholder:text-stone-400 font-medium bg-transparent"
                />
                <svg className="w-5 h-5 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#d95a2b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {dynamicFilterGroups.length > 0 && (
                <button
                  onClick={() => openFilterModal()}
                  className="bg-[#d95a2b] hover:bg-[#c24a1e] text-white px-6 py-3 rounded-xl flex items-center gap-2 text-xs sm:text-sm font-bold shadow-md transition-all shrink-0 active:scale-95 cursor-pointer"
                >
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <span>Filter</span>
                  {hasActiveFilters && (
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1350px] px-4 sm:px-6 lg:px-10 py-10 bg-[#ffffff]">
          <div className="flex items-center justify-between mb-5 sm:mb-6 gap-2">
            <h2 className="text-[19px] min-[360px]:text-[22px] min-[390px]:text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#5c2424] whitespace-nowrap tracking-tight sm:tracking-normal">
              Upcoming Online Pujas
            </h2>
          </div>

          {/* Quick Categories Filter row */}
          {dynamicFilterGroups.length > 0 && (
            <div className="flex overflow-x-auto gap-2.5 pb-4 no-scrollbar mb-6">
              <button
                onClick={clearFilters}
                className={`shrink-0 rounded-full px-5 py-2 text-sm font-bold transition-colors ${!hasActiveFilters ? "bg-[#d95a2b] text-white" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"}`}
              >
                All
              </button>
              {dynamicFilterGroups.map((group: FilterGroup) => (
                <button
                  key={group.label}
                  onClick={() => openFilterModal(group.label)}
                  className={`shrink-0 rounded-full px-5 py-2 text-sm font-bold transition-colors border ${filters[group.label]?.length > 0 ? "bg-[#d95a2b] text-white border-[#d95a2b]" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}
                >
                  {group.label}
                </button>
              ))}
            </div>
          )}

          {/* Filter Modal */}
          {isFilterModalOpen && dynamicFilterGroups.length > 0 && (
            <PujaFilterModal
              filters={filters}
              filterGroups={dynamicFilterGroups}
              initialTab={filterModalInitialTab}
              onClose={() => setIsFilterModalOpen(false)}
              onApply={applyFilters}
              onClear={clearFilters}
            />
          )}

          {/* Grid of Cards */}
          {!fetched ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8 lg:grid-cols-3 w-full mt-12">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="bg-gray-100/80 rounded-[32px] h-[450px] animate-pulse border border-stone-100"></div>
              ))}
            </div>
          ) : displayedPujas.length === 0 ? (
            <div className="mt-16 flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-[#e3d1c2] bg-white py-16 text-center">
              <SparklesIcon className="h-10 w-10 text-[#d95a2b]" />
              <p className="text-lg font-semibold text-[#5c2424]">No pujas found</p>
              <p className="text-sm text-gray-500">Try adjusting your filters to find what you&apos;re looking for.</p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-2 rounded-full bg-[#d95a2b] px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#b0451f] transition"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 lg:gap-8 max-w-[1350px] mx-auto w-full">
              {displayedPujas.map((puja: Puja) => {
                const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}/puja/${puja.slug || slugify(puja.title)}` : '';
                return (
                  <div
                    key={puja._id}
                    onClick={() => router.push(`/puja/${puja.slug || slugify(puja.title)}`)}
                    className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.12),0_2px_6px_-1px_rgba(0,0,0,0.08)] border border-gray-200/90 flex flex-col overflow-hidden group hover:shadow-[0_14px_30px_-6px_rgba(0,0,0,0.18),0_10px_12px_-6px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 relative cursor-pointer"
                  >
                    <div className="flex flex-col flex-1">
                      <div className="relative w-full aspect-[4/3] min-h-[220px] sm:min-h-0 sm:aspect-auto sm:h-[275px] shrink-0 overflow-hidden">
                        <Image
                          src={getPujaImageUrl(puja.imageUrl)}
                          alt={puja.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          unoptimized
                          className="w-full h-full object-cover transition-transform duration-700"
                        />
                        {puja.badge && (
                          <div className="absolute top-4 left-0 bg-[#d92b2b] text-white text-[12px] font-extrabold px-3.5 py-1.5 shadow-md rounded-r-lg uppercase tracking-wider">
                            {puja.badge}
                          </div>
                        )}
                      </div>

                      <div className="p-6 flex flex-col flex-1 text-left">
                        {(puja.shortTitle || puja.subtitle) && (
                          <div className="flex items-center justify-center gap-2 mb-2 w-full text-center">
                            <div className="w-8 h-[1px] bg-accent/40" />
                            <span className="text-accent font-serif font-extrabold text-xs sm:text-[13px] tracking-wider uppercase flex items-center gap-1.5 text-center">
                              <span className="text-[10px]">♦</span> {puja.shortTitle || puja.subtitle} <span className="text-[10px]">♦</span>
                            </span>
                            <div className="w-8 h-[1px] bg-accent/40" />
                          </div>
                        )}


                        <h3 className="text-[20px] sm:text-[21px] font-serif font-extrabold text-gray-900 mb-2 leading-snug line-clamp-2">
                          {puja.title}
                        </h3>

                        <p className="text-gray-600 text-[14px] leading-relaxed line-clamp-2 mb-5 flex-1">
                          {puja.description}
                        </p>

                        <div className="border border-gray-150 rounded-xl p-3.5 space-y-2.5 mb-5 bg-gray-50/70">
                          <div className="flex items-center gap-2.5 text-[13px] font-medium text-gray-700">
                            <svg className="w-5 h-5 text-[#d95a2b] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            <span className="line-clamp-1">{puja.location}</span>
                          </div>
                          <div className="flex items-center gap-2.5 text-[13px] font-medium text-gray-700">
                            <svg className="w-5 h-5 text-[#d95a2b] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <span className="line-clamp-1">{puja.date}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                          <div>
                            {/* Price display */}
                            <div className="text-[20px] sm:text-[22px] font-black text-gray-900">{formatStartingPrice(puja)}</div>
                            <div className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Per Booking</div>
                          </div>
                          <div
                            className="bg-[#14395C] text-white text-[14px] font-bold px-7 py-3 min-w-[130px] justify-center rounded-full hover:bg-[#0f2d4a] transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95"
                          >
                            <span>{puja.buttonText || "Book Now"}</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Floating Actions Overlay */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 z-10" onClick={(e) => e.stopPropagation()}>
                      <WishlistButton itemId={puja._id} />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openShareModal({
                            title: puja.title,
                            description: puja.subtitle || puja.description,
                            location: puja.location || puja.filterLocation || puja.details?.templeLocation,
                            url: fullUrl,
                          });
                        }}
                        className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-600 hover:text-[#d95a2b] transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {displayedPujas.length > 0 && fetched && (
            <div className="mt-12 text-center pb-10">
              <p className="text-[16px] sm:text-[18px] mb-2 font-medium text-gray-600">You&apos;ve reached the end of available pujas</p>
              <p className="text-[14px] text-gray-500">{displayedPujas.length} of {displayedPujas.length} pujas shown</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
