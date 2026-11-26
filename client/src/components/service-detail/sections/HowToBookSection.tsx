"use client";

import React from "react";
import { BookOpen } from "lucide-react";

interface HowToBookSectionProps {
  steps?: { stepNumber: number; title: string; description: string }[];
  serviceType: "puja" | "homa";
}

export default function HowToBookSection({ steps, serviceType }: HowToBookSectionProps) {
  const defaultSteps = [
    {
      stepNumber: 1,
      title: "Choose Package",
      description: `Select your preferred participation package (Individual, Couple, or Family) for this ${serviceType}.`,
    },
    {
      stepNumber: 2,
      title: "Provide Sankalpa Details",
      description: "Enter your Name, Gotra, Rashi, Nakshatra and special prayer requests during checkout.",
    },
    {
      stepNumber: 3,
      title: "Priest Performs Ritual",
      description: "Certified Vedic priests chant your sankalpam and perform all sacred offerings with devotion.",
    },
    {
      stepNumber: 4,
      title: "Receive Video & Prasad",
      description: "Get personalized ritual video recording on WhatsApp, followed by sacred energized prasad shipped to your home.",
    },
  ];

  const displaySteps = steps && steps.length > 0 ? steps : defaultSteps;

  return (
    <section id="how-to-book" className="scroll-mt-20 py-6 border-b border-stone-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-orange-100/70 text-[#C2410C] flex items-center justify-center">
          <BookOpen className="w-4 h-4" />
        </div>
        <h2 className="text-xl sm:text-2xl font-serif font-extrabold text-stone-900">
          How to Book
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displaySteps.map((s, idx) => (
          <div
            key={idx}
            className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs relative flex flex-col"
          >
            <div className="w-7 h-7 rounded-full bg-[#C2410C] text-white text-xs font-black flex items-center justify-center mb-2.5">
              {s.stepNumber || idx + 1}
            </div>
            <h3 className="font-extrabold text-stone-900 text-sm mb-1">{s.title}</h3>
            <p className="text-stone-600 text-xs leading-relaxed">{s.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
