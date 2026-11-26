"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin, ArrowRight } from "lucide-react";
import { apiClient } from "@/services/api";
import { useUser } from "@/contexts/UserContext";

export interface WishlistItem {
  wishlistId?: string;
  serviceId?: string;
  serviceType?: string;
  slug?: string;
  image?: string;
  name?: string;
  location?: string;
  price?: number | string;
  [key: string]: unknown;
}

interface WishlistTabProps {
  wishlistItems: WishlistItem[];
  loadingWishlist: boolean;
  onRefreshWishlist: () => void;
}

export default function WishlistTab({
  wishlistItems,
  loadingWishlist,
  onRefreshWishlist,
}: WishlistTabProps) {
  const { user } = useUser();

  const handleRemoveFromWishlist = async (serviceId?: string) => {
    if (!serviceId) return;
    try {
      await apiClient(`/api/wishlist/updateWishlist`, {
        method: "POST",
        body: JSON.stringify({
          userId: user?.id || user?._id,
          serviceId,
          action: "remove",
        }),
      });
      onRefreshWishlist();
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-[10px] bg-danger text-white flex items-center justify-center shrink-0 shadow-sm">
          <Heart className="w-5 h-5 fill-current" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#333]">
          My Wishlist <span className="text-gray-500 font-medium text-lg">({wishlistItems.length})</span>
        </h1>
      </div>

      {loadingWishlist ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`wish-skel-${i}`} className="bg-white rounded-2xl border border-stone-200 p-4 space-y-3 animate-pulse">
              <div className="w-full aspect-[4/3] bg-stone-200/80 rounded-xl" />
              <div className="h-4 w-3/4 bg-stone-200 rounded" />
              <div className="h-3 w-1/2 bg-stone-100 rounded" />
            </div>
          ))}
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
          <Heart className="w-16 h-16 text-gray-300 mb-4" strokeWidth={2} />
          <h2 className="text-lg font-extrabold text-gray-800 mb-2">Your wishlist is empty</h2>
          <p className="text-[13px] font-medium text-gray-500 mb-6">
            Save your favorite pujas and homas to view them here later.
          </p>
          <Link href="/" className="bg-primary text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-sm hover:bg-[#008F4C] transition">
            Explore Services
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {wishlistItems.map((item) => {
            const serviceType = item.serviceType?.toLowerCase() === "pooja" ? "puja" : (item.serviceType || "puja");
            const targetUrl = `/${serviceType}/${item.slug || item.serviceId}`;

            return (
              <div key={item.wishlistId || item.serviceId} className="bg-white border border-gray-200/90 rounded-2xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.12),0_2px_6px_-1px_rgba(0,0,0,0.08)] hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.16),0_8px_10px_-6px_rgba(0,0,0,0.1)] transition-all duration-300">
                {/* Top Image Section */}
                <Link href={targetUrl} prefetch={true} className="relative h-[200px] w-full block overflow-hidden group cursor-pointer">
                  <Image
                    src={
                      typeof item.image === "string"
                        ? item.image.startsWith("http") || item.image.startsWith("/")
                          ? item.image
                          : `/${item.image}`
                        : ((item.image as any)?.src || "/subrahmanya_swamy_hero.png")
                    }
                    alt={item.name || "Service Image"}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />

                  {/* Heart Icon (Remove) */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveFromWishlist(item.serviceId);
                    }}
                    aria-label="Remove from wishlist"
                    className="absolute top-3 right-3 z-20 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md cursor-pointer hover:bg-white text-primary"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </Link>

                {/* Bottom Content Section */}
                <div className="p-4 flex flex-col min-h-[150px]">
                  <Link href={targetUrl} prefetch={true} className="block mb-2">
                    <h3 className="text-[14px] font-extrabold text-gray-900 leading-[1.3] line-clamp-2 hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                  </Link>

                  <div className="flex items-start gap-1.5 text-[12px] text-gray-600 font-medium mb-4">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-[3px] text-[#8b2332]" />
                    <span className="leading-snug line-clamp-2">{item.location || "Location details not provided"}</span>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-1">
                    <div className="text-[16px] font-extrabold text-gray-900">₹{item.price || 516}</div>
                    <Link href={targetUrl} prefetch={true} className="bg-primary text-white text-[12px] font-bold pl-4 pr-1 py-1 rounded-full flex items-center gap-2 hover:bg-[#008F4C] transition shadow-sm group">
                      Book Now
                      <div className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform">
                        <ArrowRight className="w-3.5 h-3.5" strokeWidth={3} />
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
