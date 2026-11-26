"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { SparklesIcon } from "@heroicons/react/24/outline";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Calendar,
  ChevronRight,
  Share2,
  Clock,
} from "lucide-react";
import WishlistButton from "@/components/common/WishlistButton";
import { formatDayDateMonth } from "@/lib/dateFormatter";
import { formatStartingPrice, getPriceComparison } from "@/lib/pricing";
import PriceTag from "@/components/ui/PriceTag";
import ShareModal, { ShareData } from "@/components/common/ShareModal";
import PujaFilterModal, {
  FilterState,
  defaultFilters,
  FilterGroup,
} from "@/components/common/PujaFilterModal";

export interface ServiceItem {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  badge?: string;
  shortTitle?: string;
  buttonText?: string;
  location?: string;
  date?: string;
  time?: string;
  slug?: string;
  packages?: Array<{
    priceINR?: number | string;
    price?: number | string;
    [key: string]: unknown;
  }>;
  price?: number | string;
  priceINR?: number | string;
  sellingPrice?: number | string;
  listPriceINR?: number | string;
  details?: {
    benefits?: { title: string; description: string }[];
    templeLocation?: string;
    templeName?: string;
  };
  deity?: string;
  tithis?: string;
  dosha?: string;
  benefit?: string;
  filterLocation?: string;
  productId?: number;
  status?: string;
}

export interface ServiceListingPageProps {
  serviceType: "puja" | "homa";
  initialItems?: ServiceItem[];
  heroTitle: {
    heading: string;
    highlight: string;
    trailing: string;
  };
  heroSubtitle: string;
  searchPlaceholder: string;
  sectionTitle: string;
  defaultButtonText: string;
  apiEndpoint: string;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const getSafeImageUrl = (imageUrl?: string): string => {
  if (!imageUrl || typeof imageUrl !== "string") return "";
  const trimmed = imageUrl.trim();
  if (!trimmed) return "";

  const safeEncode = (url: string) => {
    try {
      return encodeURI(decodeURI(url));
    } catch {
      return encodeURI(url);
    }
  };
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) {
    return safeEncode(trimmed);
  }
  if (trimmed.startsWith("/")) {
    return safeEncode(trimmed);
  }
  return `/${safeEncode(trimmed)}`;
};

/** Returns true if the service item matches ALL active filters and search query */
function itemMatchesFilters(
  item: ServiceItem,
  filters: FilterState,
  searchQuery: string,
  filterGroups: FilterGroup[]
): boolean {
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    const searchMatches = [
      item.title,
      item.shortTitle,
      item.subtitle,
      item.description,
      item.location,
      item.badge,
    ]
      .filter(Boolean)
      .some((text) => text?.toLowerCase().includes(q));
    if (!searchMatches) return false;
  }

  const fieldMapping: Record<string, keyof ServiceItem> = {
    Deity: "deity",
    Tithis: "tithis",
    Dosha: "dosha",
    Benefit: "benefit",
    Benefits: "benefit",
    Location: "filterLocation",
  };

  for (const group of filterGroups) {
    const selectedValues = filters[group.label] || [];
    if (selectedValues.length === 0) continue;

    const fieldName = fieldMapping[group.label];
    if (!fieldName) continue;

    let itemValue = (item[fieldName] as string) || "";
    if (group.label === "Location" && !itemValue) {
      itemValue = item.location || "";
    }

    if (!itemValue) return false;

    const itemTokens = itemValue
      .split(/[,/]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const matchesGroup = selectedValues.some((val) =>
      itemTokens.includes(val.trim().toLowerCase())
    );

    if (!matchesGroup) return false;
  }

  return true;
}

export default function ServiceListingPage({
  serviceType,
  initialItems = [],
  heroTitle,
  heroSubtitle,
  searchPlaceholder,
  sectionTitle,
  defaultButtonText,
  apiEndpoint,
}: ServiceListingPageProps) {
  const [allItems, setAllItems] = useState<ServiceItem[]>(initialItems);
  const [fetched, setFetched] = useState(Boolean(initialItems && initialItems.length > 0));
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterModalInitialTab, setFilterModalInitialTab] = useState<string>("");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState<ShareData>({});

  // Client-side fallback fetch if initialItems wasn't preloaded
  useEffect(() => {
    async function fetchItems() {
      if (initialItems && initialItems.length > 0) return;
      try {
        const expressBase = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
        const res = await fetch(`${expressBase}${apiEndpoint}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        const rawList = data?.data && Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
        setAllItems(rawList.filter((item: any) => !item.status || item.status === "active"));
      } catch (err) {
        console.error(`Error fetching ${serviceType} items:`, err);
      } finally {
        setFetched(true);
      }
    }
    fetchItems();
  }, [initialItems, apiEndpoint, serviceType]);

  // Compute dynamic filter groups from items
  const dynamicFilterGroups = useMemo(() => {
    const parseTokens = (val: unknown): string[] => {
      if (!val) return [];
      if (Array.isArray(val)) {
        return val.flatMap((v) => parseTokens(v));
      }
      if (typeof val === "string") {
        return val
          .split(/[,/]+/)
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return [];
    };

    const deities = Array.from(new Set(allItems.flatMap((p) => parseTokens(p.deity)))).filter(Boolean);
    const tithis = Array.from(new Set(allItems.flatMap((p) => parseTokens(p.tithis)))).filter(Boolean);
    const doshas = Array.from(new Set(allItems.flatMap((p) => parseTokens(p.dosha)))).filter(Boolean);
    const benefits = Array.from(
      new Set(
        allItems.flatMap((p) => [
          ...parseTokens(p.benefit),
          ...(p.details?.benefits?.map((b) => b.title) || []),
        ])
      )
    ).filter(Boolean);
    const locations = Array.from(
      new Set(allItems.flatMap((p) => parseTokens(p.filterLocation || p.location)))
    ).filter(Boolean);

    const groups: FilterGroup[] = [];
    if (deities.length > 0) {
      groups.push({
        label: "Deity",
        options: deities.map((v) => ({ value: v })),
      });
    }
    if (tithis.length > 0) {
      groups.push({
        label: "Tithis",
        options: tithis.map((v) => ({ value: v })),
      });
    }
    if (doshas.length > 0) {
      groups.push({
        label: "Dosha",
        options: doshas.map((v) => ({ value: v })),
      });
    }
    if (benefits.length > 0) {
      groups.push({
        label: "Benefit",
        options: benefits.map((v) => ({ value: v })),
      });
    }
    if (locations.length > 0) {
      groups.push({
        label: "Location",
        options: locations.map((v) => ({ value: v })),
      });
    }

    return groups;
  }, [allItems]);

  // Handle ?filter=... param in URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const filterParam = params.get("filter");
      if (filterParam) {
        const found = dynamicFilterGroups.find(
          (g) => g.label.toLowerCase() === filterParam.toLowerCase()
        );
        const modalTab = found ? found.label : filterParam.toLowerCase() === "location" ? "Location" : "";
        if (modalTab) {
          const timeoutId = setTimeout(() => {
            openFilterModal(modalTab);
          }, 0);
          return () => clearTimeout(timeoutId);
        }
      }
    }
  }, [dynamicFilterGroups]);

  const hasActiveFilters = Object.values(filters).some((vals) => vals.length > 0);

  const clearFilters = () => setFilters(defaultFilters);

  const openFilterModal = (tabLabel?: string) => {
    setFilterModalInitialTab(tabLabel || "");
    setIsFilterModalOpen(true);
  };

  const applyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    setIsFilterModalOpen(false);
  };

  // Filter items
  const displayedItems = useMemo(() => {
    return allItems.filter((item) =>
      itemMatchesFilters(item, filters, searchQuery, dynamicFilterGroups)
    );
  }, [allItems, filters, searchQuery, dynamicFilterGroups]);

  const routePrefix = serviceType === "homa" ? "/homa/" : "/puja/";

  return (
    <>
      <Navbar />

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        data={shareData}
      />

      <main className="min-h-screen">
        {/* Hero Section - Light Sacred Sandalwood Theme */}
        <div className="bg-gradient-to-b from-[#fff6ef] via-[#fdeee0] to-[#f9e3d0] py-12 md:py-16 text-center border-b border-[#fcd5b5] relative overflow-hidden">
          {/* Left Inverted Mandala Decoration */}
          <div className="absolute left-0 top-0 bottom-0 h-full pointer-events-none opacity-50 z-0 hidden min-[769px]:flex items-center">
            <Image
              src="/images/mandala.png"
              alt="Mandala Left"
              width={200}
              height={200}
              className="h-full w-auto object-contain -scale-x-100"
              style={{ transform: "scaleX(-1)" }}
            />
          </div>

          {/* Right Mandala Decoration */}
          <div className="absolute right-0 top-0 bottom-0 h-full pointer-events-none opacity-50 z-0 hidden min-[769px]:flex items-center">
            <Image
              src="/images/mandala.png"
              alt="Mandala Right"
              width={200}
              height={200}
              className="h-full w-auto object-contain"
            />
          </div>

          <div className="relative z-10 max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-10">
            <h1 className="text-3xl sm:text-4xl md:text-[48px] font-serif font-extrabold tracking-tight mb-4 leading-tight text-[#2c1209]">
              {heroTitle.heading} <span className="text-[#d95a2b]">{heroTitle.highlight}</span> {heroTitle.trailing}
            </h1>
            <p className="text-stone-600 text-sm md:text-base max-w-2xl mx-auto mb-8 font-medium leading-relaxed">
              {heroSubtitle}
            </p>

            {/* Light Search & Filter Container */}
            <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-xl shadow-orange-950/5 border border-[#fcd5b5] flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-5 pr-10 py-3 rounded-xl text-sm text-stone-800 outline-none placeholder:text-stone-400 font-medium bg-transparent"
                />
                <Search className="w-5 h-5 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#d95a2b]" />
              </div>
              {dynamicFilterGroups.length > 0 && (
                <button
                  type="button"
                  onClick={() => openFilterModal()}
                  className="bg-[#d95a2b] hover:bg-[#c24a1e] text-white px-6 py-3 rounded-xl flex items-center gap-2 text-xs sm:text-sm font-bold shadow-md transition-all shrink-0 active:scale-95 cursor-pointer"
                >
                  <SlidersHorizontal className="w-4 h-4 text-white" />
                  <span>Filter</span>
                  {hasActiveFilters && (
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1350px] px-4 sm:px-6 lg:px-10 py-10 bg-[#ffffff]">
          <div className="flex items-center justify-between mb-5 sm:mb-6 gap-2">
            <h2 className="text-[19px] min-[360px]:text-[22px] min-[390px]:text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#5c2424] whitespace-nowrap tracking-tight sm:tracking-normal">
              {sectionTitle}
            </h2>
          </div>

          {/* Quick Categories Filter row */}
          {dynamicFilterGroups.length > 0 && (
            <div className="flex overflow-x-auto gap-2.5 pb-4 no-scrollbar mb-6">
              <button
                type="button"
                onClick={clearFilters}
                className={`shrink-0 rounded-full px-5 py-2 text-sm font-bold transition-colors cursor-pointer ${!hasActiveFilters
                  ? "bg-[#d95a2b] text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                  }`}
              >
                All
              </button>
              {dynamicFilterGroups.map((group: FilterGroup) => (
                <button
                  key={group.label}
                  type="button"
                  onClick={() => openFilterModal(group.label)}
                  className={`shrink-0 rounded-full px-5 py-2 text-sm font-bold transition-colors border cursor-pointer ${filters[group.label]?.length > 0
                    ? "bg-[#d95a2b] text-white border-[#d95a2b]"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  {group.label}
                </button>
              ))}
            </div>
          )}

          {/* Filter Modal */}
          {isFilterModalOpen && dynamicFilterGroups.length > 0 && (
            <PujaFilterModal
              filters={filters}
              filterGroups={dynamicFilterGroups}
              initialTab={filterModalInitialTab}
              onClose={() => setIsFilterModalOpen(false)}
              onApply={applyFilters}
              onClear={clearFilters}
            />
          )}

          {/* Grid of Cards */}
          {!fetched ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8 lg:grid-cols-3 w-full mt-12">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="bg-gray-100/80 rounded-[32px] h-[450px] animate-pulse border border-stone-100"
                />
              ))}
            </div>
          ) : displayedItems.length === 0 ? (
            <div className="mt-16 flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-[#e3d1c2] bg-white py-16 text-center">
              <SparklesIcon className="h-10 w-10 text-[#d95a2b]" />
              <p className="text-lg font-semibold text-[#5c2424]">
                No {serviceType === "homa" ? "homas" : "pujas"} found
              </p>
              <p className="text-sm text-gray-500">
                Try adjusting your filters to find what you&apos;re looking for.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-2 rounded-full bg-[#d95a2b] px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#b0451f] transition cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 lg:gap-8 max-w-[1350px] mx-auto w-full">
              {displayedItems.map((item: ServiceItem) => {
                const targetSlug = item.slug || slugify(item.title);
                const targetUrl = `${routePrefix}${targetSlug}`;
                const rawImg = getSafeImageUrl(item.imageUrl);
                const pInfo = getPriceComparison(item);
                const topTag = item.shortTitle || item.subtitle || item.badge;
                const venueLocation = item.location || item.details?.templeLocation || "Sacred Temple Venue";

                return (
                  <div
                    key={item._id}
                    className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.12),0_2px_6px_-1px_rgba(0,0,0,0.08)] border border-gray-200/90 flex flex-col overflow-hidden group hover:shadow-[0_14px_30px_-6px_rgba(0,0,0,0.18),0_10px_12px_-6px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 relative"
                  >
                    <Link href={targetUrl} prefetch={true} className="flex flex-col flex-1 cursor-pointer">
                      {/* Image Container: Adaptive aspect ratio so the entire banner (text + sacred ritual) fits cleanly at 320px+ */}
                      <div className="relative w-full aspect-[16/10] sm:aspect-[3/2] sm:min-h-[240px] shrink-0 overflow-hidden bg-stone-100">
                        {rawImg ? (
                          <Image
                            src={rawImg}
                            alt={item.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            unoptimized
                            className="w-full h-full object-cover object-center sm:object-left transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400">
                            <span className="text-xs font-serif font-medium">{item.title}</span>
                          </div>
                        )}
                        {item.badge && (
                          <div className="absolute top-4 left-0 bg-[#d92b2b] text-white text-[12px] font-extrabold px-3.5 py-1.5 shadow-md rounded-r-lg uppercase tracking-wider">
                            {item.badge}
                          </div>
                        )}
                      </div>

                      {/* Card Content */}
                      <div className="p-4 sm:p-5 lg:p-6 flex flex-col flex-1 text-left">
                        {topTag && (
                          <div className="flex items-center justify-center gap-2 mb-2 w-full text-center">
                            <div className="w-8 h-[1px] bg-accent/40" />
                            <span className="text-accent font-serif font-extrabold text-xs sm:text-[13px] tracking-wider uppercase flex items-center gap-1.5 text-center">
                              <span className="text-[10px]">♦</span> {topTag} <span className="text-[10px]">♦</span>
                            </span>
                            <div className="w-8 h-[1px] bg-accent/40" />
                          </div>
                        )}

                        <h3 className="text-[20px] sm:text-[21px] font-serif font-extrabold text-gray-900 mb-2 leading-snug line-clamp-2 min-h-[56px] flex items-center">
                          {item.title}
                        </h3>

                        <p className="text-gray-600 text-[14px] leading-relaxed line-clamp-3 mb-5 overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] min-h-[66px]">
                          {item.description || item.subtitle}
                        </p>

                        {/* Location & Date Details Box: Vedic Gold & Amber Temple Card */}
                        <div className="bg-gradient-to-b from-[#FFFDF9] to-[#FFF9F0] border border-[#ECD9C3] rounded-2xl p-2.5 sm:p-3 shadow-xs space-y-1.5 mt-auto mb-4">
                          {/* Row 1: Puja Date & Occasion */}
                          <div className="flex items-center gap-2.5 bg-white/95 border border-[#E8D5B5] rounded-xl px-2.5 py-1.5 shadow-2xs min-w-0 transition-all hover:border-[#D99B52]">
                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#E65100]/15 via-[#F97316]/10 to-amber-100/60 border border-[#F0CA9E] flex items-center justify-center shrink-0 shadow-2xs text-[#C2410C]">
                              <Calendar className="w-3.5 h-3.5 text-[#C2410C]" strokeWidth={2.2} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="block text-xs sm:text-[12.5px] font-extrabold text-[#0B1E36] leading-tight">
                                {formatDayDateMonth(item.date) || item.date}
                              </span>
                              {item.subtitle && (
                                <span className="block text-[10px] sm:text-[10.5px] text-stone-600 font-medium leading-normal mt-0.5 truncate pb-0.5">
                                  {item.subtitle}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Row 2: Time */}
                          {item.time && (
                            <div className="flex items-center gap-2.5 bg-gradient-to-br from-[#FFF9EE] via-[#FFF3E0] to-[#FFF9EE] border border-[#F0CA9E] rounded-xl px-2.5 py-1.5 shadow-2xs min-w-0 transition-all hover:border-[#D99B52]">
                              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#C2410C] to-[#E65100] flex items-center justify-center shrink-0 shadow-xs text-white">
                                <Clock className="w-3.5 h-3.5 text-amber-200" strokeWidth={2.2} />
                              </div>
                              <div className="min-w-0 flex-1 flex items-baseline justify-between gap-2">
                                <span className="block text-xs sm:text-[12.5px] font-extrabold text-[#0B1E36] leading-tight">
                                  {item.time}
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
                                {venueLocation}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Footer Row: Price + CTA Button */}
                        <div className="flex items-center justify-between gap-2 sm:gap-2.5 mt-auto pt-3 border-t border-gray-100 min-w-0">
                          <div className="shrink-0 min-w-0">
                            <PriceTag
                              sellingPrice={pInfo.sellingPrice ?? formatStartingPrice(item)}
                              listPrice={pInfo.listPrice}
                              sellingPriceClassName="text-[17px] sm:text-[20px] xl:text-[22px] font-black text-gray-900 leading-none"
                              listPriceClassName="text-[11px] sm:text-xs font-bold text-stone-400 line-through decoration-red-500 decoration-1.5 ml-1"
                              className="flex items-baseline gap-1 flex-wrap"
                            />
                            <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">
                              Per Booking
                            </div>
                          </div>

                          <div className="bg-[#00B05F] text-white text-[11px] min-[360px]:text-xs sm:text-sm font-extrabold px-3 sm:px-4 xl:px-5 py-2 sm:py-2.5 xl:py-3 rounded-full hover:bg-[#008F4C] transition-all duration-200 flex items-center justify-center gap-1 sm:gap-1.5 shrink min-w-0 text-center leading-tight shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 cursor-pointer">
                            <span className="line-clamp-2 text-center">
                              {item.buttonText || defaultButtonText}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" strokeWidth={2.8} />
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* Top Right Subtle Transparent Floating Action Buttons */}
                    <div className="absolute top-3.5 right-3.5 flex flex-col gap-2 z-10" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                      {item._id && (
                        <WishlistButton
                          itemId={item._id}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/20 hover:bg-black/35 text-white/90 hover:text-white backdrop-blur-md border border-white/25 flex items-center justify-center transition-all active:scale-95 shadow-xs cursor-pointer"
                          iconClassName="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/95"
                        />
                      )}

                      <button
                        type="button"
                        aria-label="Share service"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShareData({
                            title: item.title,
                            description: item.description || item.subtitle,
                            location: item.location,
                            url: typeof window !== "undefined" ? `${window.location.origin}${targetUrl}` : targetUrl,
                          });
                          setShareModalOpen(true);
                        }}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/20 hover:bg-black/35 text-white/90 hover:text-white backdrop-blur-md border border-white/25 flex items-center justify-center transition-all active:scale-95 shadow-xs cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* End of list text */}
          {fetched && displayedItems.length > 0 && (
            <div className="mt-14 text-center">
              <p className="text-sm font-medium text-stone-500">
                You&apos;ve reached the end of available {serviceType === "homa" ? "homas" : "pujas"}
              </p>
              <p className="text-xs text-stone-400 mt-1">
                {displayedItems.length} of {displayedItems.length} {serviceType === "homa" ? "homas" : "pujas"} shown
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
