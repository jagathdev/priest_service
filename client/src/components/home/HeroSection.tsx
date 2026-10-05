"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

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
}

const DEFAULT_IMAGE = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400'%3E%3Crect width='800' height='400' fill='%23cccccc'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%23333333'%3ENo Image Available%3C/text%3E%3C/svg%3E`;

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
      location: "",
      image: safeImage || DEFAULT_IMAGE,
      ctaText: item.cta?.text || "Book Puja Now",
      ctaLink: item.cta?.url || "/puja",
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

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % bannerSlides.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? bannerSlides.length - 1 : prev - 1));
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
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
        const expressBase = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priest-service.onrender.com";
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
  }, []);

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    if (bannerSlides.length === 0) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [bannerSlides.length]);

  if (isLoading) {
    return (
      <section className="relative w-full max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-10 pt-2 sm:pt-3 lg:pt-4 pb-8 md:pb-12 xl:py-12 bg-white my-0 sm:my-1 xl:my-2 overflow-hidden flex flex-col xl:flex-row items-center justify-between gap-6 lg:gap-8 xl:gap-14 animate-pulse">
        {/* Skeleton Left Content */}
        <div className="flex-1 w-full max-w-[640px] pt-2 pb-1 flex flex-col justify-between h-auto xl:min-h-[500px]">
          <div className="flex flex-col items-center xl:items-start w-full">
            {/* Top Badge */}
            <div className="w-32 h-6 bg-stone-200 rounded-full mb-5 hidden xl:block" />

            {/* Main Title */}
            <div className="w-full sm:w-[90%] xl:w-[80%] h-12 sm:h-14 xl:h-20 bg-stone-200 rounded-xl mb-4 xl:mb-5" />
            <div className="w-3/4 sm:w-[70%] xl:w-[60%] h-12 sm:h-14 xl:h-20 bg-stone-200 rounded-xl mb-6" />

            {/* Subtitle */}
            <div className="w-full sm:w-[85%] h-4 sm:h-5 bg-stone-100 rounded-full mb-3" />
            <div className="w-[90%] sm:w-[75%] h-4 sm:h-5 bg-stone-100 rounded-full mb-3" />
            <div className="w-[80%] sm:w-[60%] h-4 sm:h-5 bg-stone-100 rounded-full mb-8" />
          </div>

          <div className="mt-auto pt-4 lg:pt-6 flex flex-col items-center xl:items-start w-full">
            {/* CTA Button */}
            <div className="w-full max-w-[500px] sm:max-w-[540px] xl:max-w-[420px] h-14 sm:h-16 bg-[#00b050]/20 rounded-full mb-6" />

            {/* Social Proof Banner */}
            <div className="w-full max-w-[380px] sm:max-w-[400px] h-16 bg-stone-100 rounded-xl border border-stone-200" />
          </div>
        </div>

        {/* Skeleton Right Content (Image Card) */}
        <div className="w-full max-w-full lg:w-full xl:w-[650px] 2xl:w-[720px] shrink-0 flex flex-col items-center">
          <div className="w-full bg-stone-100 rounded-3xl border border-stone-200 h-[300px] sm:h-[400px] md:h-[460px] lg:h-[500px] flex items-center justify-center">
            <svg className="w-12 h-12 text-stone-200 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
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

  const current = bannerSlides[activeSlide];

  return (
    <section className="relative w-full max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-10 pt-2 sm:pt-3 lg:pt-4 pb-8 md:pb-12 xl:py-12 bg-white my-0 sm:my-1 xl:my-2 overflow-hidden">


      {/* Background Circular Mandala Watermark inside Hero */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] bg-center bg-no-repeat bg-contain z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'%3E%3Ccircle cx='250' cy='250' r='240' fill='none' stroke='%3C%238b1e10' stroke-width='1.5'/%3E%3Ccircle cx='250' cy='250' r='200' fill='none' stroke='%3C%238b1e10' stroke-width='1' stroke-dasharray='4 4'/%3E%3Ccircle cx='250' cy='250' r='160' fill='none' stroke='%3C%238b1e10' stroke-width='1.5'/%3E%3Ccircle cx='250' cy='250' r='110' fill='none' stroke='%3C%238b1e10' stroke-width='1'/%3E%3Cpath d='M250 10 L250 490 M10 250 L490 250 M80 80 L420 420 M420 80 L80 420' stroke='%3C%238b1e10' stroke-width='0.5'/%3E%3C/svg%3E")`
        }}
      />

      {/* Global Left/Right Arrow Buttons (Moved from image to section edges) */}
      {/* <button
        onClick={prevSlide}
        className="hidden xl:flex absolute left-2 top-1/2 -translate-y-1/2 z-40 w-12 h-12 bg-white hover:bg-stone-50 text-gray-800 rounded-full shadow-lg border border-stone-100 items-center justify-center transition-transform hover:scale-105"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="hidden xl:flex absolute right-2 top-1/2 -translate-y-1/2 z-40 w-12 h-12 bg-white hover:bg-stone-50 text-gray-800 rounded-full shadow-lg border border-stone-100 items-center justify-center transition-transform hover:scale-105"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
        </svg>
      </button> */}

      {/* ── Top Sub-header Badge (Above Hero Image on 1024px & Tablet < xl) ── */}
      <div className="xl:hidden flex items-center justify-center gap-2.5 mt-0.5 sm:mt-1 mb-2.5 sm:mb-3.5 z-10 relative">
        <svg className="w-5 h-5 text-[#F47820] shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C12 2 10.2 5.5 10.2 8C10.2 9.8 11 11.2 12 12C13 11.2 13.8 9.8 13.8 8C13.8 5.5 12 2 12 2Z" />
          <path d="M12 12C10.2 10.8 7.5 9.8 5.5 10.8C4 11.5 3 12.8 3 14.2C3 16.5 6.5 18 12 18.5C17.5 18 21 16.5 21 14.2C21 12.8 20 11.5 18.5 10.8C16.5 9.8 13.8 10.8 12 12Z" opacity="0.8" />
          <path d="M12 18.5C7.8 18.5 4.2 17 1.5 15.2C2.8 18.8 6.8 21.5 12 21.5C17.2 21.5 21.2 18.8 22.5 15.2C19.8 17 16.2 18.5 12 18.5Z" />
        </svg>
        <span className="text-[#F47820] font-bold text-xs sm:text-sm tracking-[0.15em] uppercase">
          {current.badge}
        </span>
      </div>

      <div
        className="relative z-10 flex flex-col-reverse xl:flex-row items-center justify-between gap-6 lg:gap-8 xl:gap-14 group"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={handleTouchEnd}
      >

        {/* Arrows moved down to the image section for perfect centering on mobile & desktop */}

        {/* ── Left Content (Text & CTA) ── Fixed starting point at top, space left above CTA button */}
        <div className="flex-1 text-center xl:text-left flex flex-col justify-between items-center xl:items-start h-auto min-h-0 xl:min-h-[500px] w-full max-w-[640px] pt-2 pb-1">

          {/* Top Block: Always starts at fixed top position */}
          <div className="flex flex-col items-center xl:items-start text-center xl:text-left w-full">
            {/* Top Sub-header Badge with Custom Vector Lotus SVG (Desktop XL only) */}
            <div className="hidden xl:flex items-center justify-start gap-2.5 mb-5">
              <svg className="w-5 h-5 text-[#F47820] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C12 2 10.2 5.5 10.2 8C10.2 9.8 11 11.2 12 12C13 11.2 13.8 9.8 13.8 8C13.8 5.5 12 2 12 2Z" />
                <path d="M12 12C10.2 10.8 7.5 9.8 5.5 10.8C4 11.5 3 12.8 3 14.2C3 16.5 6.5 18 12 18.5C17.5 18 21 16.5 21 14.2C21 12.8 20 11.5 18.5 10.8C16.5 9.8 13.8 10.8 12 12Z" opacity="0.8" />
                <path d="M12 18.5C7.8 18.5 4.2 17 1.5 15.2C2.8 18.8 6.8 21.5 12 21.5C17.2 21.5 21.2 18.8 22.5 15.2C19.8 17 16.2 18.5 12 18.5Z" />
              </svg>
              <span className="text-[#F47820] font-bold text-sm tracking-[0.15em] uppercase">
                {current.badge}
              </span>
            </div>

            {/* Main Title - Reduced font size and line height on 1024px & Tablet */}
            <h1 className="text-2xl sm:text-3xl lg:text-[34px] xl:text-[43px] font-serif font-semibold text-[#1f1a17] leading-snug sm:leading-tight lg:leading-[1.22] xl:leading-[1.28] tracking-normal mb-3 sm:mb-4 xl:mb-5 transition-all duration-300 max-w-[620px]">
              {current.title}
            </h1>

            {/* Subtitle / Description - Reduced font size and line height on 1024px & Tablet */}
            <p className="text-stone-600 text-xs sm:text-sm lg:text-base xl:text-[18px] leading-normal lg:leading-relaxed xl:leading-relaxed max-w-[580px] mx-auto xl:mx-0">
              {current.subtitle}
            </p>
          </div>

          {/* Bottom Block: CTA Button & Social Proof Banner */}
          <div className="mt-auto pt-4 lg:pt-6 flex flex-col items-center xl:items-start text-center xl:text-left w-full">
            {/* CTA Button - Full width on 1024px & Tablet */}
            <div className="mb-4 sm:mb-5 xl:mb-6 w-full flex justify-center xl:justify-start">
              <Link
                href={current.ctaLink}
                className="inline-flex items-center justify-between gap-4 sm:gap-6 bg-[#00b050] hover:bg-[#009b46] active:scale-95 text-white font-extrabold text-lg sm:text-xl xl:text-2xl px-6 sm:px-9 py-3.5 sm:py-4 rounded-full shadow-xl shadow-green-600/25 transition-all duration-200 group w-full max-w-[500px] sm:max-w-[540px] xl:max-w-[420px]"
              >
                <span>{current.ctaText}</span>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-[#00b050] flex items-center justify-center shadow-md group-hover:translate-x-0.5 transition-transform shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </div>

            {/* Social Proof / Trust Banner - Centered on 1024px & Tablet */}
            <div className="border border-stone-200/90 bg-white/95 backdrop-blur-sm rounded-xl p-2.5 sm:p-3 shadow-sm flex items-center justify-between gap-2 sm:gap-3.5 w-full max-w-[380px] sm:max-w-[400px] mx-auto xl:mx-0">
              {/* Sun Icon Section */}
              <div className="flex items-center gap-2 flex-1">
                <div className="text-stone-400 shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="4" strokeWidth="1.5" />
                    <path strokeWidth="1.5" strokeLinecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
                  </svg>
                </div>
                <p className="text-[10px] sm:text-[11px] text-stone-900 font-bold leading-tight text-left">
                  One of India's most<br />loved devotional<br />platforms
                </p>
              </div>

              <div className="w-[1px] h-6 bg-stone-200 shrink-0" />

              {/* Devotees Count */}
              <div className="text-center px-1 shrink-0">
                <p className="text-[#F47820] font-black text-base sm:text-lg leading-none">10L+</p>
                <p className="text-[9px] sm:text-[10px] text-stone-500 font-medium mt-0.5">Happy Devotees</p>
              </div>

              <div className="w-[1px] h-6 bg-stone-200 shrink-0" />

              {/* Secure Guarantee */}
              <div className="text-center px-1 shrink-0">
                <p className="text-[#F47820] font-black text-base sm:text-lg leading-none">100%</p>
                <p className="text-[9px] sm:text-[10px] text-stone-500 font-medium mt-0.5">Secure</p>
              </div>
            </div>
          </div>

        </div>

        {/* ── Right Content (Hero Banner Card) ── 100% Full width on 1024px & Tablet, fixed width on XL desktop ── */}
        <div className="w-full max-w-full lg:w-full xl:w-[650px] 2xl:w-[720px] shrink-0 flex flex-col items-center relative">

          {/* Left/Right Arrow Buttons (Mobile/Tablet only, since desktop uses global edges) */}
          <button
            onClick={prevSlide}
            className="xl:hidden absolute -left-3 sm:-left-5 lg:-left-7 top-[150px] sm:top-[200px] md:top-[230px] lg:top-[250px] -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-white hover:bg-stone-50 text-gray-800 rounded-full shadow-lg border border-stone-100 flex items-center justify-center transition-transform hover:scale-105"
            aria-label="Previous slide"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="xl:hidden absolute -right-3 sm:-right-5 lg:-right-7 top-[150px] sm:top-[200px] md:top-[230px] lg:top-[250px] -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-white hover:bg-stone-50 text-gray-800 rounded-full shadow-lg border border-stone-100 flex items-center justify-center transition-transform hover:scale-105"
            aria-label="Next slide"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Pure Full-Bleed Banner Card (Image Only, No Wordings) */}
          <Link
            href={current.ctaLink}
            className="w-full block relative rounded-3xl overflow-hidden shadow-2xl border border-stone-200 bg-[#160802] h-[300px] sm:h-[400px] md:h-[460px] lg:h-[500px] xl:h-[500px] shrink-0 transition-all duration-500 group cursor-pointer"
          >

            {/* Ambient Blurred Background (Fills Card Seamlessly) */}
            <Image
              key={`bg-${current.id}`}
              src={current.image}
              alt=""
              fill
              className="object-cover blur-2xl opacity-40 scale-110"
            />

            {/* Full Uncropped Main Image (Preserves Left/Right Text & Edges) */}
            <Image
              key={current.id}
              src={current.image}
              alt={current.title}
              fill
              className="object-contain object-center relative z-10 drop-shadow-lg"
              priority
            />

          </Link>

          {/* Slider Dots Navigation inside Hero */}
          <div className="flex items-center justify-center gap-2.5 mt-4 sm:mt-5">
            {bannerSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`transition-all duration-300 rounded-full ${index === activeSlide
                  ? "w-7 h-2 bg-[#00b050]"
                  : "w-2 h-2 bg-stone-300 hover:bg-stone-400"
                  }`}
              />
            ))}
          </div>

        </div>

      </div>

      {/* ── Bottom Features Trust Strip (Marquee on 1024px and Tablet screens) ── */}
      <div className="relative z-10 mt-8 md:mt-10 border border-stone-200/90 bg-white/95 backdrop-blur-sm rounded-2xl p-3.5 sm:p-4.5 shadow-sm overflow-hidden">
        {/* Continuous Marquee on 1024px and Tablet screens (< xl) */}
        <div className="xl:hidden overflow-hidden w-full relative">
          <div className="flex animate-marquee gap-8 sm:gap-12 items-center">
            {[
              { color: "text-[#00b050]", icon: <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />, text: "Puja Video Delivered Within 48 Hours" },
              { color: "text-[#0084ff]", icon: <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />, text: "Verified & Experienced Purohits" },
              { color: "text-[#F47820]", icon: <path d="M12 2L9 6H15L12 2ZM8 7L6 11H18L16 7H8ZM5 12L3 17H21L19 12H5ZM2 18V21H22V18H2Z" />, text: "Pujas Performed in Sacred Temples" },
              { color: "text-[#d97706]", icon: <path d="M12 2c-.55 0-1 .45-1 1v1.17C8.61 4.72 7 6.67 7 9c0 2.21 1.79 4 4 4v1H8c-.55 0-1 .45-1 1v5c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-5c0-.55-.45-1-1-1h-3v-1c2.21 0 4-1.79 4-4 0-2.33-1.61-4.28-4-4.83V3c0-.55-.45-1-1-1z" />, text: "100% Authentic Vedic Rituals" },
              { color: "text-[#00b050]", icon: <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />, text: "Puja Video Delivered Within 48 Hours" },
              { color: "text-[#0084ff]", icon: <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />, text: "Verified & Experienced Purohits" },
              { color: "text-[#F47820]", icon: <path d="M12 2L9 6H15L12 2ZM8 7L6 11H18L16 7H8ZM5 12L3 17H21L19 12H5ZM2 18V21H22V18H2Z" />, text: "Pujas Performed in Sacred Temples" },
              { color: "text-[#d97706]", icon: <path d="M12 2c-.55 0-1 .45-1 1v1.17C8.61 4.72 7 6.67 7 9c0 2.21 1.79 4 4 4v1H8c-.55 0-1 .45-1 1v5c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-5c0-.55-.45-1-1-1h-3v-1c2.21 0 4-1.79 4-4 0-2.33-1.61-4.28-4-4.83V3c0-.55-.45-1-1-1z" />, text: "100% Authentic Vedic Rituals" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 shrink-0 py-1">
                <div className={`${item.color} shrink-0`}>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    {item.icon}
                  </svg>
                </div>
                <span className="text-xs sm:text-sm font-bold text-stone-800 whitespace-nowrap">
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Original Grid on Desktop XL screens (>= 1280px) */}
        <div className="hidden xl:grid xl:grid-cols-4 items-center justify-between gap-2 divide-x divide-stone-200">
          <div className="flex items-center justify-start gap-3 px-4 py-0">
            <div className="text-[#00b050] shrink-0">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-stone-800 leading-tight">
              Puja Video Delivered Within 48 Hours
            </span>
          </div>
          <div className="flex items-center justify-start gap-3 px-4 py-0">
            <div className="text-[#0084ff] shrink-0">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-stone-800 leading-tight">
              Verified & Experienced Purohits
            </span>
          </div>
          <div className="flex items-center justify-start gap-3 px-4 py-0">
            <div className="text-[#F47820] shrink-0">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L9 6H15L12 2ZM8 7L6 11H18L16 7H8ZM5 12L3 17H21L19 12H5ZM2 18V21H22V18H2Z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-stone-800 leading-tight">
              Pujas Performed in Sacred Temples
            </span>
          </div>
          <div className="flex items-center justify-start gap-3 px-4 py-0">
            <div className="text-[#d97706] shrink-0">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2c-.55 0-1 .45-1 1v1.17C8.61 4.72 7 6.67 7 9c0 2.21 1.79 4 4 4v1H8c-.55 0-1 .45-1 1v5c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-5c0-.55-.45-1-1-1h-3v-1c2.21 0 4-1.79 4-4 0-2.33-1.61-4.28-4-4.83V3c0-.55-.45-1-1-1z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-stone-800 leading-tight">
              100% Authentic Vedic Rituals
            </span>
          </div>
        </div>
      </div>

    </section>
  );
}
