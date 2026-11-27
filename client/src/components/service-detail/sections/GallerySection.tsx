"use client";

import React from "react";
import Image from "next/image";
import { Images } from "lucide-react";

interface GallerySectionProps {
  gallery?: string[];
  onOpenLightbox: (index: number) => void;
}

export default function GallerySection({ gallery, onOpenLightbox }: GallerySectionProps) {
  if (!gallery || gallery.length === 0) return null;

  return (
    <section id="gallery" className="scroll-mt-20 py-6 pb-20">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-orange-100/70 text-[#C2410C] flex items-center justify-center">
          <Images className="w-4 h-4" />
        </div>
        <h2 className="text-xl sm:text-2xl font-serif font-extrabold text-stone-900">
          Sacred Ritual Gallery
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {gallery.map((img, idx) => (
          <div
            key={idx}
            onClick={() => onOpenLightbox(idx)}
            className="relative aspect-square rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
          >
            <Image
              src={img}
              alt={`Gallery image ${idx + 1}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              unoptimized
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
