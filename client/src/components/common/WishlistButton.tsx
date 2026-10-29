"use client";

import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { wishlistService } from "@/services/wishlist.service";

interface WishlistButtonProps {
  itemId: string;
  className?: string;
  iconClassName?: string;
  text?: string;
}

export default function WishlistButton({ itemId, className, iconClassName, text }: WishlistButtonProps) {
  const { user, openLoginModal } = useUser();
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
      openLoginModal();
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
    ? "border rounded-full px-3.5 sm:px-4 py-1.5 flex items-center justify-center gap-1.5 font-medium text-xs sm:text-sm transition-all active:scale-95 shadow-xs border-stone-300 hover:border-stone-400 bg-white text-stone-800"
    : "w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm backdrop-blur-sm transition-transform active:scale-95";

  const iconSizeClass = iconClassName || (text ? "w-3.5 h-3.5 sm:w-4 sm:h-4" : "w-4 h-4");

  return (
    <button
      aria-label="Add to wishlist"
      onClick={handleWishlistToggle}
      className={className || defaultClassName}
    >
      <Heart
        className={`${iconSizeClass} transition-colors ${isWishlisted
          ? "text-[#ef4444] fill-[#ef4444]"
          : "text-stone-700 fill-none"
          }`}
        strokeWidth={2}
      />
      {text && <span>{text}</span>}
    </button>
  );
}
