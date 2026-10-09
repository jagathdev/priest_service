"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import WishlistButton from "@/components/common/WishlistButton";

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

const getPujaImageUrl = (imageUrl?: string): string => {
  if (!imageUrl || typeof imageUrl !== "string") return "";
  const trimmed = imageUrl.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:") || trimmed.startsWith("/")) {
    return trimmed;
  }
  return `/${trimmed}`;
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
    const searchMatches = [puja.title, puja.subtitle, puja.description, puja.location, puja.badge]
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

  if (filterGroups.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity duration-300">
      <div className="w-full max-w-[550px] flex flex-col overflow-hidden rounded-[20px] bg-white shadow-2xl max-h-[85dvh] animate-[fadeIn_0.2s_ease-out]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#ebd5c1]">
          <h3 className="text-[22px] font-serif text-[#1f1f1f]">Puja Filters</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden min-h-[400px]">
          {/* Sidebar */}
          <div className="w-[35%] sm:w-1/3 border-r border-[#ebd5c1] overflow-y-auto bg-white">
            {filterGroups.map((group) => {
              const isActive = group.label === activeTab;
              return (
                <button
                  key={group.label}
                  onClick={() => {
                    setActiveTab(group.label);
                    setSearchQuery("");
                  }}
                  className={`w-full text-left px-5 py-4 text-[13px] sm:text-sm font-bold transition-colors relative ${isActive ? 'bg-[#fcf5f3] text-[#009644]' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#009644]"></div>}
                  {group.label}
                </button>
              )
            })}
          </div>

          {/* Content */}
          <div className="w-[65%] sm:w-2/3 p-6 overflow-y-auto relative custom-scrollbar">
            <h4 className="text-[17px] font-bold text-[#9e1c1c] mb-5">{activeGroup.label}</h4>

            {/* Search */}
            <div className="relative mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeGroup.label}`}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-full outline-none text-[13px] sm:text-sm focus:border-[#009644] transition-colors"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>

            {/* Options */}
            <div className="space-y-5">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = (draftFilters[activeGroup.label] || []).includes(option.value);
                  return (
                    <label key={option.value} className="flex items-start gap-3.5 cursor-pointer group">
                      <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => selectFilter(activeGroup.label, option.value)}
                          className="peer w-[18px] h-[18px] appearance-none rounded-[4px] border border-gray-300 checked:bg-white checked:border-[#009644] transition-colors cursor-pointer"
                        />
                        {/* Custom checkmark */}
                        <svg className="absolute w-3 h-3 text-transparent peer-checked:text-[#009644] pointer-events-none transition-colors" viewBox="0 0 14 10" fill="none">
                          <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="text-[13px] sm:text-sm font-bold text-gray-700 group-hover:text-gray-900 leading-snug pt-[1px]">{option.value}</span>
                    </label>
                  )
                })
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No matching options found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-5 border-t border-[#ebd5c1] gap-3 bg-white">
          <button
            onClick={() => { setDraftFilters(defaultFilters); onClear(); }}
            className="w-full sm:flex-1 py-3 border border-gray-300 rounded-full text-sm font-bold text-gray-800 hover:bg-gray-50 transition-colors"
          >
            Clear Filter
          </button>
          <button
            onClick={() => onApply(draftFilters)}
            className="w-full sm:flex-1 py-3 bg-[#00b050] text-white rounded-full text-sm font-bold flex items-center justify-center relative hover:bg-[#009644] transition-colors group"
          >
            <span>Apply Filter</span>
            <div className="absolute right-2 w-[28px] h-[28px] rounded-full bg-white text-[#00b050] flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </div>
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
          <button onClick={() => handleShare("whatsapp")} className="flex flex-col items-center justify-center py-5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
            <i className="fa-brands fa-whatsapp text-3xl text-[#25D366] mb-2"></i>
            <span className="text-sm font-semibold text-gray-700">WhatsApp</span>
          </button>

          <button onClick={() => handleShare("instagram")} className="flex flex-col items-center justify-center py-5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
            <i className="fa-brands fa-instagram text-3xl mb-2" style={{ background: '-webkit-linear-gradient(#f09433, #e6683c, #dc2743, #cc2366, #bc1888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}></i>
            <span className="text-sm font-semibold text-gray-700">Instagram</span>
          </button>

          <button onClick={() => handleShare("facebook")} className="flex flex-col items-center justify-center py-5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
            <i className="fa-brands fa-facebook text-3xl text-[#1877F2] mb-2"></i>
            <span className="text-sm font-semibold text-gray-700">Facebook</span>
          </button>

          <button onClick={() => handleShare("twitter")} className="flex flex-col items-center justify-center py-5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white mb-2">
              <i className="fa-brands fa-x-twitter text-lg"></i>
            </div>
            <span className="text-sm font-semibold text-gray-700">Twitter</span>
          </button>

          <button onClick={() => handleShare("telegram")} className="flex flex-col items-center justify-center py-5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
            <i className="fa-brands fa-telegram text-3xl text-[#0088cc] mb-2"></i>
            <span className="text-sm font-semibold text-gray-700">Telegram</span>
          </button>

          <button onClick={copyLink} className="flex flex-col items-center justify-center py-5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 mb-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            </div>
            <span className="text-sm font-semibold text-gray-700">Copy Link</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ----------------------------------------------------------------
export default function PujaClient({ initialPujas }: { initialPujas?: Puja[] }) {
  const [allPujas, setAllPujas] = useState<Puja[]>(initialPujas || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fetched, setFetched] = useState(true);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterModalInitialTab, setFilterModalInitialTab] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const router = useRouter();

  const openFilterModal = (tabLabel?: string) => {
    setFilterModalInitialTab(tabLabel || "");
    setIsFilterModalOpen(true);
  };

  const openShareModal = (url: string) => {
    setShareUrl(url);
    setShareModalOpen(true);
  };

  // Limit carousel to first 5 pujas
  const carouselPujas = allPujas.slice(0, 5);

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

  // Compute dynamic filter groups ONLY from values actually present in saved pujas
  const dynamicFilterGroups = useMemo(() => {
    const extractValues = (key: keyof Puja, altKey?: keyof Puja) => {
      const set = new Set<string>();
      allPujas.forEach((p) => {
        const val1 = p[key];
        if (typeof val1 === "string" && val1.trim()) {
          set.add(val1.trim());
        }
        if (altKey) {
          const val2 = p[altKey];
          if (typeof val2 === "string" && val2.trim()) {
            set.add(val2.trim());
          }
        }
      });
      return Array.from(set).sort();
    };

    const deities = extractValues("deity");
    const tithis = extractValues("tithis");
    const doshas = extractValues("dosha");
    const benefits = extractValues("benefit");
    const locations = extractValues("filterLocation", "location");

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
        label: "Benefits",
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
        pujaUrl={shareUrl}
      />
      <main className="min-h-screen">
        {/* Hero Section - Light Sacred Sandalwood Theme */}
        <div className="bg-gradient-to-b from-[#fff6ef] via-[#fdeee0] to-[#f9e3d0] py-12 md:py-16 text-center border-b border-[#fcd5b5] relative overflow-hidden">
          {/* Left Inverted Mandala Decoration */}
          <div className="absolute left-0 top-0 bottom-0 h-full pointer-events-none opacity-50 z-0 hidden sm:flex items-center">
            <img
              src="/images/mandala.png"
              alt="Mandala Left"
              className="h-full w-auto object-contain -scale-x-100"
              style={{ transform: "scaleX(-1)" }}
            />
          </div>

          {/* Right Mandala Decoration */}
          <div className="absolute right-0 top-0 bottom-0 h-full pointer-events-none opacity-50 z-0 hidden sm:flex items-center">
            <img
              src="/images/mandala.png"
              alt="Mandala Right"
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-4xl font-serif font-bold text-[#5c2424]">Upcoming Online Pujas</h2>
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
              <p className="text-sm text-gray-500">Try adjusting your filters to find what you're looking for.</p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-2 rounded-full bg-[#d95a2b] px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#b0451f] transition"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8 lg:grid-cols-3">
              {displayedPujas.map((puja: Puja) => {
                const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}/puja/${puja.slug || slugify(puja.title)}` : '';
                return (
                  <div
                    key={puja._id}
                    onClick={() => router.push(`/puja/${puja.slug || slugify(puja.title)}`)}
                    className="bg-white rounded-2xl shadow-md border border-gray-200 flex flex-col overflow-hidden group hover:shadow-2xl hover:shadow-stone-900/15 hover:-translate-y-1.5 transition-all duration-300 relative cursor-pointer"
                  >
                    <div className="flex flex-col flex-1 block">
                      <div className="relative h-[260px] sm:h-[275px] w-full shrink-0 overflow-hidden">
                        <img
                          src={getPujaImageUrl(puja.imageUrl)}
                          alt={puja.title}
                          className="w-full h-full object-cover transition-transform duration-700"
                        />
                        {puja.badge && (
                          <div className="absolute top-4 left-0 bg-[#d92b2b] text-white text-[12px] font-extrabold px-3.5 py-1.5 shadow-md rounded-r-lg uppercase tracking-wider">
                            {puja.badge}
                          </div>
                        )}
                      </div>

                      <div className="p-6 flex flex-col flex-1 text-left">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-[1px] bg-[#F47820]/40" />
                          <span className="text-[#F47820] font-serif font-extrabold text-xs sm:text-[13px] tracking-wider uppercase flex items-center gap-1.5">
                            <span className="text-[10px]">♦</span> {puja.subtitle} <span className="text-[10px]">♦</span>
                          </span>
                          <div className="w-8 h-[1px] bg-[#F47820]/40" />
                        </div>


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
                            <div className="text-[20px] sm:text-[22px] font-black text-gray-900">₹{(puja as any).packages?.[0]?.priceINR || (puja as any).packages?.[0]?.price || '516'}</div>
                            <div className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Per Booking</div>
                          </div>
                          <div
                            className="bg-[#009e5b] text-white text-[14px] font-bold px-7 py-3 min-w-[130px] justify-center rounded-full hover:bg-[#008c51] transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95"
                          >
                            <span>Book Now</span>
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
                          openShareModal(fullUrl);
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
              <p className="text-[16px] sm:text-[18px] mb-2 font-medium text-gray-600">You've reached the end of available pujas</p>
              <p className="text-[14px] text-gray-500">{displayedPujas.length} of {displayedPujas.length} pujas shown</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
