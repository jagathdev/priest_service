"use client";

import React from "react";
import { Video, ShieldCheck, Landmark, Scroll } from "lucide-react";

export default function TrustStrip() {
  const badges = [
    { color: "text-success", icon: <Video className="w-5 h-5" />, text: "Puja Video Delivered Within 48 Hours" },
    { color: "text-[#0084ff]", icon: <ShieldCheck className="w-5 h-5" />, text: "Verified & Experienced Pandits" },
    { color: "text-accent", icon: <Landmark className="w-5 h-5" />, text: "Pujas Performed in Sacred Temples" },
    { color: "text-[#d97706]", icon: <Scroll className="w-5 h-5" />, text: "100% Authentic Vedic Rituals" }
  ];

  return (
    <div className="w-full max-w-[1350px] mx-auto px-3 min-[360px]:px-4 sm:px-6 md:px-8 lg:px-10 mb-8 sm:mb-12">
      <div className="relative z-10 border border-stone-200/90 bg-white/95 backdrop-blur-sm rounded-2xl p-3.5 sm:p-4.5 shadow-sm overflow-hidden">
        {/* Continuous Marquee on all screens below 1440px */}
        <div className="badge-marquee-below-1440 min-[1440px]:hidden overflow-hidden w-full relative">
          <div className="flex animate-marquee">
            <div className="flex shrink-0 items-center gap-8 sm:gap-12 pr-8 sm:pr-12">
              {badges.map((item, idx) => (
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
              {badges.map((item, idx) => (
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
            <div className="text-[#00B05F] shrink-0">
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
    </div>
  );
}
