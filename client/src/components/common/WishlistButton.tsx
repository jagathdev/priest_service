"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { wishlistService } from "@/services/wishlist.service";

interface WishlistButtonProps {
  itemId: string;
  className?: string;
  iconClassName?: string;
  text?: string;
}

export default function WishlistButton({ itemId, className, iconClassName, text }: WishlistButtonProps) {
  const { user } = useUser();
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const userId = user?.id || user?._id;
    if (userId && itemId) {
      wishlistService.getWishlist(userId as string)
        .then(data => {
          if (data.success && data.data && Array.isArray(data.data)) {
            const isW = data.data.some((item: any) =>
              item.serviceId === itemId
            );
            setIsWishlisted(isW);
          }
        })
        .catch(err => console.error("Error fetching wishlist", err));
    }
  }, [user, itemId]);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const userId = user?.id || user?._id;

    if (!user || !userId) {
      alert("Please login to add to wishlist");
      return;
    }

    if (!itemId) return;

    const action = isWishlisted ? "remove" : "add";

    try {
      const data = await wishlistService.updateWishlist({
        userId: userId as string,
        serviceId: itemId,
        action,
      });

      if (data.success) {
        setIsWishlisted(!isWishlisted);
      } else {
        alert(data.message || "Failed to update wishlist");
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      alert("Error updating wishlist");
    }
  };

  const defaultClassName = text
    ? "border rounded-full px-3.5 py-1.5 flex items-center justify-center gap-1.5 font-bold text-xs transition-all active:scale-95 shadow-xs border-stone-300 hover:border-stone-400 bg-white text-stone-700"
    : `w-8 h-8 rounded-full bg-white/95 flex items-center justify-center shadow-sm backdrop-blur-sm transition-transform active:scale-95 ${isWishlisted ? "text-red-500" : "text-stone-700 hover:text-red-500"
    }`;

  const defaultIconClassName = text
    ? `w-3.5 h-3.5 ${isWishlisted ? "text-red-500" : "text-stone-700"}`
    : "w-4 h-4";

  return (
    <button
      aria-label="Add to wishlist"
      onClick={handleWishlistToggle}
      className={className || defaultClassName}
    >
      <svg className={iconClassName || defaultIconClassName} strokeWidth="2" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
      {text && <span>{text}</span>}
    </button>
  );
}
