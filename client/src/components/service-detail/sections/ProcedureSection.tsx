"use client";

import React from "react";
import { Flame } from "lucide-react";

interface ProcedureSectionProps {
  process?: { title: string; description: string }[];
  serviceType: "puja" | "homa";
}

export default function ProcedureSection({ process, serviceType }: ProcedureSectionProps) {
  if (!process || process.length === 0) return null;

  return (
    <section id="process" className="scroll-mt-20 py-6 border-b border-stone-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-orange-100/70 text-[#C2410C] flex items-center justify-center">
          <Flame className="w-4 h-4" />
        </div>
        <h2 className="text-xl sm:text-2xl font-serif font-extrabold text-stone-900">
          Vedic {serviceType === "homa" ? "Homa" : "Puja"} Procedure
        </h2>
      </div>

      <div className="space-y-3">
        {process.map((step, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3.5 bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs"
          >
            <div className="w-7 h-7 rounded-full bg-[#C2410C]/10 text-[#C2410C] font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
              {idx + 1}
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 text-sm mb-1">{step.title}</h3>
              <p className="text-stone-600 text-xs sm:text-[13px] leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
