"use client";

import React from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";

interface AboutSectionProps {
  title: string;
  aboutText?: string;
  inclusions?: string[];
  serviceType: "puja" | "homa";
}

export default function AboutSection({ title, aboutText, inclusions, serviceType }: AboutSectionProps) {
  if (!aboutText && (!inclusions || inclusions.length === 0)) return null;

  return (
    <section id="about" className="scroll-mt-20 py-6 border-b border-stone-200">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-orange-100/70 text-[#C2410C] flex items-center justify-center">
          <Sparkles className="w-4 h-4" />
        </div>
        <h2 className="text-xl sm:text-2xl font-serif font-extrabold text-stone-900">
          About {title}
        </h2>
      </div>

      {aboutText && (
        <p className="text-stone-700 text-sm sm:text-base leading-relaxed whitespace-pre-line mb-5">
          {aboutText}
        </p>
      )}

      {inclusions && inclusions.length > 0 && (
        <div className="bg-[#FFFDF9] border border-[#ECD9C3] rounded-2xl p-4 sm:p-5 mt-4">
          <h3 className="text-xs sm:text-sm font-extrabold text-[#C2410C] uppercase tracking-wider mb-3">
            What is Included in this {serviceType === "homa" ? "Homa" : "Puja"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {inclusions.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-stone-800">
                <CheckCircle2 className="w-4 h-4 text-[#00B05F] shrink-0 mt-0.5" />
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
