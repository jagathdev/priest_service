"use client";

import React from "react";
import { Check, ShieldCheck } from "lucide-react";

interface DedicatedVedicCardProps {
  serviceType: "puja" | "homa";
}

export default function DedicatedVedicCard({ serviceType }: DedicatedVedicCardProps) {
  const isHoma = serviceType === "homa";
  const title = isHoma ? "Dedicated Vedic Homa" : "Dedicated Vedic Puja";
  const buttonText = isHoma ? "Get Free Homa Guidance" : "Get Free Puja Guidance";

  return (
    <div className="bg-[#FFFDF9] border border-[#ECD9C3] rounded-3xl p-5 sm:p-6 shadow-sm sticky top-24">
      {/* Header with Vedic Accent */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-[#E65100]/10 text-[#C2410C] flex items-center justify-center shrink-0 border border-[#F5D8B3]">
          <ShieldCheck className="w-5 h-5" strokeWidth={2.2} />
        </div>
        <div>
          <h3 className="font-serif font-extrabold text-stone-900 text-lg leading-tight">
            {title}
          </h3>
          <p className="text-stone-500 text-xs font-semibold mt-0.5">
            100% Authentic Rituals
          </p>
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-3 mb-5 text-left">
        <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-stone-700 leading-snug">
          <div className="w-4 h-4 rounded-full bg-[#00B05F]/15 text-[#00B05F] flex items-center justify-center shrink-0 mt-0.5">
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </div>
          <span>Personalized Sankalpam performed with your Name, Gotra & Wish</span>
        </div>

        <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-stone-700 leading-snug">
          <div className="w-4 h-4 rounded-full bg-[#00B05F]/15 text-[#00B05F] flex items-center justify-center shrink-0 mt-0.5">
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </div>
          <span>Full {isHoma ? "Homa" : "Puja"} Video Recording delivered on WhatsApp within 48 hours</span>
        </div>
      </div>

      <div className="w-full h-[1px] bg-[#ECD9C3]/80 my-4" />

      {/* Devotee Care WhatsApp Callout */}
      <div className="text-left">
        <h4 className="font-extrabold text-stone-900 text-xs sm:text-sm mb-1">
          Unsure which {isHoma ? "homa" : "puja"} to book?
        </h4>
        <p className="text-stone-600 text-xs mb-3.5 leading-relaxed font-medium">
          Our devotee care team is available 24/7. Reach them on WhatsApp.
        </p>

        <a
          href="https://wa.me/919677391109"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-[#00B05F] hover:bg-[#008F4C] active:scale-95 text-white font-extrabold text-xs sm:text-sm py-3 px-4 rounded-full transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <i className="fa-brands fa-whatsapp text-lg text-white"></i>
          <span>{buttonText}</span>
        </a>
      </div>
    </div>
  );
}
