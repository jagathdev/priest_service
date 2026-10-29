"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import WishlistButton from "@/components/common/WishlistButton";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Loader2,
  ZoomIn,
  MapPin,
  Calendar,
  Share2,
  Clock,
} from "lucide-react";

import HeroSection, { get1024BannerImage } from "@/components/home/HeroSection";
import PujaFilterModal, {
  FilterState,
  defaultFilters,
  extractDynamicFilterGroups,
  matchesPujaFilters,
} from "@/components/common/PujaFilterModal";
import ShareModal, { ShareData } from "@/components/common/ShareModal";
import GalleryLightboxModal from "@/components/common/GalleryLightboxModal";
import { formatStartingPrice } from "@/lib/pricing";
import priestservicesLogo from "../../../public/images/priest-services-logo.png";

const getSafeImageUrl = (imageUrl?: string): string => {
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

export default function DashboardClient({
  initialHeroBanners,
  initialPujas,
  initialHomas,
}: {
  initialHeroBanners?: any[];
  initialPujas?: any[];
  initialHomas?: any[];
}) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [allPujas, setAllPujas] = useState<any[]>(initialPujas || []);
  const [allHomas, setAllHomas] = useState<any[]>(initialHomas || []);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterModalInitialTab, setFilterModalInitialTab] = useState("");
  const [fetchedPujas, setFetchedPujas] = useState(Boolean(initialPujas && initialPujas.length > 0));
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState<ShareData>({});
  const [galleryLightboxOpen, setGalleryLightboxOpen] = useState(false);
  const [galleryLightboxIdx, setGalleryLightboxIdx] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Puja Gallery Draggable / Nav Scroll
  const galleryScrollRef = useRef<HTMLDivElement | null>(null);
  const [isGalleryDragging, setIsGalleryDragging] = useState(false);
  const galleryStartXRef = useRef<number>(0);
  const galleryScrollLeftRef = useRef<number>(0);
  const galleryMovedRef = useRef<boolean>(false);

  // Always forward auto-scroll animation loop (NEVER STOPS - runs continuously forward)
  useEffect(() => {
    let animId: number;
    const speed = 0.9; // Smooth forward scroll speed in pixels per frame

    const step = () => {
      const container = galleryScrollRef.current;
      if (container) {
        container.scrollLeft += speed;
        // Keep baseline drag reference in sync so dragging doesn't jump
        if (galleryScrollLeftRef.current !== undefined) {
          galleryScrollLeftRef.current += speed;
        }

        const maxScroll = container.scrollWidth - container.clientWidth;
        if (maxScroll > 0 && container.scrollLeft >= maxScroll / 2) {
          container.scrollLeft -= maxScroll / 2;
          if (galleryScrollLeftRef.current !== undefined) {
            galleryScrollLeftRef.current -= maxScroll / 2;
          }
        }
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleGalleryMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!galleryScrollRef.current) return;
    setIsGalleryDragging(true);
    galleryMovedRef.current = false;
    galleryStartXRef.current = e.pageX;
    galleryScrollLeftRef.current = galleryScrollRef.current.scrollLeft;
  };

  const handleGalleryMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isGalleryDragging || !galleryScrollRef.current) return;
    e.preventDefault();
    const diff = (e.pageX - galleryStartXRef.current) * 1.5;
    if (Math.abs(diff) > 5) {
      galleryMovedRef.current = true;
    }
    const container = galleryScrollRef.current;
    container.scrollLeft = galleryScrollLeftRef.current - diff;
    galleryStartXRef.current = e.pageX;
    galleryScrollLeftRef.current = container.scrollLeft;

    const maxScroll = container.scrollWidth - container.clientWidth;
    if (maxScroll > 0) {
      if (container.scrollLeft <= 0) {
        container.scrollLeft += maxScroll / 2;
        galleryScrollLeftRef.current += maxScroll / 2;
      } else if (container.scrollLeft >= maxScroll) {
        container.scrollLeft -= maxScroll / 2;
        galleryScrollLeftRef.current -= maxScroll / 2;
      }
    }
  };

  const handleGalleryMouseUpOrLeave = () => {
    setIsGalleryDragging(false);
  };

  const scrollGallery = (direction: "left" | "right") => {
    if (!galleryScrollRef.current) return;
    const scrollAmount = 350;
    galleryScrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    async function fetchData() {
      const expressBase = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";

      if (!initialPujas || initialPujas.length === 0) {
        try {
          const res = await fetch(`${expressBase}/api/pujas`);
          if (res.ok) {
            const data = await res.json();
            const rawList = data?.data && Array.isArray(data.data)
              ? data.data
              : Array.isArray(data)
                ? data
                : [];
            const activeList = rawList.filter((item: any) => !item.status || item.status === "active");
            setAllPujas(activeList);
          }
        } catch (err) {
          console.error("Failed to fetch pujas on client:", err);
        } finally {
          setFetchedPujas(true);
        }
      }

      if (!initialHomas || initialHomas.length === 0) {
        try {
          const res = await fetch(`${expressBase}/api/homas`);
          if (res.ok) {
            const data = await res.json();
            const rawList = data?.data && Array.isArray(data.data)
              ? data.data
              : Array.isArray(data)
                ? data
                : [];
            const activeList = rawList.filter((item: any) => !item.status || item.status === "active");
            setAllHomas(activeList);
          }
        } catch (err) {
          console.error("Failed to fetch homas on client:", err);
        }
      }
    }
    fetchData();
  }, [initialPujas, initialHomas]);

  // Compute dynamic filter groups for home page
  const dynamicFilterGroups = React.useMemo(() => {
    return extractDynamicFilterGroups(allPujas);
  }, [allPujas]);

  const hasActiveFilters = Object.values(filters).some((arr) => arr && arr.length > 0);

  const openFilterModal = (tabLabel?: string) => {
    setFilterModalInitialTab(tabLabel || "");
    setIsFilterModalOpen(true);
  };

  const clearFilters = () => setFilters(defaultFilters);
  const applyFilters = (nextFilters: FilterState) => {
    setFilters(nextFilters);
    setIsFilterModalOpen(false);
  };

  // Filter pujas based on selected modal filters
  const filteredPujas = React.useMemo(() => {
    if (!hasActiveFilters) {
      return allPujas.slice(0, 6);
    }
    return allPujas
      .filter((p) => matchesPujaFilters(p, filters, "", dynamicFilterGroups))
      .slice(0, 6);
  }, [allPujas, filters, hasActiveFilters, dynamicFilterGroups]);

  // Dynamically extract gallery images uploaded to any Puja or Homa
  const dynamicGalleryImages = React.useMemo(() => {
    const list: { src: string; alt: string; aspect: string }[] = [];
    const seenUrls = new Set<string>();

    const aspectPresets = [
      "w-[190px] sm:w-[220px] md:w-[250px] h-[300px] sm:h-[350px] md:h-[380px]", // Tall portrait
      "w-[240px] sm:w-[280px] md:w-[320px] h-[210px] sm:h-[240px] md:h-[260px]", // Wide landscape
      "w-[200px] sm:w-[230px] md:w-[260px] h-[340px] sm:h-[390px] md:h-[420px]", // Very tall portrait
      "w-[250px] sm:w-[290px] md:w-[330px] h-[190px] sm:h-[220px] md:h-[240px]", // Landscape
      "w-[230px] sm:w-[270px] md:w-[300px] h-[240px] sm:h-[280px] md:h-[300px]", // Medium balanced
    ];

    const addImage = (rawUrl: any, title: string) => {
      if (!rawUrl) return;
      if (typeof rawUrl === "string") {
        const parts = rawUrl.split(/[\n,]+/);
        for (const p of parts) {
          const trimmed = p.trim();
          if (trimmed) {
            const formatted = getSafeImageUrl(trimmed);
            if (formatted && !seenUrls.has(formatted)) {
              seenUrls.add(formatted);
              const aspect = aspectPresets[list.length % aspectPresets.length];
              list.push({ src: formatted, alt: title || "Sacred Ritual", aspect });
            }
          }
        }
      } else if (Array.isArray(rawUrl)) {
        for (const item of rawUrl) {
          addImage(item, title);
        }
      }
    };

    // 1. Gather all gallery images from Pujas
    for (const p of allPujas) {
      addImage(p.gallery, p.title);
      addImage(p.galleryUrl, p.title);
      if (p.details?.gallery) addImage(p.details.gallery, p.title);
    }

    // 2. Gather all gallery images from Homas
    for (const h of allHomas) {
      addImage(h.gallery, h.title);
      addImage(h.galleryUrl, h.title);
      if (h.details?.gallery) addImage(h.details.gallery, h.title);
    }

    // 3. Fallback to default galleryImages if no dynamic images uploaded yet
    if (list.length === 0) {
      return defaultGalleryImages;
    }

    // If dynamic images are fewer than 6, supplement with defaults so marquee looks lush
    if (list.length < 6) {
      for (const defImg of defaultGalleryImages) {
        if (!seenUrls.has(defImg.src)) {
          seenUrls.add(defImg.src);
          list.push(defImg);
        }
      }
    }

    return list.filter((item) => !failedImages[item.src]);
  }, [allPujas, allHomas, failedImages]);

  return (
    <main className="min-h-screen bg-white text-ink font-sans">
      <Navbar />

      {/* ── 1. Hero Section ── */}
      <HeroSection initialBanners={initialHeroBanners} />

      {/* ── 2. Steps Section ── "Your Journey to Divine Blessings" ── */}
      <section className="py-12 sm:py-16 md:py-20 bg-[#fdfbf7] border-y border-[#f0e4d0] relative overflow-hidden">
        {/* Background Mandala Watermarks */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035] bg-center bg-no-repeat bg-contain z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'%3E%3Ccircle cx='250' cy='250' r='240' fill='none' stroke='%3C%238b1e10' stroke-width='1.5'/%3E%3Ccircle cx='250' cy='250' r='200' fill='none' stroke='%3C%238b1e10' stroke-width='1' stroke-dasharray='4 4'/%3E%3Ccircle cx='250' cy='250' r='160' fill='none' stroke='%3C%238b1e10' stroke-width='1.5'/%3E%3C/svg%3E")`
          }}
        />

        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 relative z-10">

          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 md:mb-14 px-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#221f20] tracking-tight leading-tight mb-3 sm:mb-3.5">
              How Your Puja <span className="text-accent">Is Performed</span>
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm md:text-base leading-relaxed sm:leading-relaxed font-medium">
              Book an authentic Vedic ritual from wherever you are. Our experienced priests perform the puja on your behalf, following traditional practices.
            </p>
          </div>

          {/* Process Container */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-3 lg:gap-5 relative z-10">

            {/* Step 1 */}
            <div className="flex flex-col items-center group text-center flex-1 w-full max-w-[210px]">
              <div className="w-24 h-24 sm:w-28 sm:h-28 relative mb-3 group-hover:scale-105 transition-all">
                <Image
                  src="/images/step_1.png"
                  alt="Choose Your Puja"
                  fill
                  sizes="(max-width: 640px) 96px, 112px"
                  className="object-contain"
                />
              </div>
              <h3 className="font-serif font-bold text-[#221f20] text-sm sm:text-base leading-tight">
                Choose Your<span className="text-accent"> Puja</span>
              </h3>
            </div>

            {/* Arrow 1 (Desktop) */}
            <div className="hidden md:flex text-[#c68a36] shrink-0 mb-6">
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center group text-center flex-1 w-full max-w-[210px]">
              <div className="w-24 h-24 sm:w-28 sm:h-28 relative mb-3 group-hover:scale-105 transition-all">
                <Image
                  src="/images/step_2.png"
                  alt="Share Your Details"
                  fill
                  sizes="(max-width: 640px) 96px, 112px"
                  className="object-contain"
                />
              </div>
              <h3 className="font-serif font-bold text-[#221f20] text-sm sm:text-base leading-tight">
                Share Your<span className="text-accent"> Details</span>
              </h3>
            </div>

            {/* Arrow 2 (Desktop) */}
            <div className="hidden md:flex text-[#c68a36] shrink-0 mb-6">
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center group text-center flex-1 w-full max-w-[210px]">
              <div className="w-24 h-24 sm:w-28 sm:h-28 relative mb-3 group-hover:scale-105 transition-all">
                <Image
                  src="/images/step_3.png"
                  alt="Puja Is Performed"
                  fill
                  sizes="(max-width: 640px) 96px, 112px"
                  className="object-contain"
                />
              </div>
              <h3 className="font-serif font-bold text-[#221f20] text-sm sm:text-base leading-tight">
                Priest Performs <span className="text-accent">the Puja
                </span>
              </h3>
            </div>

            {/* Arrow 3 (Desktop) */}
            <div className="hidden md:flex text-[#c68a36] shrink-0 mb-6">
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center group text-center flex-1 w-full max-w-[210px]">
              <div className="w-24 h-24 sm:w-28 sm:h-28 relative mb-3 group-hover:scale-105 transition-all">
                <Image
                  src="/images/step_4.png"
                  alt="Receive Your Puja Video"
                  fill
                  sizes="(max-width: 640px) 96px, 112px"
                  className="object-contain"
                />
              </div>
              <h3 className="font-serif font-bold text-[#221f20] text-sm sm:text-base leading-tight">
                Receive <span className="text-accent">Your Puja Video</span>
              </h3>
            </div>

          </div>

        </div>
      </section>

      {/* ── 3. Our Pujas Section ── */}
      <section className="py-12 bg-white">
        <div className="max-w-[1350px] mx-auto px-3 min-[360px]:px-4 sm:px-6 lg:px-10">

          {/* Header Row & Category Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#221f20] font-serif">
              Our <span className="text-accent">Pujas</span>
            </h2>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={clearFilters}
                className={`font-bold px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${!hasActiveFilters
                  ? "bg-[#14395C] text-white shadow-sm hover:bg-[#0e2740]"
                  : "bg-white border border-stone-200 text-stone-700 hover:border-stone-400 font-semibold px-3.5 sm:px-4"
                  }`}
              >
                All
              </button>

              {dynamicFilterGroups.map((group) => {
                const selectedCount = (filters[group.label] || []).length;
                const isSelected = selectedCount > 0;
                return (
                  <button
                    key={group.label}
                    type="button"
                    onClick={() => openFilterModal(group.label)}
                    className={`font-bold px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${isSelected
                      ? "bg-[#14395C] text-white shadow-sm hover:bg-[#0e2740]"
                      : "bg-white border border-stone-200 text-stone-700 hover:border-stone-400 font-semibold"
                      }`}
                  >
                    <span>{group.label === "Benefits" ? "Benefit" : group.label}</span>
                    {selectedCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-white text-[#14395C] text-[10px] font-extrabold flex items-center justify-center shrink-0">
                        {selectedCount}
                      </span>
                    )}
                  </button>
                );
              })}

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs sm:text-sm font-semibold text-red-500 hover:text-red-700 underline px-2 py-1 cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

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

          {/* Puja Cards Grid (Maximum 6 active Pujas loaded from Express API) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 w-full max-w-full xl:max-w-none mx-auto">
            {!fetchedPujas ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="bg-white rounded-3xl h-[450px] animate-pulse border border-stone-200 p-3 shadow-sm flex flex-col"
                >
                  <div className="w-full aspect-[4/3] xl:aspect-auto xl:h-[235px] bg-stone-100 rounded-xl min-[375px]:rounded-2xl mb-4 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-stone-300 animate-spin" />
                  </div>
                  <div className="w-1/3 h-3 bg-stone-200 rounded-full mx-auto mb-4" />
                  <div className="w-3/4 h-5 bg-stone-200 rounded-full mb-3" />
                  <div className="w-1/2 h-4 bg-stone-100 rounded-full mb-auto" />
                  <div className="flex justify-between items-end mt-4">
                    <div className="w-20 h-6 bg-stone-200 rounded-full" />
                    <div className="w-32 h-10 bg-success/20 rounded-full" />
                  </div>
                </div>
              ))
            ) : filteredPujas.length === 0 ? (
              <div className="col-span-full py-12 text-center text-stone-400 font-medium">
                No active Pujas found for selected filters.
              </div>
            ) : (
              filteredPujas.map((p) => {
                const priceVal = formatStartingPrice(p);
                const slugVal = p.slug || (p.title ? p.title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-") : "");
                const topTagVal = p.badge || p.shortTitle || p.subtitle;
                const descriptionVal = p.description || p.subtitle;
                const venueVal = p.templeVenue || p.details?.templeName || p.templeName || "";
                const locVal = p.location || p.filterLocation || p.templeLocation || p.details?.templeLocation || "";
                const occasionVal = p.subtitle || p.occasion || p.dateOccasion || p.badge || "";

                return (
                  <div
                    key={p._id}
                    className="flex flex-col"
                  >
                    <PujaCard
                      id={p._id}
                      imageSrc={p.imageUrl ? (p.imageUrl.startsWith("http") || p.imageUrl.startsWith("/") ? p.imageUrl : `/${p.imageUrl}`) : ""}
                      topTag={topTagVal}
                      title={p.title}
                      subtitle={descriptionVal}
                      templeVenue={venueVal}
                      location={locVal}
                      date={p.date}
                      time={p.time}
                      buttonText={p.buttonText}
                      dateOccasion={occasionVal}
                      price={priceVal}
                      slug={slugVal}
                      onShare={(sharePayload) => {
                        setShareData(sharePayload);
                        setShareModalOpen(true);
                      }}
                    />
                  </div>
                );
              })
            )}
          </div>

          {/* <div className="text-center mt-10">
            <Link
              href="/puja"
              className="inline-block text-[#14395C] font-extrabold px-8 py-3 rounded-full border-2 border-[#14395C] hover:bg-[#14395C]/5 active:scale-95 transition-all text-base shadow-sm"
            >
              View All Pujas
            </Link>
          </div> */}
        </div>
      </section>

      {/* ── 4. Puja Gallery Section ── */}
      <section className="pt-10 pb-8 sm:pt-14 sm:pb-12 bg-white relative overflow-hidden group/gallery">
        {/* Background Typography at Top */}
        <h2 className="text-[44px] min-[375px]:text-[52px] min-[425px]:text-[60px] sm:text-[95px] md:text-[120px] lg:text-[160px] xl:text-[185px] font-bold text-stone-200/90 font-serif tracking-tight text-center select-none pointer-events-none whitespace-nowrap absolute top-1 sm:top-2 left-1/2 -translate-x-1/2 z-0 leading-none">
          Puja Gallery
        </h2>

        {/* Left Navigation Button - Transparent Dark Circle */}
        <button
          type="button"
          onClick={() => scrollGallery("left")}
          aria-label="Previous gallery images"
          className="absolute left-3 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
        </button>

        {/* Right Navigation Button - Transparent Dark Circle */}
        <button
          type="button"
          onClick={() => scrollGallery("right")}
          aria-label="Next gallery images"
          className="absolute right-3 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
        </button>

        {/* Draggable Row Container anchored at Bottom of Font */}
        <div
          ref={galleryScrollRef}
          onMouseDown={handleGalleryMouseDown}
          onMouseMove={handleGalleryMouseMove}
          onMouseUp={handleGalleryMouseUpOrLeave}
          onMouseLeave={handleGalleryMouseUpOrLeave}
          className={`relative z-10 w-full pt-12 min-[375px]:pt-14 sm:pt-20 md:pt-24 pb-2 px-4 sm:px-8 overflow-x-auto overflow-y-hidden select-none no-scrollbar ${isGalleryDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
          style={{ scrollBehavior: isGalleryDragging ? "auto" : "smooth" }}
        >
          <div className="flex gap-4 sm:gap-6 items-end w-max pb-2">
            {[...dynamicGalleryImages, ...dynamicGalleryImages].map((img, idx) => (
              <div
                key={idx}
                onClick={() => {
                  if (galleryMovedRef.current) return;
                  setGalleryLightboxIdx(idx % dynamicGalleryImages.length);
                  setGalleryLightboxOpen(true);
                }}
                className={`relative shrink-0 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-stone-200/80 group transition-transform duration-300 hover:scale-[1.02] ${img.aspect}`}
              >
                {/* Full Image in Crisp HD */}
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  unoptimized
                  draggable={false}
                  sizes="(max-width: 640px) 250px, (max-width: 1024px) 350px, 450px"
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none"
                  onError={() => {
                    setFailedImages((prev) => ({ ...prev, [img.src]: true }));
                  }}
                />
                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-xs shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                    <ZoomIn className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── 6. FAQ Section ── */}
      <section id="faq-section" className="py-16 bg-white">
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col md:flex-row gap-12">
          {/* Left: Doubts */}
          <div className="md:w-1/3">

            <h2 className="text-4xl md:text-5xl font-bold text-[#4a2e21] font-serif mb-4 leading-tight">Doubts?<br />We&apos;re Here.</h2>
            <p className="text-gray-600 mb-8 text-sm max-w-[250px]">
              Our devotee care team is available 24/7. Reach them on WhatsApp, phone, or email.
            </p>
            <a
              href="tel:+919677391108"
              className="inline-block bg-[#14395C] text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-[#0e2740] transition-colors text-center"
            >
              Speak to Devotee Care
            </a>
          </div>

          {/* Right: Accordion */}
          <div className="md:w-2/3 flex flex-col gap-3">
            {faqList.map((faq, idx) => (
              <AccordionItem
                key={idx}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFaqIndex === idx}
                onToggle={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Footer ── */}
      <footer className="bg-[#fdfbf7] text-stone-700 pt-16 pb-12 sm:pb-16 border-t border-[#f0e4d0] relative">
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-10 text-center border-b border-stone-200/80 pb-12 mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#1f1a17] mb-4 leading-tight">
            A Sacred Path to Divine Blessings Book Your<br className="hidden sm:inline" /> Sacred Puja
          </h2>
          <p className="text-stone-600 text-sm sm:text-base mb-8 font-medium">Connect with divine blessings through authentic Vedic rituals.</p>
          <div className="flex items-center justify-center mb-8 flex-wrap">
            <span className="text-[#1f1a17] font-extrabold text-base sm:text-lg mr-4">Follow us —</span>
            <ul className="flex items-center justify-center gap-3">
              <li>
                <a href="https://www.facebook.com/astroved" aria-label="Facebook" rel="nofollow" target="_blank" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-stone-200 text-[#1877F2] transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:border-[#1877F2] hover:shadow-lg hover:shadow-[#1877F2]/20">
                  <i className="fa-brands fa-facebook-f text-lg text-[#1877F2]"></i>
                </a>
              </li>
              <li>
                <a href="https://twitter.com/astroved" aria-label="X (formerly Twitter)" rel="nofollow" target="_blank" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-stone-200 text-black transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:border-black hover:shadow-lg hover:shadow-black/10">
                  <i className="fa-brands fa-x-twitter text-base text-black"></i>
                </a>
              </li>
              <li>
                <a href="https://www.youtube.com/channel/UCLzw8opUlMnSA2TQfj34K9w" aria-label="YouTube" rel="nofollow" target="_blank" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-stone-200 text-[#FF0000] transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:border-[#FF0000] hover:shadow-lg hover:shadow-[#FF0000]/20">
                  <i className="fa-brands fa-youtube text-lg text-[#FF0000]"></i>
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/astroved/" aria-label="Instagram" rel="nofollow" target="_blank" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-stone-200 text-[#E1306C] transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:border-[#E1306C] hover:shadow-lg hover:shadow-[#E1306C]/20">
                  <i className="fa-brands fa-instagram text-lg text-[#E1306C]"></i>
                </a>
              </li>
              <li>
                <a href="https://www.linkedin.com/company/astroved-com" aria-label="LinkedIn" rel="nofollow" target="_blank" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-stone-200 text-[#0A66C2] transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:border-[#0A66C2] hover:shadow-lg hover:shadow-[#0A66C2]/20">
                  <i className="fa-brands fa-linkedin-in text-lg text-[#0A66C2]"></i>
                </a>
              </li>
              <li>
                <a href="https://whatsapp.com/channel/0029VaAG971AInPbquhYnI3u" aria-label="WhatsApp Channel" rel="nofollow" target="_blank" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-stone-200 text-[#25D366] transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:border-[#25D366] hover:shadow-lg hover:shadow-[#25D366]/20">
                  <i className="fa-brands fa-whatsapp text-xl text-[#25D366]"></i>
                </a>
              </li>
            </ul>
          </div>
          {/* <Link href="/puja" className="bg-[#14395C] hover:bg-[#0e2740] active:scale-95 text-white font-extrabold px-8 py-3.5 rounded-full text-sm sm:text-base transition-all inline-flex items-center gap-2.5 shadow-md shadow-[#14395C]/20">
            Find the Right Puja <div className="bg-white text-[#14395C] rounded-full w-5 h-5 flex items-center justify-center shadow-sm"><ChevronRight className="w-3 h-3 text-[#14395C]" strokeWidth={3} /></div>
          </Link> */}
        </div>

        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col lg:flex-row justify-between gap-12 lg:gap-8 mb-10">
          {/* Logo Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image
                src={priestservicesLogo}
                alt="AstroVed Priest Services"
                width={192}
                height={48}
                className="h-10 sm:h-12 w-auto object-contain grayscale-0"
              />
            </div>
            <p className="text-xs sm:text-sm text-stone-600 max-w-xs leading-relaxed font-medium">
              Priest Services is a spiritual platform that enables devotees to book authentic Vedic pujas at sacred temples across India.
            </p>
          </div>

          {/* EXPLORE */}
          <div>
            <h4 className="text-[#1f1a17] font-bold text-sm tracking-[0.15em] uppercase mb-6">Explore</h4>
            <ul className="flex flex-col gap-4 text-sm text-stone-600 font-medium">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/puja" className="hover:text-primary transition-colors">Puja</Link></li>
              <li><Link href="/account" className="hover:text-primary transition-colors">Account</Link></li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h4 className="text-[#1f1a17] font-bold text-sm tracking-[0.15em] uppercase mb-6">Support</h4>
            <ul className="flex flex-col gap-4 text-sm text-stone-600 font-medium">
              <li><Link href="mailto:support@astroved.com" className="hover:text-primary transition-colors">support@astroved.com</Link></li>
              <li><Link href="/account?tab=support" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="https://wa.me/919566777645" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">WhatsApp: +91 9566777645</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* CONNECT */}
          <div>
            <h4 className="text-[#1f1a17] font-bold text-sm tracking-[0.15em] uppercase mb-6">Connect</h4>
            <ul className="flex flex-col gap-6 text-sm text-stone-600 font-medium">
              <li>
                <strong className="block text-[#1f1a17] mb-1 font-semibold">Customer Care</strong>
                <a href="tel:+919677391108" className="hover:text-primary transition-colors block leading-relaxed">+91 9677391108</a>
                <a href="tel:+914443419898" className="hover:text-primary transition-colors block leading-relaxed">+91 44 43419898</a>
              </li>
              <li>
                <strong className="block text-[#1f1a17] mb-1 font-semibold">Toll Free</strong>
                <a href="tel:18001029098" className="hover:text-primary transition-colors block leading-relaxed">1800 102 9098</a>
              </li>
            </ul>
          </div>

          {/* CORPORATE OFFICE */}
          <div>
            <h4 className="text-[#1f1a17] font-bold text-sm tracking-[0.15em] uppercase mb-6">Corporate Office</h4>
            <div className="text-sm text-stone-600 font-medium leading-loose">
              4th Floor, A-Block, Prince Info Park,<br />
              Plot No. 81-B, 2nd Main Road,<br />
              Ambattur Industrial Estate, Chennai 600058.<br /><br />
              Phone: <a href="tel:+914443419898" className="hover:text-primary transition-colors">+91-44-43419898</a>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-200/80 pt-8 text-center text-xs text-stone-500 font-medium flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <span>© 2026 Astroved PriestService. All rights reserved.</span>
        </div>
      </footer>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        data={shareData}
      />

      {/* Puja Gallery Lightbox Modal */}
      <GalleryLightboxModal
        isOpen={galleryLightboxOpen}
        onClose={() => setGalleryLightboxOpen(false)}
        images={dynamicGalleryImages}
        initialIndex={galleryLightboxIdx}
      />
    </main>
  );
}

// --- Helper Data & Components ---

const defaultGalleryImages = [
  {
    src: "/Service%20images/shreem.jpg",
    alt: "Sacred Vedic Ritual",
    aspect: "w-[190px] sm:w-[220px] md:w-[250px] h-[300px] sm:h-[350px] md:h-[380px]", // Tall
  },
  {
    src: "/Service%20images/maha_homam.jpeg",
    alt: "Maha Homam Ritual",
    aspect: "w-[240px] sm:w-[280px] md:w-[320px] h-[210px] sm:h-[240px] md:h-[260px]", // Wide landscape
  },
  {
    src: "/Service%20images/lord_perumal.jpeg",
    alt: "Lord Perumal Puja",
    aspect: "w-[200px] sm:w-[230px] md:w-[260px] h-[340px] sm:h-[390px] md:h-[420px]", // Very Tall
  },
  {
    src: "/Service%20images/g3.jpg",
    alt: "Puja Ceremony",
    aspect: "w-[250px] sm:w-[290px] md:w-[330px] h-[190px] sm:h-[220px] md:h-[240px]", // Landscape
  },
  {
    src: "/Service%20images/group_shreem.jpeg",
    alt: "Group Puja Ritual",
    aspect: "w-[230px] sm:w-[270px] md:w-[300px] h-[240px] sm:h-[280px] md:h-[300px]", // Medium balanced
  },
  {
    src: "/Service%20images/golu.jpeg",
    alt: "Vedic Chanting and Puja",
    aspect: "w-[190px] sm:w-[220px] md:w-[250px] h-[300px] sm:h-[350px] md:h-[380px]", // Tall
  },
  {
    src: "/Service%20images/g2.jpg",
    alt: "Sacred Vedic Homa Ritual",
    aspect: "w-[240px] sm:w-[280px] md:w-[320px] h-[210px] sm:h-[240px] md:h-[260px]", // Landscape
  },
];


interface PujaCardProps {
  id: string;
  imageSrc: string | { src: string };
  topTag: string;
  title: string;
  subtitle: string;
  templeVenue?: string;
  location?: string;
  date: string;
  time?: string;
  buttonText?: string;
  dateOccasion?: string;
  price: string | number;
  slug?: string;
  onShare?: (data: ShareData) => void;
}

function PujaCard({
  id,
  imageSrc,
  topTag,
  title,
  subtitle,
  templeVenue,
  location,
  date,
  dateOccasion,
  time,
  buttonText,
  price,
  slug,
  onShare,
}: PujaCardProps) {
  const cardUrl = slug ? `/puja/${slug}` : "/puja";
  const srcStr = (typeof imageSrc === "string" ? imageSrc : (imageSrc as any)?.src) || "/images/Ganesh-Chaturthi-Mahapuja.jpg";
  const rawImg = (() => {
    try {
      return encodeURI(decodeURI(srcStr));
    } catch {
      return encodeURI(srcStr);
    }
  })();
  const img1024 = get1024BannerImage(rawImg);

  // Determine main venue title and secondary location text matching detail page
  const mainVenue = templeVenue || location || "Sacred Temple Venue";
  const subLocation = location && location !== mainVenue ? location : "";

  return (
    <div className="bg-white rounded-2xl min-[375px]:rounded-3xl border border-stone-200/90 p-2 min-[375px]:p-2.5 sm:p-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.12),0_2px_6px_-1px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.18),0_8px_10px_-6px_rgba(0,0,0,0.1)] transition-all duration-300 flex flex-col group text-left relative h-full">
      <Link href={cardUrl} className="flex flex-col flex-1 cursor-pointer">
        {/* Top Banner Image Container with Subtle Space */}
        <div className="relative w-full aspect-[4/3] min-h-[190px] xl:min-h-0 xl:aspect-auto xl:h-[235px] rounded-xl min-[375px]:rounded-2xl overflow-hidden mb-2 sm:mb-2.5 bg-stone-100 shrink-0">
          <picture className="absolute inset-0 w-full h-full block">
            <source
              media="(min-width: 1024px) and (max-width: 1279px)"
              srcSet={img1024}
            />
            <img
              src={rawImg}
              alt={title}
              className="w-full h-full object-cover object-center"
            />
          </picture>
        </div>

        {/* Card Body Container */}
        <div className="p-1 sm:px-1.5 flex flex-col flex-1">
          {/* Sub-header Tag with Filigree Accents */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-[1px] bg-accent/40" />
            <span className="text-accent font-serif font-extrabold text-xs sm:text-[13px] tracking-wider uppercase flex items-center gap-1.5 text-center">
              <span className="text-[10px]">♦</span> {topTag} <span className="text-[10px]">♦</span>
            </span>
            <div className="w-8 h-[1px] bg-accent/40" />
          </div>

          {/* Card Title */}
          <h3 className="font-serif font-bold text-[#1f1a17] text-lg sm:text-xl lg:text-2xl leading-tight sm:leading-snug tracking-tight mb-2 line-clamp-2">
            {title}
          </h3>

          {/* Subtitle / Description */}
          <p className="text-stone-600 text-xs sm:text-sm font-medium leading-relaxed mb-4 line-clamp-2">
            {subtitle}
          </p>

          {/* Location & Date Details Box with Vector SVG Icons */}
          <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-3 sm:p-3.5 mb-4 space-y-2.5 text-xs sm:text-[13px] text-stone-800 mt-auto">
            {/* Temple & Location (Row 1) */}
            <div className="flex items-center gap-2.5">
              <div className="text-stone-700 shrink-0">
                <MapPin className="w-4 h-4 text-stone-700" strokeWidth={2} />
              </div>
              <div className="flex flex-wrap items-baseline gap-x-2 truncate">
                <span className="font-bold text-stone-900 leading-snug truncate">
                  {mainVenue}
                </span>
                {subLocation && (
                  <span className="text-stone-400 font-normal text-[11px] sm:text-xs truncate">
                    {subLocation}
                  </span>
                )}
              </div>
            </div>

            <div className="w-full h-[1px] bg-stone-200/70" />

            {/* Date & Occasion (Row 2) */}
            <div className="flex items-start gap-2.5">
              <div className="text-stone-700 shrink-0 mt-0.5">
                <Calendar className="w-4 h-4 text-stone-700" strokeWidth={2} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-stone-900 leading-snug">
                  {date}
                </span>
                {dateOccasion && (
                  <span className="text-stone-400 font-normal text-[11px] sm:text-xs leading-tight truncate">
                    {dateOccasion}
                  </span>
                )}
              </div>
            </div>

            {time && (
              <>
                <div className="w-full h-[1px] bg-stone-200/70" />
                <div className="flex items-center gap-2.5">
                  <div className="text-stone-700 shrink-0">
                    <Clock className="w-4 h-4 text-stone-700" strokeWidth={2} />
                  </div>
                  <span className="font-bold text-stone-900 leading-snug text-xs sm:text-sm">
                    {time}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Bottom Footer Row: Price + Participate Button */}
          <div className="flex items-center justify-between pt-0.5">
            {/* Price */}
            <div>
              <span className="font-extrabold text-2xl sm:text-3xl text-[#1f1a17] leading-none block">{price}</span>
              <span className="text-xs text-stone-500 font-semibold mt-0.5 block">Per Booking</span>
            </div>

            {/* CTA Button */}
            <div className="inline-flex items-center gap-2 bg-[#14395C] hover:bg-[#0e2740] active:scale-95 text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 sm:py-3 rounded-full shadow-md shadow-[#14395C]/20 transition-all duration-200 group/btn">
              <span>{buttonText || "Book My Puja"}</span>
              <div className="w-5 h-5 rounded-full bg-white text-[#14395C] flex items-center justify-center shrink-0">
                <ChevronRight className="w-3.5 h-3.5 text-[#14395C]" strokeWidth={3} />
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Top Right Floating Action Buttons (Wishlist & Share) */}
      <div className="absolute top-5 right-5 flex flex-col gap-2 z-10">
        {/* Wishlist Heart Button */}
        {id && <WishlistButton itemId={id} />}

        {/* Share Button */}
        <button
          type="button"
          aria-label="Share puja"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onShare?.({
              title,
              description: subtitle,
              location,
              url: window.location.origin + cardUrl,
            });
          }}
          className="w-8 h-8 rounded-full bg-white/95 text-stone-700 hover:text-success flex items-center justify-center shadow-md backdrop-blur-sm transition-transform active:scale-95 hover:bg-white"
        >
          <Share2 className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

// --- Helper Data & Components ---

const faqList = [
  {
    question: "What is an online puja and how does it work?",
    answer: "An online puja is performed on your behalf by our experienced pandits at sacred temples. You will receive a personalized video of your sankalpa via WhatsApp."
  },
  {
    question: "Do I need to be present during the puja?",
    answer: "No, your physical presence is not required. The pandits take your name, gotra, and sankalpa before performing the sacred rituals on your behalf."
  },
  {
    question: "What details do I need to provide when booking?",
    answer: "You will need to provide your full name, WhatsApp mobile number, date of birth, and optional gotra or zodiac details for the sankalpa."
  },
  {
    question: "Can I book a puja for my family members?",
    answer: "You may arrange a puja for a family member. The number of devotees covered and any additional charges depend on the selected booking package. Please review the package details or contact Devotee Care before booking."
  },
  {
    question: "Will the puja be live-streamed?",
    answer: "The current service includes a recorded puja video rather than guaranteed live streaming. Any additional viewing arrangements will be mentioned separately if available for the selected ritual."
  },
  {
    question: "What happens after I complete my booking?",
    answer: "Once booked, you will receive an instant confirmation on WhatsApp. On the puja date, our pandits perform your sankalpa and share video proof within 48 hours."
  },
  {
    question: "How do I know the ritual was performed on my behalf?",
    answer: "Your personal details are included in the Sankalpa as applicable to the selected ritual. A puja recording is shared after the ceremony so you can view the ritual performed."
  }
];

function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      className={`border rounded-xl px-5 py-4 transition-all duration-300 cursor-pointer select-none ${isOpen ? 'border-accent shadow-sm bg-white' : 'border-gray-200 bg-[#faf9f6] hover:bg-white'
        }`}
    >
      <div className="flex justify-between items-center">
        <h4 className={`text-sm sm:text-base font-bold transition-colors ${isOpen ? 'text-accent' : 'text-gray-800'}`}>
          {question}
        </h4>
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ml-4 transition-all ${isOpen ? 'bg-accent text-white' : 'bg-gray-200 text-gray-600'
            }`}
        >
          {isOpen ? '−' : '+'}
        </div>
      </div>
      {isOpen && (
        <div className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed pr-6 border-t border-gray-100 pt-3 animate-fade-in-up">
          {answer}
        </div>
      )}
    </div>
  );
}




