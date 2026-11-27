"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Loader2,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Share2,
} from "lucide-react";
import WishlistButton from "@/components/common/WishlistButton";
import ShareModal, { ShareData } from "@/components/common/ShareModal";
import { formatDayDateMonth } from "@/lib/dateFormatter";
import { formatStartingPrice, getPriceComparison } from "@/lib/pricing";
import PriceTag from "@/components/ui/PriceTag";

interface PujaListingProps {
  initialPujas?: any[];
  limit?: number;
}

export default function PujaListing({ initialPujas, limit = 3 }: PujaListingProps) {
  const [allPujas, setAllPujas] = useState<any[]>(initialPujas || []);
  const [fetchedPujas, setFetchedPujas] = useState(Boolean(initialPujas && initialPujas.length > 0));
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState<ShareData>({});

  useEffect(() => {
    async function fetchData() {
      const expressBase = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
      if (!initialPujas || initialPujas.length === 0) {
        try {
          const res = await fetch(`${expressBase}/api/pujas`);
          if (res.ok) {
            const data = await res.json();
            const rawList = data?.data && Array.isArray(data.data)
              ? data.data
              : Array.isArray(data)
                ? data
                : [];
            const activeList = rawList.filter((item: any) => !item.status || item.status === "active");
            setAllPujas(activeList);
          }
        } catch (err) {
          console.error("Failed to fetch pujas on client:", err);
        } finally {
          setFetchedPujas(true);
        }
      }
    }
    fetchData();
  }, [initialPujas]);

  // Display customizable number of pujas on the home page (minimum 3 if not specified)
  const count = typeof limit === "number" ? Math.max(3, limit) : 3;
  const displayedPujas = React.useMemo(() => {
    return allPujas.slice(0, count);
  }, [allPujas, count]);

  return (
    <section className="py-12 bg-white">
      <div className="max-w-[1350px] mx-auto px-3 min-[360px]:px-4 sm:px-6 lg:px-10">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#221f20] font-serif">
            Our <span className="text-accent">Pujas</span>
          </h2>
          <Link
            href="/puja"
            className="text-xs sm:text-sm font-bold text-[#00B05F] hover:text-[#008F4C] flex items-center gap-1 transition-colors"
          >
            <span>View All Pujas</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Puja Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 w-full max-w-full xl:max-w-none mx-auto">
          {!fetchedPujas ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="bg-white rounded-3xl h-[450px] animate-pulse border border-stone-200 p-3 shadow-sm flex flex-col"
              >
                <div className="w-full aspect-[3/2] bg-stone-100 rounded-xl min-[375px]:rounded-2xl mb-4 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-stone-300 animate-spin" />
                </div>
                <div className="w-1/3 h-3 bg-stone-200 rounded-full mx-auto mb-4" />
                <div className="w-3/4 h-5 bg-stone-200 rounded-full mb-3" />
                <div className="w-1/2 h-4 bg-stone-100 rounded-full mb-auto" />
                <div className="flex justify-between items-end mt-4">
                  <div className="w-20 h-6 bg-stone-200 rounded-full" />
                  <div className="w-32 h-10 bg-success/20 rounded-full" />
                </div>
              </div>
            ))
          ) : displayedPujas.length === 0 ? (
            <div className="col-span-full py-12 text-center text-stone-400 font-medium">
              No active Pujas available at this moment.
            </div>
          ) : (
            displayedPujas.map((p) => {
              const priceVal = formatStartingPrice(p);
              const priceInfo = getPriceComparison(p);
              const slugVal =
                p.slug ||
                (p.title
                  ? p.title
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9\s-]/g, "")
                    .replace(/\s+/g, "-")
                  : "");
              const topTagVal = p.badge || p.shortTitle || p.subtitle;
              const descriptionVal = p.description || p.subtitle;
              const venueVal = p.templeVenue || p.details?.templeName || p.templeName || "";
              const locVal = p.location || p.filterLocation || p.templeLocation || p.details?.templeLocation || "";
              const occasionVal = p.subtitle || p.occasion || p.dateOccasion || p.badge || "";

              return (
                <div key={p._id} className="flex flex-col">
                  <PujaCard
                    id={p._id}
                    imageSrc={
                      p.imageUrl
                        ? p.imageUrl.startsWith("http") || p.imageUrl.startsWith("/")
                          ? p.imageUrl
                          : `/${p.imageUrl}`
                        : ""
                    }
                    topTag={topTagVal}
                    title={p.title}
                    subtitle={descriptionVal}
                    templeVenue={venueVal}
                    location={locVal}
                    date={p.date}
                    time={p.time}
                    buttonText={p.buttonText}
                    dateOccasion={occasionVal}
                    price={priceVal}
                    listPrice={priceInfo.listPrice}
                    sellingPriceNum={priceInfo.sellingPrice}
                    slug={slugVal}
                    onShare={(sharePayload) => {
                      setShareData(sharePayload);
                      setShareModalOpen(true);
                    }}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        data={shareData}
      />
    </section>
  );
}

interface PujaCardProps {
  id: string;
  imageSrc: string | { src: string };
  topTag: string;
  title: string;
  subtitle: string;
  templeVenue?: string;
  location?: string;
  date: string;
  time?: string;
  buttonText?: string;
  dateOccasion?: string;
  price: string | number;
  listPrice?: number | null;
  sellingPriceNum?: number | null;
  slug?: string;
  onShare?: (data: ShareData) => void;
}

function PujaCard({
  id,
  imageSrc,
  topTag,
  title,
  subtitle,
  templeVenue,
  location,
  date,
  dateOccasion,
  time,
  buttonText,
  price,
  listPrice,
  sellingPriceNum,
  slug,
  onShare,
}: PujaCardProps) {
  const cardUrl = slug ? `/puja/${slug}` : "/puja";
  const srcStr = typeof imageSrc === "string" ? imageSrc : (imageSrc as any)?.src;
  const rawImg = (() => {
    try {
      return encodeURI(decodeURI(srcStr));
    } catch {
      return encodeURI(srcStr);
    }
  })();

  const mainVenue = templeVenue || location || "Sacred Temple Venue";
  const subLocation = location && location !== mainVenue ? location : "";

  return (
    <div className="bg-white rounded-2xl min-[375px]:rounded-3xl border border-stone-200/90 p-2 min-[375px]:p-2.5 sm:p-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.12),0_2px_6px_-1px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.18),0_8px_10px_-6px_rgba(0,0,0,0.1)] transition-all duration-300 flex flex-col group text-left relative h-full">
      <Link href={cardUrl} prefetch={true} className="flex flex-col flex-1 cursor-pointer">
        {/* Top Banner Image Container: 100% full uncropped natural 3:2 ratio on all screens including 320px mobile */}
        <div
          style={{ aspectRatio: "3 / 2" }}
          className="relative w-full aspect-[3/2] rounded-xl min-[375px]:rounded-2xl overflow-hidden mb-2 sm:mb-2.5 bg-[#3b0808] shrink-0"
        >
          <Image
            src={rawImg}
            alt={title}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="w-full h-full object-cover object-center -webkit-backface-visibility-hidden"
          />
        </div>

        {/* Card Body Container */}
        <div className="p-1 sm:px-1.5 flex flex-col flex-1">
          {/* Sub-header Tag with Filigree Accents */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-[1px] bg-accent/40" />
            <span className="text-accent font-serif font-extrabold text-xs sm:text-[13px] tracking-wider uppercase flex items-center gap-1.5 text-center">
              <span className="text-[10px]">♦</span> {topTag} <span className="text-[10px]">♦</span>
            </span>
            <div className="w-8 h-[1px] bg-accent/40" />
          </div>

          {/* Card Title */}
          <h3 className="font-serif font-bold text-[#1f1a17] text-lg sm:text-xl lg:text-2xl leading-tight sm:leading-snug tracking-tight mb-2 line-clamp-2 min-h-[56px] flex items-center">
            {title}
          </h3>

          {/* Subtitle / Description */}
          <p className="text-stone-600 text-xs sm:text-sm font-medium leading-relaxed mb-3 line-clamp-3 overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] min-h-[60px]">
            {subtitle}
          </p>

          {/* Location & Date Details Box */}
          <div className="bg-gradient-to-b from-[#FFFDF9] to-[#FFF9F0] border border-[#ECD9C3] rounded-2xl p-2.5 sm:p-3 shadow-xs space-y-1.5 mt-auto mb-3.5">
            {/* Row 1: Puja Date & Occasion */}
            <div className="flex items-center gap-2.5 bg-white/95 border border-[#E8D5B5] rounded-xl px-2.5 py-1.5 shadow-2xs min-w-0 transition-all hover:border-[#D99B52]">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#E65100]/15 via-[#F97316]/10 to-amber-100/60 border border-[#F0CA9E] flex items-center justify-center shrink-0 shadow-2xs text-[#C2410C]">
                <Calendar className="w-3.5 h-3.5 text-[#C2410C]" strokeWidth={2.2} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs sm:text-[12.5px] font-extrabold text-[#0B1E36] leading-tight">
                  {formatDayDateMonth(date) || date}
                </span>
                {dateOccasion && (
                  <span className="block text-[10px] sm:text-[10.5px] text-stone-600 font-medium leading-normal mt-0.5 truncate pb-0.5">
                    {dateOccasion}
                  </span>
                )}
              </div>
            </div>

            {/* Row 2: Puja Time */}
            {time && (
              <div className="flex items-center gap-2.5 bg-gradient-to-br from-[#FFF9EE] via-[#FFF3E0] to-[#FFF9EE] border border-[#F0CA9E] rounded-xl px-2.5 py-1.5 shadow-2xs min-w-0 transition-all hover:border-[#D99B52]">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#C2410C] to-[#E65100] flex items-center justify-center shrink-0 shadow-xs text-white">
                  <Clock className="w-3.5 h-3.5 text-amber-200" strokeWidth={2.2} />
                </div>
                <div className="min-w-0 flex-1 flex items-baseline justify-between gap-2">
                  <span className="block text-xs sm:text-[12.5px] font-extrabold text-[#0B1E36] leading-tight">
                    {time}
                  </span>
                </div>
              </div>
            )}

            {/* Horizontal Divider */}
            <div className="w-full h-[1px] bg-[#ECD9C3]/70" />

            {/* Row 3: Temple Venue & Location */}
            <div className="flex items-center gap-2 bg-white/90 border border-[#EADBCC]/80 rounded-xl px-2.5 py-1.5 shadow-2xs">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#E65100]/10 to-[#F97316]/15 text-[#C2410C] flex items-center justify-center shrink-0 border border-[#F5D8B3]">
                <MapPin className="w-3 h-3" strokeWidth={2.2} />
              </div>
              <div className="flex items-baseline gap-1.5 truncate">
                <span className="font-extrabold text-[#0B1E36] text-[11.5px] sm:text-xs truncate leading-tight">
                  {mainVenue}
                </span>
                {subLocation && (
                  <span className="text-stone-600 font-medium text-[10.5px] sm:text-[11px] truncate">
                    • {subLocation}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Footer Row: Price + Participate Button */}
          <div className="flex items-center justify-between pt-0.5">
            <div>
              <PriceTag
                sellingPrice={sellingPriceNum ?? price}
                listPrice={listPrice}
                sellingPriceClassName="font-extrabold text-2xl sm:text-3xl text-[#1f1a17] leading-none block"
                listPriceClassName="text-sm font-bold text-stone-400 line-through decoration-red-500 decoration-1.5 ml-1"
                className="flex items-baseline gap-1.5 flex-wrap"
              />
              <span className="text-xs text-stone-500 font-semibold mt-0.5 block">Per Booking</span>
            </div>

            <div className="inline-flex items-center gap-2 bg-[#00B05F] hover:bg-[#008F4C] active:scale-95 text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 sm:py-3 rounded-full shadow-md shadow-[#00B05F]/20 transition-all duration-200 group/btn">
              <span>{buttonText || "Book My Puja"}</span>
              <div className="w-5 h-5 rounded-full bg-white text-[#00B05F] flex items-center justify-center shrink-0">
                <ChevronRight className="w-3.5 h-3.5 text-[#00B05F]" strokeWidth={3} />
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Top Right Floating Action Buttons (Wishlist & Share) */}
      <div className="absolute top-5 right-5 flex flex-col gap-2 z-10">
        {id && <WishlistButton itemId={id} />}

        <button
          type="button"
          aria-label="Share puja"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onShare?.({
              title,
              description: subtitle,
              location,
              url: window.location.origin + cardUrl,
            });
          }}
          className="w-8 h-8 rounded-full bg-white/95 text-stone-700 hover:text-success flex items-center justify-center shadow-md backdrop-blur-sm transition-transform active:scale-95 hover:bg-white cursor-pointer"
        >
          <Share2 className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
