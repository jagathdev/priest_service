"use client";

import { HelpCircle, AlertCircle } from "lucide-react";

interface WhenToDoSectionProps {
  items?: { title: string; description: string }[];
  serviceType: "puja" | "homa";
}

export default function WhenToDoSection({ items, serviceType }: WhenToDoSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <section id="when-to-do" className="scroll-mt-20 py-6 border-b border-stone-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-orange-100/70 text-[#C2410C] flex items-center justify-center">
          <HelpCircle className="w-4 h-4" />
        </div>
        <h2 className="text-xl sm:text-2xl font-serif font-extrabold text-stone-900">
          When to Perform this {serviceType === "homa" ? "Homa" : "Puja"}?
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 bg-[#FFFDF9] border border-[#ECD9C3] rounded-2xl p-3.5 shadow-2xs"
          >
            <div className="w-6 h-6 rounded-full bg-orange-100 text-[#C2410C] flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 text-sm mb-1">{item.title}</h3>
              <p className="text-stone-600 text-xs leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
