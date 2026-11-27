"use client";

import React from "react";
import { Award, Check } from "lucide-react";

interface BenefitsSectionProps {
  benefits?: { title: string; description: string }[];
  serviceType: "puja" | "homa";
}

export default function BenefitsSection({ benefits, serviceType }: BenefitsSectionProps) {
  if (!benefits || benefits.length === 0) return null;

  return (
    <section id="benefits" className="scroll-mt-20 py-6 border-b border-stone-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-orange-100/70 text-[#C2410C] flex items-center justify-center">
          <Award className="w-4 h-4" />
        </div>
        <h2 className="text-xl sm:text-2xl font-serif font-extrabold text-stone-900">
          Sacred Benefits of {serviceType === "homa" ? "Homa" : "Puja"}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {benefits.map((b, idx) => (
          <div
            key={idx}
            className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-shadow flex items-start gap-3"
          >
            <div className="w-6 h-6 rounded-full bg-[#00B05F]/15 text-[#00B05F] flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 text-sm mb-1">{b.title}</h3>
              <p className="text-stone-600 text-xs leading-relaxed">{b.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
