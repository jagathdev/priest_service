"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Search,
  SlidersHorizontal,
  Check,
  Calendar,
  MapPin,
  ChevronRight,
  Share2,
} from "lucide-react";
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

export default function HomaClient({ initialHomas }: { initialHomas?: Homa[] }) {
  const allHomas = useMemo(() => initialHomas || [], [initialHomas]);
  const fetched = true; // Since it's SSR, data is always already fetched when the component mounts
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
    const map = new Map<string, string>();
    allHomas.forEach((h) => {
      if (h.deity && h.deity.trim()) {
        const trimmed = h.deity.trim();
        const lower = trimmed.toLowerCase();
        if (!map.has(lower)) {
          map.set(lower, trimmed);
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  }, [allHomas]);

  const doshaOptions = useMemo(() => {
    const map = new Map<string, string>();
    allHomas.forEach((h) => {
      if (h.dosha && h.dosha.trim()) {
        const trimmed = h.dosha.trim();
        const lower = trimmed.toLowerCase();
        if (!map.has(lower)) {
          map.set(lower, trimmed);
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  }, [allHomas]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#fafafc] pb-16 font-sans">
        {/* ── Top Header Hero Banner ── */}
        <section className="bg-gradient-to-b from-[#fff7f8] via-[#ffffff] to-[#fafafc] pt-12 pb-10 text-center border-b border-gray-150 relative overflow-hidden">
          {/* Left Inverted Mandala Decoration */}
          <div className="absolute left-0 top-0 bottom-0 h-full pointer-events-none opacity-40 z-0 hidden min-[769px]:flex items-center">
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
          <div className="absolute right-0 top-0 bottom-0 h-full pointer-events-none opacity-40 z-0 hidden min-[769px]:flex items-center">
            <Image
              src="/images/mandala.png"
              alt="Mandala Right"
              width={200}
              height={200}
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
                <Search className="w-5 h-5 text-gray-400 shrink-0 mr-1" />
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
                  <SlidersHorizontal className="w-4 h-4 text-gray-600" />
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
                              ? "bg-[#F1F5F9] text-primary font-bold"
                              : "text-gray-700 hover:bg-gray-50"
                              }`}
                          >
                            <span className="flex items-center gap-2">
                              {isSelected && (
                                <Check className="w-4 h-4 text-primary" strokeWidth={3} />
                              )}
                              <span>{item.label}</span>
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${isSelected ? "bg-primary/10 text-primary font-bold" : "text-gray-400 font-mono"}`}>
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
                              className="w-4 h-4 rounded text-primary focus:ring-success border-gray-300"
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
                              className="w-4 h-4 rounded text-primary focus:ring-success border-gray-300"
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
                    className="mt-4 px-6 py-2.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-[#058a51] transition"
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
                        className="bg-white rounded-2xl border border-gray-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.12),0_2px_6px_-1px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.18),0_8px_10px_-6px_rgba(0,0,0,0.1)] transition-all duration-300 overflow-hidden flex flex-col group relative cursor-pointer"
                      >
                        <div className="flex flex-col flex-1">
                          {/* ── Top Image Container ── */}
                          <div className="relative h-[210px] w-full overflow-hidden bg-gray-100 shrink-0">
                            <Image
                              src={getHomaImageUrl(homa.imageUrl)}
                              alt={homa.title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              unoptimized
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />

                            {/* Top Left Maroon Badge Pill */}
                            <div className="absolute top-3 left-3 bg-danger text-white text-[11px] font-extrabold px-3.5 py-1.5 rounded-full shadow-md z-10 backdrop-blur-xs max-w-[80%] truncate">
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
                              <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                              <span className="font-medium truncate">{homa.date}</span>
                            </div>

                            {/* Info Box 2: Temple Location */}
                            <div className="bg-[#f8f9fa] border border-gray-100 rounded-xl px-3.5 py-2.5 mb-4 flex items-center gap-3 text-xs text-gray-700">
                              <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                              <span className="font-medium truncate">{homa.location}</span>
                            </div>

                            {/* ── Card Footer ── */}
                            <div className="mt-auto pt-3.5 border-t border-gray-100 flex items-center justify-between bg-white">
                              <div>
                                <span className="text-xl font-extrabold text-gray-900">₹{priceVal}</span>
                                <span className="text-[11px] text-gray-400 font-medium block -mt-1">Per Booking</span>
                              </div>

                              <div
                                className="bg-primary hover:bg-[#0f2d4a] text-white text-xs font-black px-4.5 py-2.5 rounded-full transition-all shadow-xs flex items-center gap-2 group-hover:shadow-md"
                              >
                                <span>{homa.buttonText || "BOOK NOW"}</span>
                                <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                                  <ChevronRight className="w-2.5 h-2.5 text-white" strokeWidth={3} />
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
                            <Share2 className="w-4 h-4" />
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
                    You&apos;ve reached the end of available services ({displayedHomas.length} of {allHomas.length} Homas)
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
                <Share2 className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center text-white hover:opacity-90 transition">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white hover:opacity-90 transition">
                <Share2 className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[#ff0000] flex items-center justify-center text-white hover:opacity-90 transition">
                <Share2 className="w-4 h-4" />
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
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <ArrowRight className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
              </Link>
            </div>

            {/* Trust Features Row */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-300 font-medium">
              <span className="flex items-center gap-1.5"><span className="text-primary font-bold text-sm">✓</span> 100% Secure</span>
              <span className="flex items-center gap-1.5"><span className="text-primary font-bold text-sm">✓</span> Video Recording Sent</span>
              <span className="flex items-center gap-1.5"><span className="text-primary font-bold text-sm">✓</span> Vedic Priests</span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
