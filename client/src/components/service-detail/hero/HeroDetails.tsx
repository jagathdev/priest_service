"use client";

import React from "react";
import Image from "next/image";
import { Calendar, Clock, MapPin, ChevronRight, Check } from "lucide-react";
import PriceTag from "@/components/ui/PriceTag";
import PujaCountdownCard from "@/components/common/PujaCountdownCard";
import WishlistButton from "@/components/common/WishlistButton";
import { formatDayDateMonth } from "@/lib/dateFormatter";
import { ServiceDetailData, ServicePackage } from "../types";

interface HeroDetailsProps {
  service: ServiceDetailData;
  serviceType: "puja" | "homa";
  packagesList: ServicePackage[];
  selectedPackageId: string | null;
  onSelectPackage: (pkgId: string) => void;
  onBookNow: () => void;
  heroCtaRef: React.RefObject<HTMLButtonElement | null>;
  onOpenShareModal: () => void;
}

export default function HeroDetails({
  service,
  serviceType,
  packagesList,
  selectedPackageId,
  onSelectPackage,
  onBookNow,
  heroCtaRef,
  onOpenShareModal,
}: HeroDetailsProps) {
  const selectedPackage = packagesList.find((p) => p.id === selectedPackageId) || packagesList[0];
  const activePrice = selectedPackage?.priceINR || service.priceINR || service.price || 0;
  const activeListPrice = selectedPackage?.listPriceINR || service.listPriceINR || service.listPrice;
  const topTag = service.shortTitle || service.subtitle || service.badge;
  const venueLocation = service.location || service.templeLocation || service.templeVenue || "Sacred Temple Venue";

  return (
    <div className="flex flex-col flex-1 w-full text-left">
      {/* Top Meta Tag & Actions */}
      <div className="flex items-center justify-between gap-2 mb-2 w-full">
        {topTag ? (
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[#C2410C] font-serif font-extrabold text-xs sm:text-[13px] tracking-wider uppercase flex items-center gap-1 truncate">
              <span className="text-[10px] shrink-0">♦</span>
              <span className="truncate">{topTag}</span>
              <span className="text-[10px] shrink-0">♦</span>
            </span>
          </div>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2 shrink-0">
          <WishlistButton
            itemId={service._id}
            className="w-8 h-8 rounded-full bg-stone-50 hover:bg-red-50 text-stone-600 hover:text-red-500 border border-stone-200/80 flex items-center justify-center transition-all shadow-2xs active:scale-95 cursor-pointer"
            iconClassName="w-4 h-4"
          />
          <button
            type="button"
            aria-label="Share service"
            onClick={onOpenShareModal}
            className="w-8 h-8 rounded-full bg-stone-50 hover:bg-stone-100 text-stone-600 hover:text-[#C2410C] border border-stone-200/80 flex items-center justify-center transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            <i className="fa-solid fa-share-nodes text-xs"></i>
          </button>
        </div>
      </div>

      {/* Main Title */}
      <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-serif font-extrabold text-gray-900 leading-tight mb-3">
        {service.title}
      </h1>

      {/* Description Snippet */}
      {service.description && (
        <p className="text-stone-600 text-sm sm:text-[15px] leading-relaxed mb-4">
          {service.description}
        </p>
      )}

      {/* Date, Time & Venue Card */}
      <div className="bg-gradient-to-b from-[#FFFDF9] to-[#FFF9F0] border border-[#ECD9C3] rounded-2xl p-3 shadow-xs space-y-2 mb-5">
        <div className="flex flex-wrap items-center gap-2.5">
          {service.date && (
            <div className="flex items-center gap-2 bg-white/95 border border-[#E8D5B5] rounded-xl px-2.5 py-1.5 shadow-2xs">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#E65100]/15 to-amber-100/60 text-[#C2410C] flex items-center justify-center shrink-0">
                <Calendar className="w-3 h-3 text-[#C2410C]" strokeWidth={2.2} />
              </div>
              <span className="text-xs sm:text-[12.5px] font-extrabold text-[#0B1E36]">
                {formatDayDateMonth(service.date) || service.date}
              </span>
            </div>
          )}

          {service.time && (
            <div className="flex items-center gap-2 bg-white/95 border border-[#E8D5B5] rounded-xl px-2.5 py-1.5 shadow-2xs">
              <div className="w-5 h-5 rounded-md bg-[#C2410C] text-white flex items-center justify-center shrink-0">
                <Clock className="w-3 h-3 text-amber-200" strokeWidth={2.2} />
              </div>
              <span className="text-xs sm:text-[12.5px] font-extrabold text-[#0B1E36]">
                {service.time}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 bg-white/95 border border-[#E8D5B5] rounded-xl px-2.5 py-1.5 shadow-2xs">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#E65100]/15 to-amber-100/60 text-[#C2410C] flex items-center justify-center shrink-0">
              <MapPin className="w-3 h-3 text-[#C2410C]" strokeWidth={2.2} />
            </div>
            <span className="text-xs sm:text-[12.5px] font-extrabold text-[#0B1E36] truncate">
              {venueLocation}
            </span>
          </div>
        </div>
      </div>

      {/* Countdown Timer if enabled */}
      {service.eventDateTime && (
        <div className="mb-5">
          <PujaCountdownCard eventDateTime={service.eventDateTime} />
        </div>
      )}

      {/* Select Participation Package */}
      {packagesList.length > 0 && (
        <div className="mb-6">
          <label className="block text-xs sm:text-sm font-extrabold text-stone-800 uppercase tracking-wider mb-2.5">
            Select {serviceType === "homa" ? "Homa" : "Puja"} Package
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {packagesList.map((pkg) => {
              const isSelected = (selectedPackageId ? selectedPackageId === pkg.id : packagesList[0].id === pkg.id);
              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => onSelectPackage(pkg.id)}
                  className={`p-3 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? "border-[#00B05F] bg-[#F1FBF5] shadow-xs"
                      : "border-stone-200/90 bg-white hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5 mb-1.5">
                    <span className="font-extrabold text-xs sm:text-sm text-stone-900 leading-snug">
                      {pkg.name}
                    </span>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-[#00B05F] text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  {pkg.devoteeCount && (
                    <span className="text-[11px] text-stone-500 font-medium block mb-2">
                      {pkg.devoteeCount}
                    </span>
                  )}
                  <PriceTag
                    sellingPrice={pkg.priceINR}
                    listPrice={pkg.listPriceINR}
                    sellingPriceClassName="text-sm sm:text-base font-black text-stone-900"
                    listPriceClassName="text-[10px] text-stone-400 line-through decoration-red-500 decoration-1"
                    className="flex items-baseline gap-1"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Hero Pricing & Book CTA Button */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-stone-200 mt-auto">
        <div>
          <PriceTag
            sellingPrice={activePrice}
            listPrice={activeListPrice}
            sellingPriceClassName="text-2xl sm:text-3xl font-black text-gray-900 leading-none"
            listPriceClassName="text-xs sm:text-sm font-bold text-stone-400 line-through decoration-red-500 decoration-1.5 ml-1"
            className="flex items-baseline gap-1 flex-wrap"
          />
          <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-1">
            Per Booking
          </div>
        </div>

        <button
          ref={heroCtaRef}
          type="button"
          onClick={onBookNow}
          className="bg-[#00B05F] hover:bg-[#008F4C] active:scale-95 text-white font-extrabold text-sm sm:text-base px-6 sm:px-8 py-3 rounded-full shadow-md shadow-[#00B05F]/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <span>{service.buttonText || (serviceType === "homa" ? "Book Homa" : "Book Puja")}</span>
          <ChevronRight className="w-4 h-4" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
