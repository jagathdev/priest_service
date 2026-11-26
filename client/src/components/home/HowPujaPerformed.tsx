"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function HowPujaPerformed() {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-[#fdfbf7] border-y border-[#f0e4d0] relative overflow-hidden">
      {/* Background Mandala Watermarks */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] bg-center bg-no-repeat bg-contain z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'%3E%3Ccircle cx='250' cy='250' r='240' fill='none' stroke='%3C%238b1e10' stroke-width='1.5'/%3E%3Ccircle cx='250' cy='250' r='200' fill='none' stroke='%3C%238b1e10' stroke-width='1' stroke-dasharray='4 4'/%3E%3Ccircle cx='250' cy='250' r='160' fill='none' stroke='%3C%238b1e10' stroke-width='1.5'/%3E%3C/svg%3E")`
        }}
      />

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 md:mb-14 px-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#221f20] tracking-tight leading-tight mb-3 sm:mb-3.5">
            How Your Puja <span className="text-accent">Is Performed</span>
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm md:text-base leading-relaxed sm:leading-relaxed font-medium">
            Book an authentic Vedic ritual from wherever you are. Our experienced priests perform the puja on your behalf, following traditional practices.
          </p>
        </div>

        {/* Process Container */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-3 lg:gap-5 relative z-10">
          {/* Step 1 */}
          <div className="flex flex-col items-center group text-center flex-1 w-full max-w-[210px]">
            <div className="w-24 h-24 sm:w-28 sm:h-28 relative mb-3 group-hover:scale-105 transition-all">
              <Image
                src="/images/step_1.png"
                alt="Choose Your Puja"
                fill
                sizes="(max-width: 640px) 96px, 112px"
                className="object-contain"
              />
            </div>
            <h3 className="font-serif font-bold text-[#221f20] text-sm sm:text-base leading-tight">
              Choose Your<span className="text-accent"> Puja</span>
            </h3>
          </div>

          {/* Arrow 1 (Desktop) */}
          <div className="hidden md:flex text-[#c68a36] shrink-0 mb-6">
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center group text-center flex-1 w-full max-w-[210px]">
            <div className="w-24 h-24 sm:w-28 sm:h-28 relative mb-3 group-hover:scale-105 transition-all">
              <Image
                src="/images/step_2.png"
                alt="Share Your Details"
                fill
                sizes="(max-width: 640px) 96px, 112px"
                className="object-contain"
              />
            </div>
            <h3 className="font-serif font-bold text-[#221f20] text-sm sm:text-base leading-tight">
              Share Your<span className="text-accent"> Details</span>
            </h3>
          </div>

          {/* Arrow 2 (Desktop) */}
          <div className="hidden md:flex text-[#c68a36] shrink-0 mb-6">
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center group text-center flex-1 w-full max-w-[210px]">
            <div className="w-24 h-24 sm:w-28 sm:h-28 relative mb-3 group-hover:scale-105 transition-all">
              <Image
                src="/images/step_3.png"
                alt="Puja Is Performed"
                fill
                sizes="(max-width: 640px) 96px, 112px"
                className="object-contain"
              />
            </div>
            <h3 className="font-serif font-bold text-[#221f20] text-sm sm:text-base leading-tight">
              Priest Performs <span className="text-accent">the Puja</span>
            </h3>
          </div>

          {/* Arrow 3 (Desktop) */}
          <div className="hidden md:flex text-[#c68a36] shrink-0 mb-6">
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center group text-center flex-1 w-full max-w-[210px]">
            <div className="w-24 h-24 sm:w-28 sm:h-28 relative mb-3 group-hover:scale-105 transition-all">
              <Image
                src="/images/step_4.png"
                alt="Receive Your Puja Video"
                fill
                sizes="(max-width: 640px) 96px, 112px"
                className="object-contain"
              />
            </div>
            <h3 className="font-serif font-bold text-[#221f20] text-sm sm:text-base leading-tight">
              Receive <span className="text-accent">Your Puja Video</span>
            </h3>
          </div>
        </div>
      </div>
    </section>
  );
}
