"use client";

import React, { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Footer from "@/components/layout/Footer";
import WishlistButton from "@/components/common/WishlistButton";

interface Homa {
  _id: string;
  title: string;
  subtitle?: string;
  shortTitle?: string;
  description?: string;
  imageUrl: string;
  badge?: string;
  buttonText?: string;
  location?: string;
  date?: string;
  slug?: string;
  deity?: string;
  dosha?: string;
  homaType?: string;
  price?: number;
  packages?: { price?: number }[];
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const getHomaImageUrl = (imageUrl?: string): string => {
  if (!imageUrl || typeof imageUrl !== "string") return "";
  const trimmed = imageUrl.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:") || trimmed.startsWith("/")) {
    return trimmed;
  }
  return `/${trimmed}`;
};

export default function HomaClient({ initialHomas }: { initialHomas?: Homa[] }) {
  const [allHomas, setAllHomas] = useState<Homa[]>(initialHomas || []);
  const [fetched, setFetched] = useState(true); // Since it's SSR, data is always already fetched when the component mounts
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All Homas");
  const [selectedDeities, setSelectedDeities] = useState<string[]>([]);
  const [selectedDoshas, setSelectedDoshas] = useState<string[]>([]);
  const router = useRouter();

  const toggleDeity = (deity: string) => {
    setSelectedDeities((prev) =>
      prev.includes(deity) ? prev.filter((d) => d !== deity) : [...prev, deity]
    );
  };

  const toggleDosha = (dosha: string) => {
    setSelectedDoshas((prev) =>
      prev.includes(dosha) ? prev.filter((d) => d !== dosha) : [...prev, dosha]
    );
  };

  // Filter homas
  const displayedHomas = useMemo(() => {
    return allHomas.filter((homa) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const textMatch =
          homa.title.toLowerCase().includes(q) ||
          (homa.description && homa.description.toLowerCase().includes(q)) ||
          (homa.location && homa.location.toLowerCase().includes(q)) ||
          (homa.subtitle && homa.subtitle.toLowerCase().includes(q));
        if (!textMatch) return false;
      }

      // Type filter
      if (selectedType !== "All Homas") {
        if (homa.homaType && homa.homaType !== selectedType) {
          const keyword = selectedType.toLowerCase().replace(" homa", "");
          const matchesKeyword = homa.title.toLowerCase().includes(keyword);
          if (!matchesKeyword) return false;
        }
      }

      // Deity filter
      if (selectedDeities.length > 0) {
        const matchedDeity = selectedDeities.some(
          (d) => homa.deity && homa.deity.trim().toLowerCase() === d.trim().toLowerCase()
        );
        if (!matchedDeity) return false;
      }

      // Dosha filter
      if (selectedDoshas.length > 0) {
        const matchedDosha = selectedDoshas.some(
          (d) => homa.dosha && homa.dosha.trim().toLowerCase() === d.trim().toLowerCase()
        );
        if (!matchedDosha) return false;
      }

      return true;
    });
  }, [allHomas, searchQuery, selectedType, selectedDeities, selectedDoshas]);

  const dynamicHomaTypes = useMemo(() => {
    const set = new Set<string>();
    allHomas.forEach((h) => {
      if (h.homaType && h.homaType.trim()) set.add(h.homaType.trim());
    });
    return Array.from(set).sort();
  }, [allHomas]);

  const homaTypeOptions = useMemo(() => {
    const list = [{ label: "All Homas", count: allHomas.length }];
    dynamicHomaTypes.forEach((t) => {
      list.push({
        label: t,
        count: allHomas.filter((h) => h.homaType === t).length,
      });
    });
    return list;
  }, [allHomas, dynamicHomaTypes]);

  const deityOptions = useMemo(() => {
    const set = new Set<string>();
    allHomas.forEach((h) => {
      if (h.deity && h.deity.trim()) set.add(h.deity.trim());
    });
    return Array.from(set).sort();
  }, [allHomas]);

  const doshaOptions = useMemo(() => {
    const set = new Set<string>();
    allHomas.forEach((h) => {
      if (h.dosha && h.dosha.trim()) set.add(h.dosha.trim());
    });
    return Array.from(set).sort();
  }, [allHomas]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#fafafc] pb-16 font-sans">
        {/* ── Top Header Hero Banner ── */}
        <section className="bg-gradient-to-b from-[#fff7f8] via-[#ffffff] to-[#fafafc] pt-12 pb-10 text-center border-b border-gray-150 relative overflow-hidden">
          {/* Left Inverted Mandala Decoration */}
          <div className="absolute left-0 top-0 bottom-0 h-full pointer-events-none opacity-40 z-0 hidden sm:flex items-center">
            <img
              src="/images/mandala.png"
              alt="Mandala Left"
              className="h-full w-auto object-contain -scale-x-100"
              style={{ transform: "scaleX(-1)" }}
            />
          </div>

          {/* Right Mandala Decoration */}
          <div className="absolute right-0 top-0 bottom-0 h-full pointer-events-none opacity-40 z-0 hidden sm:flex items-center">
            <img
              src="/images/mandala.png"
              alt="Mandala Right"
              className="h-full w-auto object-contain"
            />
          </div>

          <div className="mx-auto max-w-4xl px-4 relative z-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#5b1422] tracking-tight leading-tight font-serif">
              Discover Sacred Pujas &amp; Divine Blessings
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
              Receive continued divine blessings through temple offerings performed with your Name, Gotram and Nakshatram.
            </p>

            {/* Large Search & Filter Input Bar */}
            <div className="mt-8 max-w-2xl mx-auto relative">
              <div className="flex items-center bg-white rounded-full border border-gray-250 shadow-sm px-5 py-3 hover:border-gray-400 transition-all">
                <svg className="w-5 h-5 text-gray-400 shrink-0 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What homa are you looking for?"
                  className="w-full bg-transparent border-none text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-0 px-2 font-medium"
                />
                <button
                  type="button"
                  aria-label="Filter options"
                  className="p-1.5 rounded-full hover:bg-gray-100 transition text-gray-600 shrink-0 border-l border-gray-200 pl-3"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Main Layout: Left Sidebar + Right Card Grid ── */}
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 pt-10">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* ── Left Sidebar Filter Card ── */}
            {(homaTypeOptions.length > 1 || deityOptions.length > 0 || doshaOptions.length > 0) && (
              <aside className="w-full lg:w-[270px] shrink-0 bg-white rounded-2xl border border-gray-200 shadow-xs p-5 space-y-6">
                {/* Section 1: Homa Type */}
                {homaTypeOptions.length > 1 && (
                  <div>
                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Homa type</h3>
                    <div className="space-y-1">
                      {homaTypeOptions.map((item) => {
                        const isSelected = selectedType === item.label;
                        return (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => setSelectedType(item.label)}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${isSelected
                              ? "bg-[#e8f5e9] text-[#069e5d] font-bold"
                              : "text-gray-700 hover:bg-gray-50"
                              }`}
                          >
                            <span className="flex items-center gap-2">
                              {isSelected && (
                                <svg className="w-4 h-4 text-[#069e5d]" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                              <span>{item.label}</span>
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${isSelected ? "bg-[#069e5d]/10 text-[#069e5d] font-bold" : "text-gray-400 font-mono"}`}>
                              {item.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {homaTypeOptions.length > 1 && (deityOptions.length > 0 || doshaOptions.length > 0) && <hr className="border-gray-100" />}

                {/* Section 2: Deity */}
                {deityOptions.length > 0 && (
                  <div>
                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Deity</h3>
                    <div className="space-y-2.5">
                      {deityOptions.map((deity) => {
                        const isChecked = selectedDeities.includes(deity);
                        return (
                          <label key={deity} className="flex items-center gap-3 text-xs sm:text-sm text-gray-700 font-medium cursor-pointer hover:text-gray-900 select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleDeity(deity)}
                              className="w-4 h-4 rounded text-[#069e5d] focus:ring-[#069e5d] border-gray-300"
                            />
                            <span>{deity}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {deityOptions.length > 0 && doshaOptions.length > 0 && <hr className="border-gray-100" />}

                {/* Section 3: Dosha */}
                {doshaOptions.length > 0 && (
                  <div>
                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Dosha</h3>
                    <div className="space-y-2.5">
                      {doshaOptions.map((dosha) => {
                        const isChecked = selectedDoshas.includes(dosha);
                        return (
                          <label key={dosha} className="flex items-center gap-3 text-xs sm:text-sm text-gray-700 font-medium cursor-pointer hover:text-gray-900 select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleDosha(dosha)}
                              className="w-4 h-4 rounded text-[#069e5d] focus:ring-[#069e5d] border-gray-300"
                            />
                            <span>{dosha}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {(selectedDeities.length > 0 || selectedDoshas.length > 0 || selectedType !== "All Homas" || searchQuery) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedType("All Homas");
                      setSelectedDeities([]);
                      setSelectedDoshas([]);
                    setSearchQuery("");
                  }}
                  className="w-full py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition border border-red-100 mt-2"
                >
                  Clear All Filters
                </button>
              )}
              </aside>
            )}

            {/* ── Right Content Area ── */}
            <div className="flex-1 w-full">
              {/* Title Header Bar */}
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-150">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                    {selectedType === "All Homas" ? "All Homas" : selectedType}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1 font-medium">
                    Daily, Weekly and Monthly Homas for peace, prosperity and divine blessings.
                  </p>
                </div>
                <span className="text-xs font-semibold text-gray-400 font-mono">
                  {displayedHomas.length} {displayedHomas.length === 1 ? "Homa" : "Homas"}
                </span>
              </div>

              {/* Homa Cards Grid (3 Columns) */}
              {!fetched ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={`skeleton-${i}`} className="bg-gray-100/80 rounded-[32px] h-[450px] animate-pulse border border-stone-100"></div>
                  ))}
                </div>
              ) : displayedHomas.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-250 p-12 text-center shadow-xs">
                  <p className="text-base font-bold text-gray-700">No homas found matching your filters</p>
                  <p className="text-xs text-gray-400 mt-1">Try searching with another deity, dosha or clear filters.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedType("All Homas");
                      setSelectedDeities([]);
                      setSelectedDoshas([]);
                      setSearchQuery("");
                    }}
                    className="mt-4 px-6 py-2.5 rounded-full bg-[#069e5d] text-white text-xs font-bold hover:bg-[#058a51] transition"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {displayedHomas.map((homa) => {
                    const priceVal = homa.price || homa.packages?.[0]?.price || 516;

                    return (
                      <div
                        key={homa._id}
                        onClick={() => router.push(`/homa/${homa.slug || slugify(homa.title)}`)}
                        className="bg-white rounded-2xl border border-gray-200 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group relative cursor-pointer"
                      >
                        <div className="flex flex-col flex-1 block">
                          {/* ── Top Image Container ── */}
                          <div className="relative h-[210px] w-full overflow-hidden bg-gray-100 shrink-0">
                            <img
                              src={getHomaImageUrl(homa.imageUrl)}
                              alt={homa.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />

                            {/* Top Left Maroon Badge Pill */}
                            <div className="absolute top-3 left-3 bg-[#701a28] text-white text-[11px] font-extrabold px-3.5 py-1.5 rounded-full shadow-md z-10 backdrop-blur-xs max-w-[80%] truncate">
                              {homa.badge || homa.subtitle}
                            </div>
                          </div>

                          {/* ── Maroon Decorative Subtitle Line Below Image ── */}
                          <div className="pt-3 px-4 text-center">
                            <p className="text-[10px] font-bold text-[#800000] uppercase tracking-widest flex items-center justify-center gap-1.5">
                              <span className="w-3.5 h-px bg-[#800000]/40 inline-block"></span>
                              <span className="truncate">{homa.subtitle || homa.shortTitle}</span>
                              <span className="w-3.5 h-px bg-[#800000]/40 inline-block"></span>
                            </p>
                          </div>

                          {/* ── Card Content Body ── */}
                          <div className="p-4 flex flex-col flex-1">
                            <h3 className="text-[16px] font-bold text-gray-900 leading-snug line-clamp-2 min-h-[46px]">
                              {homa.title}
                            </h3>

                            <p className="text-xs text-gray-500 line-clamp-2 mt-1.5 mb-4 leading-relaxed min-h-[36px]">
                              {homa.description}
                            </p>

                            {/* Info Box 1: Date & Frequency */}
                            <div className="bg-[#f8f9fa] border border-gray-100 rounded-xl px-3.5 py-2.5 mb-2 flex items-center gap-3 text-xs text-gray-700">
                              <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="font-medium truncate">{homa.date}</span>
                            </div>

                            {/* Info Box 2: Temple Location */}
                            <div className="bg-[#f8f9fa] border border-gray-100 rounded-xl px-3.5 py-2.5 mb-4 flex items-center gap-3 text-xs text-gray-700">
                              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="font-medium truncate">{homa.location}</span>
                            </div>

                            {/* ── Card Footer ── */}
                            <div className="mt-auto pt-3.5 border-t border-gray-100 flex items-center justify-between bg-white">
                              <div>
                                <span className="text-xl font-extrabold text-gray-900">₹{priceVal}</span>
                                <span className="text-[11px] text-gray-400 font-medium block -mt-1">Per Booking</span>
                              </div>

                              <div
                                className="bg-[#069e5d] hover:bg-[#058a51] text-white text-xs font-black px-4.5 py-2.5 rounded-full transition-all shadow-xs flex items-center gap-2 group-hover:shadow-md"
                              >
                                <span>BOOK NOW</span>
                                <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Top Right Action Buttons (Heart & Share) */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10" onClick={(e) => e.stopPropagation()}>
                          <WishlistButton itemId={homa._id} />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (navigator.share) {
                                navigator.share({ title: homa.title, url: window.location.href });
                              }
                            }}
                            aria-label="Share homa"
                            className="w-8 h-8 rounded-full bg-white/95 hover:bg-white text-gray-700 hover:text-blue-500 flex items-center justify-center shadow-sm transition"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-5.367 3 3 0 000 5.367zm0 8.005a3 3 0 100-5.367 3 3 0 000 5.367z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* End of results notice */}
              {fetched && displayedHomas.length > 0 && (
                <div className="mt-12 text-center py-6 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-400">
                    You've reached the end of available services ({displayedHomas.length} of {allHomas.length} Homas)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Bottom Dark Banner (Exact Match from Reference Image) ── */}
        <section className="mt-16 bg-gradient-to-r from-[#20050b] via-[#3b0914] to-[#1a0308] text-white py-14 px-4 text-center">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-bold font-serif leading-tight">
              A Sacred Path to Divine Blessings Book Your Sacred Homa
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-300 font-medium">
              Connect with divine blessings through authentic Vedic rituals.
            </p>

            {/* Social Follow Buttons */}
            <div className="mt-5 flex items-center justify-center gap-3">
              <span className="text-sm font-semibold text-gray-300 mr-1">Follow us -</span>
              <a href="#" className="w-8 h-8 rounded-full bg-[#1877f2] flex items-center justify-center text-white hover:opacity-90 transition">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center text-white hover:opacity-90 transition">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white hover:opacity-90 transition">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[#ff0000] flex items-center justify-center text-white hover:opacity-90 transition">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
              </a>
            </div>

            {/* Find the Right Homa CTA Button */}
            <div className="mt-6">
              <Link
                href="#top"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#5b1422] text-xs sm:text-sm font-extrabold hover:bg-gray-100 transition shadow-lg"
              >
                <span>Find the Right Homa</span>
                <div className="w-5 h-5 rounded-full bg-[#069e5d] flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </Link>
            </div>

            {/* Trust Features Row */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-300 font-medium">
              <span className="flex items-center gap-1.5"><span className="text-[#069e5d] font-bold text-sm">✓</span> 100% Secure</span>
              <span className="flex items-center gap-1.5"><span className="text-[#069e5d] font-bold text-sm">✓</span> Video Recording Sent</span>
              <span className="flex items-center gap-1.5"><span className="text-[#069e5d] font-bold text-sm">✓</span> Vedic Priests</span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
