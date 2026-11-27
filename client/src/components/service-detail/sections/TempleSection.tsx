"use client";

import React from "react";
import Image from "next/image";
import { Landmark, MapPin } from "lucide-react";

interface TempleSectionProps {
  venue?: string;
  location?: string;
  image?: string;
  note?: string;
}

export default function TempleSection({ venue, location, image, note }: TempleSectionProps) {
  if (!venue && !location && !note && !image) return null;

  return (
    <section id="temple" className="scroll-mt-20 py-6 border-b border-stone-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-orange-100/70 text-[#C2410C] flex items-center justify-center">
          <Landmark className="w-4 h-4" />
        </div>
        <h2 className="text-xl sm:text-2xl font-serif font-extrabold text-stone-900">
          Sacred Temple Venue
        </h2>
      </div>

      <div className="bg-[#FFFDF9] border border-[#ECD9C3] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row gap-5 items-center">
        {image && (
          <div className="relative w-full md:w-1/3 aspect-[4/3] rounded-xl overflow-hidden shrink-0 shadow-xs border border-stone-200 bg-stone-100">
            <Image
              src={image}
              alt={venue || "Temple Venue"}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              unoptimized
              className="object-cover"
            />
          </div>
        )}
        <div className="flex-1 text-left">
          {venue && (
            <h3 className="text-lg font-serif font-extrabold text-stone-900 mb-1.5">{venue}</h3>
          )}
          {location && (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#C2410C] mb-2.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{location}</span>
            </div>
          )}
          {note && (
            <p className="text-stone-600 text-xs sm:text-[13px] leading-relaxed">{note}</p>
          )}
        </div>
      </div>
    </section>
  );
}
