"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import PriceTag from "@/components/ui/PriceTag";

interface BottomStickyBarProps {
  showStickyBar: boolean;
  title: string;
  priceVal: number;
  listPriceVal?: number;
  buttonText?: string;
  onBookNow: () => void;
}

export default function BottomStickyBar({
  showStickyBar,
  title,
  priceVal,
  listPriceVal,
  buttonText,
  onBookNow,
}: BottomStickyBarProps) {
  const [isNearFooter, setIsNearFooter] = useState(false);

  useEffect(() => {
    const footerEl = document.querySelector("footer");
    if (!footerEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // If the footer is entering the viewport, hide the floating sticky bar
        setIsNearFooter(entry.isIntersecting);
      },
      {
        rootMargin: "0px 0px 80px 0px",
        threshold: 0,
      }
    );

    observer.observe(footerEl);
    return () => observer.disconnect();
  }, []);

  const isVisible = showStickyBar && !isNearFooter;

  return (
    <div
      style={{
        bottom: "calc(74px + env(safe-area-inset-bottom, 0px))",
      }}
      className={`fixed lg:!bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-[1250px] transition-all duration-300 transform ${
        isVisible
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-12 opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-[#00B05F] text-white rounded-2xl sm:rounded-3xl p-2.5 sm:py-3.5 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 shadow-2xl shadow-slate-950/30 border border-slate-700/30 backdrop-blur-md">
        {/* Left: Sparkles Icon + Title + Price */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white text-[#00B05F] flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#00B05F]" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] sm:text-xs font-extrabold text-slate-100 tracking-wider uppercase block truncate max-w-[120px] sm:max-w-none">
              {title}
            </span>
            <PriceTag
              sellingPrice={priceVal}
              listPrice={listPriceVal}
              sellingPriceClassName="text-base sm:text-2xl font-black text-white block leading-tight whitespace-nowrap"
              listPriceClassName="text-xs sm:text-sm font-semibold text-slate-200 line-through decoration-red-400 decoration-1.5 mr-1.5 whitespace-nowrap"
              className="flex items-baseline gap-1.5 flex-wrap mt-0.5"
            />
          </div>
        </div>

        {/* Right: White Pill Button with Green Circle Arrow */}
        <button
          type="button"
          onClick={onBookNow}
          className="bg-white hover:bg-slate-100 active:scale-95 text-[#00B05F] font-extrabold text-xs sm:text-sm px-3 sm:px-6 py-2 sm:py-2.5 rounded-full shadow-md transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap cursor-pointer"
        >
          <span className="max-w-[125px] sm:max-w-none truncate">{buttonText || "Book Now"}</span>
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#00B05F] text-white flex items-center justify-center shrink-0">
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" strokeWidth={3} />
          </div>
        </button>
      </div>
    </div>
  );
}
