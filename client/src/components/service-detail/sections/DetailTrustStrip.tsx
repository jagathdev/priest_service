"use client";

import React from "react";
import { ShieldCheck, Video, Users, Sparkles } from "lucide-react";

interface DetailTrustStripProps {
  trustBadges?: string[];
  serviceType: "puja" | "homa";
}

export default function DetailTrustStrip({ trustBadges, serviceType }: DetailTrustStripProps) {
  const defaultBadges = [
    {
      icon: <Video className="w-4 h-4 text-[#C2410C]" />,
      text: `${serviceType === "homa" ? "Homa" : "Puja"} Video Proof Delivered Within 48 hrs`,
    },
    {
      icon: <Users className="w-4 h-4 text-[#C2410C]" />,
      text: "Verified & Experienced Vedic Pandits",
    },
    {
      icon: <ShieldCheck className="w-4 h-4 text-[#C2410C]" />,
      text: "100% Authentic Vedic Fire & Temple Rituals",
    },
    {
      icon: <Sparkles className="w-4 h-4 text-[#C2410C]" />,
      text: "Personalized Sankalpam with Gotra & Wish",
    },
  ];

  const badges = trustBadges && trustBadges.length > 0
    ? trustBadges.map((b, i) => ({
        icon: defaultBadges[i % defaultBadges.length].icon,
        text: b,
      }))
    : defaultBadges;

  return (
    <div className="bg-[#FFFDF9] border-y border-[#ECD9C3] py-3.5 my-6">
      <div className="max-w-[1350px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {badges.slice(0, 4).map((badge, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 bg-white/80 border border-[#E8D5B5]/60 rounded-xl px-3 py-2 shadow-2xs"
            >
              <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-200/60 flex items-center justify-center shrink-0">
                {badge.icon}
              </div>
              <span className="text-xs sm:text-[12.5px] font-bold text-stone-800 leading-snug">
                {badge.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
