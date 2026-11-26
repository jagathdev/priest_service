"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface HeroBannerCarouselProps {
  bannerImages: string[];
  activeBannerIndex: number;
  setActiveBannerIndex: React.Dispatch<React.SetStateAction<number>>;
  title: string;
  badge?: string;
  onOpenLightbox: () => void;
}

export default function HeroBannerCarousel({
  bannerImages,
  activeBannerIndex,
  setActiveBannerIndex,
  title,
  badge,
  onOpenLightbox,
}: HeroBannerCarouselProps) {
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current || !touchStartY.current || !touchEndY.current) return;
    const diffX = touchStartX.current - touchEndX.current;
    const diffY = touchStartY.current - touchEndY.current;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX > 0) {
        // Swiped Left -> Next Image
        setActiveBannerIndex((prev) => (prev + 1) % bannerImages.length);
      } else {
        // Swiped Right -> Previous Image
        setActiveBannerIndex((prev) => (prev - 1 + bannerImages.length) % bannerImages.length);
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
    touchStartY.current = null;
    touchEndY.current = null;
  };

  return (
    <div className="w-full relative lg:sticky lg:top-24 flex flex-col items-center">
      <div
        className="relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden shadow-md border border-[#F0CA9E]/60 bg-stone-100 group select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {bannerImages.length > 0 && (
          <Image
            src={bannerImages[activeBannerIndex] || bannerImages[0]}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 45vw"
            unoptimized
            className="w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-[1.02]"
            priority
          />
        )}

        {/* Badge Tag if present */}
        {badge && (
          <div className="absolute top-3.5 left-3.5 z-10 bg-[#C2410C] text-white text-[11px] sm:text-xs font-black px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
            {badge}
          </div>
        )}

        {/* Zoom Lightbox Trigger */}
        <button
          type="button"
          onClick={onOpenLightbox}
          aria-label="View full image"
          className="absolute bottom-3.5 right-3.5 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md flex items-center justify-center transition-transform active:scale-90 cursor-pointer shadow-md"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Desktop / Tablet Navigation Arrows */}
        {bannerImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setActiveBannerIndex((prev) => (prev - 1 + bannerImages.length) % bannerImages.length)}
              aria-label="Previous image"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-stone-800 shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 active:scale-90 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setActiveBannerIndex((prev) => (prev + 1) % bannerImages.length)}
              aria-label="Next image"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-stone-800 shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 active:scale-90 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Carousel Dots */}
      {bannerImages.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {bannerImages.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveBannerIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                activeBannerIndex === idx ? "w-6 bg-[#C2410C]" : "w-2 bg-stone-300 hover:bg-stone-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
