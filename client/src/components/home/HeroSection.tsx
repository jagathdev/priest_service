"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import PujaCountdownCard from "@/components/common/PujaCountdownCard";
import { 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Sparkles, 
  Sun, 
  Video, 
  ShieldCheck, 
  Landmark, 
  Scroll 
} from "lucide-react";

interface BannerSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  topBadge: string;
  bannerLine1: string;
  bannerLine2: string;
  bannerLine3: string;
  bannerLine4: string;
  location: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  eventDateTime?: string;
  templeVenue?: string;
  eventDateText?: string;
}

const DEFAULT_IMAGE = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400'%3E%3Crect width='800' height='400' fill='%23cccccc'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%23333333'%3ENo Image Available%3C/text%3E%3C/svg%3E`;

const safeEncodeUrl = (url: string): string => {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  try {
    return encodeURI(decodeURI(trimmed));
  } catch {
    return encodeURI(trimmed);
  }
};

export const get1024BannerImage = (img: string): string => {
  const lower = (img || "").toLowerCase();
  if (lower.includes("rameshwaram") || lower.includes("tarpanam")) {
    return "/Service%20images/rameshwaram_puja.png";
  }
  if (lower.includes("shani")) {
    return "/Service%20images/shani_puja.png";
  }
  if (lower.includes("nava") || lower.includes("navagraha")) {
    return "/Service%20images/nava_puja.png";
  }
  return safeEncodeUrl(img);
};

const mapBanners = (list: any[]): BannerSlide[] => {
  return list.map((item: any) => {
    let safeImage = item.imageUrl || "";
    if (
      safeImage &&
      !safeImage.startsWith("/") &&
      !safeImage.startsWith("http://") &&
      !safeImage.startsWith("https://") &&
      !safeImage.startsWith("data:")
    ) {
      safeImage = DEFAULT_IMAGE;
    } else if (safeImage) {
      safeImage = safeEncodeUrl(safeImage);
    }

    return {
      id: item._id || String(Math.random()),
      badge: item.tagLine || "SPECIAL SANKALPAM",
      title: item.title,
      subtitle: item.description,
      topBadge: item.tagLine || "",
      bannerLine1: "",
      bannerLine2: "",
      bannerLine3: "",
      bannerLine4: "",
      location: item.location || "",
      image: safeImage || DEFAULT_IMAGE,
      ctaText: item.cta?.text || "Book Puja Now",
      ctaLink: item.cta?.url || "/puja",
      eventDateTime: item.eventDateTime || "",
      templeVenue: item.templeVenue || "",
      eventDateText: item.eventDateText || "",
    };
  });
};

export default function HeroSection({ initialBanners }: { initialBanners?: any[] }) {
  const [bannerSlides, setBannerSlides] = useState<BannerSlide[]>(
    initialBanners && initialBanners.length > 0 ? mapBanners(initialBanners) : []
  );
  const [activeSlide, setActiveSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(!initialBanners || initialBanners.length === 0);

  // Swipe logic states
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const [_isTransitioning, setIsTransitioning] = useState(true);

  const totalSlides = bannerSlides.length;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const nextSlide = useCallback(() => {
    if (totalSlides <= 1) return;
    setIsTransitioning(true);
    setActiveSlide((prev) => prev + 1);
  }, [totalSlides]);

  const prevSlide = () => {
    if (totalSlides <= 1) return;
    setIsTransitioning(true);
    setActiveSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;

    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }
  };

  useEffect(() => {
    async function fetchHeroBanners() {
      try {
        const expressBase = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
        if (!initialBanners || initialBanners.length === 0) {
          const res = await fetch(`${expressBase}/api/hero-banners`);
          if (!res.ok) return;
          const data = await res.json();
          const list = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
          if (Array.isArray(list) && list.length > 0) {
            setBannerSlides(mapBanners(list));
          }
        }
      } catch (err) {
        console.error("Error loading hero banners:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchHeroBanners();
  }, [initialBanners]);

  // Auto-advance forward only every 8 seconds
  useEffect(() => {
    if (totalSlides <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 8000);
    return () => clearInterval(timer);
  }, [totalSlides, nextSlide]);

  if (isLoading) {
    return (
      <section className="relative w-full max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-10 pt-2 sm:pt-3 lg:pt-4 pb-8 md:pb-12 lg:py-12 bg-white my-0 sm:my-1 xl:my-2 overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8 xl:gap-14 animate-pulse">
        {/* Skeleton Left Content */}
        <div className="flex-1 w-full max-w-[640px] pt-2 pb-1 flex flex-col justify-start items-center lg:items-start h-auto lg:min-h-[500px]">
          <div className="flex flex-col items-center lg:items-start w-full">
            {/* Top Badge */}
            <div className="w-32 h-6 bg-stone-200 rounded-full mb-5 hidden lg:block" />

            {/* Main Title */}
            <div className="w-full sm:w-[90%] xl:w-[80%] h-12 sm:h-14 xl:h-20 bg-stone-200 rounded-xl mb-4 xl:mb-5" />
            <div className="w-3/4 sm:w-[70%] xl:w-[60%] h-12 sm:h-14 xl:h-20 bg-stone-200 rounded-xl mb-6" />

            {/* Subtitle */}
            <div className="w-full sm:w-[85%] h-4 sm:h-5 bg-stone-100 rounded-full mb-3" />
            <div className="w-[90%] sm:w-[75%] h-4 sm:h-5 bg-stone-100 rounded-full mb-3" />
            <div className="w-[80%] sm:w-[60%] h-4 sm:h-5 bg-stone-100 rounded-full mb-8" />
          </div>

          <div className="mt-8 sm:mt-10 lg:mt-12 flex flex-col items-center lg:items-start w-full">
            {/* CTA Button */}
            <div className="w-[240px] sm:w-[280px] h-12 sm:h-14 bg-stone-200 rounded-full mb-6" />

            {/* Social Proof Banner */}
            <div className="w-full max-w-[380px] sm:max-w-[400px] h-16 bg-stone-100 rounded-xl border border-stone-200" />
          </div>
        </div>

        {/* Skeleton Right Content (Image Card) */}
        <div className="flex-1 w-full lg:w-1/2 shrink-0 flex flex-col items-center">
          <div className="w-full bg-stone-100 rounded-2xl min-[375px]:rounded-3xl border border-stone-200 aspect-[4/3] sm:aspect-auto sm:h-[400px] md:h-[460px] lg:h-[320px] xl:h-[500px] flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-stone-200 animate-spin" />
          </div>
          <div className="flex gap-2.5 mt-5">
            <div className="w-7 h-2 bg-stone-300 rounded-full" />
            <div className="w-2 h-2 bg-stone-200 rounded-full" />
            <div className="w-2 h-2 bg-stone-200 rounded-full" />
          </div>
        </div>
      </section>
    );
  }

  if (bannerSlides.length === 0) return null;
  const currentSafeSlideIndex = bannerSlides.length > 0 ? activeSlide % bannerSlides.length : 0;
  const current = bannerSlides[currentSafeSlideIndex];

  return (
    <section className="relative w-full max-w-[1350px] mx-auto px-3 min-[360px]:px-4 sm:px-6 md:px-8 lg:px-10 pt-2 sm:pt-3 lg:pt-4 pb-8 md:pb-12 xl:py-12 bg-white my-0 sm:my-1 xl:my-2 overflow-hidden">

      {/* Background Circular Mandala Watermark inside Hero */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] bg-center bg-no-repeat bg-contain z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'%3E%3Ccircle cx='250' cy='250' r='240' fill='none' stroke='%3C%238b1e10' stroke-width='1.5'/%3E%3Ccircle cx='250' cy='250' r='200' fill='none' stroke='%3C%238b1e10' stroke-width='1' stroke-dasharray='4 4'/%3E%3Ccircle cx='250' cy='250' r='160' fill='none' stroke='%3C%238b1e10' stroke-width='1.5'/%3E%3Ccircle cx='250' cy='250' r='110' fill='none' stroke='%3C%238b1e10' stroke-width='1'/%3E%3Cpath d='M250 10 L250 490 M10 250 L490 250 M80 80 L420 420 M420 80 L80 420' stroke='%3C%238b1e10' stroke-width='0.5'/%3E%3C/svg%3E")`
        }}
      />

      {/* ── Top Sub-header Badge (Above Hero Image on Mobile & Tablet < lg) ── */}
      <div className="lg:hidden flex items-center justify-center gap-2.5 mt-0.5 sm:mt-1 mb-2.5 sm:mb-3.5 z-10 relative">
        <Sparkles className="w-5 h-5 text-accent shrink-0" />
        <span className="text-[#881337] font-bold text-xs sm:text-sm tracking-[0.15em] uppercase">
          {current.badge}
        </span>
      </div>

      <div
        className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-10 xl:gap-14 group"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={handleTouchEnd}
      >

        {/* ── Left Content (Text & CTA) ── 50% equal balance with right side */}
        <div className="order-2 lg:order-1 flex-1 w-full lg:w-1/2 text-center lg:text-left flex flex-col justify-start items-center lg:items-start h-auto min-h-0 pt-2 pb-1">

          {/* Top Block: Always starts at fixed top position */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left w-full">
            {/* Top Sub-header Badge with Custom Vector Lotus SVG (Desktop lg+ only) */}
            <div className="hidden lg:flex items-center justify-start gap-2.5 mb-3 xl:mb-5">
              <Sparkles className="w-5 h-5 text-accent shrink-0" />
              <span className="text-[#881337] font-bold text-xs xl:text-sm tracking-[0.15em] uppercase">
                {current.badge}
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-[40px] xl:text-[48px] font-serif font-bold text-[#1f1a17] leading-[1.18] sm:leading-[1.18] tracking-tight mb-3 sm:mb-4 xl:mb-5 transition-all duration-300 max-w-[620px]">
              {current.title}
            </h1>

            {/* Subtitle / Description */}
            <p className="text-stone-600 text-sm sm:text-base lg:text-[15px] xl:text-[17px] leading-relaxed max-w-[560px] mx-auto lg:mx-0 font-normal">
              {current.subtitle}
            </p>

            {/* Dynamic Countdown & Temple Details fetched from Dashboard */}
            {(current.eventDateTime || current.templeVenue) && (
              <div className="w-full mt-4 max-w-[580px]">
                <PujaCountdownCard
                  templeVenue={current.templeVenue || "Kamrup Teerth Kshetra"}
                  location={current.location || "Guwahati, Assam"}
                  dateText={current.eventDateText || "Saturday, 10 October"}
                  occasionText={current.badge || "Mahalaya Amavasya"}
                  eventDateTime={current.eventDateTime}
                  title="Reserve your sankalp"
                  badgeLabel="MUHURAT ENDS IN"
                />
              </div>
            )}
          </div>

          {/* Bottom Block: CTA Button & Social Proof Banner */}
          <div className="mt-6 sm:mt-8 lg:mt-6 xl:mt-12 flex flex-col items-center lg:items-start text-center lg:text-left w-full">
            {/* CTA Button */}
            <div className="mb-4 sm:mb-5 lg:mb-4 xl:mb-6 w-full flex justify-center lg:justify-start">
              <Link
                href={current.ctaLink}
                className="inline-flex items-center justify-between gap-5 sm:gap-6 bg-[#0f3456] hover:bg-[#0a253e] active:scale-95 text-white font-extrabold text-base sm:text-lg px-7 sm:px-8 py-3.5 sm:py-4 rounded-full shadow-lg shadow-[#0f3456]/25 transition-all duration-200 group w-auto min-w-[250px] sm:min-w-[270px]"
              >
                <span className="tracking-normal font-sans font-bold">{current.ctaText}</span>
                <div className="w-8 h-8 rounded-full bg-white text-[#0f3456] flex items-center justify-center shadow-xs shrink-0 group-hover:translate-x-0.5 transition-transform">
                  <ChevronRight className="w-4 h-4 text-[#0f3456]" strokeWidth={3} />
                </div>
              </Link>
            </div>

            {/* ── MOBILE ONLY (< sm / < 640px): Tagline + 3-Stat Horizontal Row ── */}
            <div className="flex sm:hidden flex-col items-center w-full max-w-[500px] mx-auto">
              {/* Tagline */}
              <div className="flex items-center justify-center gap-1.5 mb-2.5 text-stone-600">
                <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                <p className="text-xs font-semibold text-stone-700 tracking-tight">
                  One of India&apos;s most loved devotional platforms
                </p>
              </div>

              {/* 3-Stat Trust Card */}
              <div className="border border-stone-200/90 bg-white/95 backdrop-blur-sm rounded-xl py-2.5 px-3 shadow-sm flex items-center justify-between w-full">
                <div className="flex-1 text-center px-1">
                  <p className="text-[#14395C] font-black text-base leading-none">10M+</p>
                  <p className="text-[9px] text-stone-500 font-medium mt-1 leading-tight">Pujas performed</p>
                </div>

                <div className="w-[1px] h-7 bg-stone-200 shrink-0" />

                <div className="flex-1 text-center px-1">
                  <p className="text-[#14395C] font-black text-base leading-none">180+</p>
                  <p className="text-[9px] text-stone-500 font-medium mt-1 leading-tight">Scholars & priests</p>
                </div>

                <div className="w-[1px] h-7 bg-stone-200 shrink-0" />

                <div className="flex-1 text-center px-1">
                  <p className="text-[#14395C] font-black text-base leading-none">25+</p>
                  <p className="text-[9px] text-stone-500 font-medium mt-1 leading-tight">Years of expertise</p>
                </div>
              </div>
            </div>

            {/* ── TABLET & LAPTOP (sm+ / >= 640px): Previous Inline Style ── */}
            <div className="hidden sm:flex border border-stone-200/90 bg-white/95 backdrop-blur-sm rounded-xl py-2 px-2.5 md:px-3 lg:px-2.5 xl:px-4 shadow-sm items-center justify-between gap-1.5 sm:gap-2.5 lg:gap-2 xl:gap-3.5 w-full max-w-[560px] mx-auto lg:mx-0">
              {/* Sun Icon Section */}
              <div className="flex items-center gap-1.5 lg:gap-1.5 xl:gap-2 shrink-0">
                <div className="text-stone-400 shrink-0">
                  <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
                </div>
                <p className="text-[10px] sm:text-[11px] lg:text-[9.5px] xl:text-[11px] text-stone-900 font-bold leading-tight text-left">
                  One of India&apos;s most<br />loved devotional<br />platforms
                </p>
              </div>

              <div className="w-[1px] h-6 bg-stone-200 shrink-0" />

              {/* Devotees Count */}
              <div className="text-center px-0.5 sm:px-1 shrink-0">
                <p className="text-[#14395C] font-black text-base sm:text-lg lg:text-[15px] xl:text-lg leading-none">10M+</p>
                <p className="text-[9px] sm:text-[10px] lg:text-[8.5px] xl:text-[10px] text-stone-500 font-medium mt-0.5">Pujas performed</p>
              </div>

              <div className="w-[1px] h-6 bg-stone-200 shrink-0" />

              {/* Scholars and priests */}
              <div className="text-center px-0.5 sm:px-1 shrink-0">
                <p className="text-[#14395C] font-black text-base sm:text-lg lg:text-[15px] xl:text-lg leading-none">180+</p>
                <p className="text-[9px] sm:text-[10px] lg:text-[8.5px] xl:text-[10px] text-stone-500 font-medium mt-0.5">Scholars & priests</p>
              </div>

              <div className="w-[1px] h-6 bg-stone-200 shrink-0" />

              {/* 25+ years of Vedic expertise */}
              <div className="text-center px-0.5 sm:px-1 shrink-0">
                <p className="text-[#14395C] font-black text-base sm:text-lg lg:text-[15px] xl:text-lg leading-none">25+</p>
                <p className="text-[9px] sm:text-[10px] lg:text-[8.5px] xl:text-[10px] text-stone-500 font-medium mt-0.5">Years of Vedic expertise</p>
              </div>
            </div>
          </div>

        </div>

        {/* ── Right Content (Hero Banner Card) ── 50% equal balance with left side */}
        <div className="order-1 lg:order-2 flex-1 w-full lg:w-1/2 shrink-0 flex flex-col items-center relative">

          {/* Smooth Fade Carousel Viewport */}
          <div className="relative w-full aspect-[4/3] min-h-[250px] sm:min-h-[360px] sm:aspect-auto sm:h-[390px] md:h-[440px] lg:h-[370px] xl:h-[500px] rounded-2xl min-[375px]:rounded-3xl overflow-hidden shadow-2xl border border-stone-200/80 bg-stone-100 shrink-0 group/carousel">
            {bannerSlides.map((slide, idx) => {
              const isActive = idx === currentSafeSlideIndex;
              const img1024 = get1024BannerImage(slide.image);
              const useSource = !img1024.startsWith("data:");
              return (
                <div
                  key={`${slide.id || "slide"}-${idx}`}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"}`}
                >
                  <Link
                    href={slide.ctaLink}
                    className="w-full h-full block relative cursor-pointer"
                  >
                    {/* Full-bleed Banner Image with 1024 Specific Media Query */}
                    <picture className="absolute inset-0 w-full h-full block">
                      {useSource && (
                        <source
                          media="(min-width: 1024px) and (max-width: 1279px)"
                          srcSet={img1024}
                        />
                      )}
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover object-center"
                      />
                    </picture>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Left Navigation Arrow (Outside Image Card - Tablet & Laptop/Desktop) */}
          {totalSlides > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                prevSlide();
              }}
              aria-label="Previous slide"
              className="absolute -left-3.5 sm:-left-4 md:-left-5 xl:-left-6 top-[calc(50%-18px)] -translate-y-1/2 z-30 hidden sm:flex h-9 w-9 xl:h-11 xl:w-11 items-center justify-center rounded-full bg-white/95 hover:bg-white text-stone-800 border border-stone-200/90 shadow-xl transition-all duration-200 active:scale-95 cursor-pointer hover:scale-110 backdrop-blur-sm"
            >
              <ChevronLeft className="w-5 h-5 xl:w-6 xl:h-6 text-stone-800" strokeWidth={2.5} />
            </button>
          )}

          {/* Right Navigation Arrow (Outside Image Card - Tablet & Laptop/Desktop) */}
          {totalSlides > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                nextSlide();
              }}
              aria-label="Next slide"
              className="absolute -right-3.5 sm:-right-4 md:-right-5 xl:-right-6 top-[calc(50%-18px)] -translate-y-1/2 z-30 hidden sm:flex h-9 w-9 xl:h-11 xl:w-11 items-center justify-center rounded-full bg-white/95 hover:bg-white text-stone-800 border border-stone-200/90 shadow-xl transition-all duration-200 active:scale-95 cursor-pointer hover:scale-110 backdrop-blur-sm"
            >
              <ChevronRight className="w-5 h-5 xl:w-6 xl:h-6 text-stone-800" strokeWidth={2.5} />
            </button>
          )}

          {/* Slider Dots Navigation inside Hero - Centered directly below the image */}
          <div className="flex items-center justify-center gap-2.5 mt-4 sm:mt-5">
            {bannerSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsTransitioning(true);
                  setActiveSlide(index);
                }}
                aria-label={`Go to slide ${index + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${index === currentSafeSlideIndex
                  ? "w-7 h-2 bg-[#14395C]"
                  : "w-2 h-2 bg-stone-300 hover:bg-stone-400"
                  }`}
              />
            ))}
          </div>

        </div>

      </div>

      {/* ── Bottom Features Trust Strip (Marquee below 1440px screen size) ── */}
      <div className="relative z-10 mt-8 md:mt-10 border border-stone-200/90 bg-white/95 backdrop-blur-sm rounded-2xl p-3.5 sm:p-4.5 shadow-sm overflow-hidden">
        {/* Continuous Marquee on all screens below 1440px */}
        <div className="badge-marquee-below-1440 min-[1440px]:hidden overflow-hidden w-full relative">
          <div className="flex animate-marquee">
            <div className="flex shrink-0 items-center gap-8 sm:gap-12 pr-8 sm:pr-12">
              {[
                { color: "text-success", icon: <Video className="w-5 h-5" />, text: "Puja Video Delivered Within 48 Hours" },
                { color: "text-[#0084ff]", icon: <ShieldCheck className="w-5 h-5" />, text: "Verified & Experienced Pandits" },
                { color: "text-accent", icon: <Landmark className="w-5 h-5" />, text: "Pujas Performed in Sacred Temples" },
                { color: "text-[#d97706]", icon: <Scroll className="w-5 h-5" />, text: "100% Authentic Vedic Rituals" }
              ].map((item, idx) => (
                <div key={`h1-${idx}`} className="flex items-center gap-3 shrink-0 py-1">
                  <div className={`${item.color} shrink-0`}>
                    {item.icon}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-stone-800 whitespace-nowrap">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex shrink-0 items-center gap-8 sm:gap-12 pr-8 sm:pr-12" aria-hidden="true">
              {[
                { color: "text-success", icon: <Video className="w-5 h-5" />, text: "Puja Video Delivered Within 48 Hours" },
                { color: "text-[#0084ff]", icon: <ShieldCheck className="w-5 h-5" />, text: "Verified & Experienced Pandits" },
                { color: "text-accent", icon: <Landmark className="w-5 h-5" />, text: "Pujas Performed in Sacred Temples" },
                { color: "text-[#d97706]", icon: <Scroll className="w-5 h-5" />, text: "100% Authentic Vedic Rituals" }
              ].map((item, idx) => (
                <div key={`h2-${idx}`} className="flex items-center gap-3 shrink-0 py-1">
                  <div className={`${item.color} shrink-0`}>
                    {item.icon}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-stone-800 whitespace-nowrap">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Original Grid on Desktop screens (>= 1440px) */}
        <div className="badge-static-1440-grid hidden min-[1440px]:grid min-[1440px]:grid-cols-4 items-center justify-between gap-2 divide-x divide-stone-200">
          <div className="flex items-center justify-start gap-3 px-4 py-0">
            <div className="text-[#14395C] shrink-0">
              <Video className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-stone-800 leading-tight">
              Puja Video Delivered Within 48 Hours
            </span>
          </div>
          <div className="flex items-center justify-start gap-3 px-4 py-0">
            <div className="text-[#0084ff] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-stone-800 leading-tight">
              Verified & Experienced Pandits
            </span>
          </div>
          <div className="flex items-center justify-start gap-3 px-4 py-0">
            <div className="text-accent shrink-0">
              <Landmark className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-stone-800 leading-tight">
              Pujas Performed in Sacred Temples
            </span>
          </div>
          <div className="flex items-center justify-start gap-3 px-4 py-0">
            <div className="text-[#d97706] shrink-0">
              <Scroll className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-stone-800 leading-tight">
              100% Authentic Vedic Rituals
            </span>
          </div>
        </div>
      </div>
    </section >
  );
}