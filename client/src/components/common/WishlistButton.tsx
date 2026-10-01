"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";

interface WishlistButtonProps {
  itemId: string;
  className?: string;
  iconClassName?: string;
}

export default function WishlistButton({ itemId, className, iconClassName }: WishlistButtonProps) {
  const { user } = useUser();
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (user && (user.id || user._id) && itemId) {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://priest-service.onrender.com/";
      fetch(`${baseUrl}/api/wishlist/${user.id || user._id}`)
        .then(res => res.json())
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
    if (!user) {
      alert("Please login to add to wishlist");
      return;
    }

    if (!itemId) return;

    const action = isWishlisted ? "remove" : "add";

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://priest-service.onrender.com/";
      const res = await fetch(`${baseUrl}/api/wishlist/updateWishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id || user._id,
          serviceId: itemId,
          action,
        }),
      });

      const data = await res.json();
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

  return (
    <button
      aria-label="Add to wishlist"
      onClick={handleWishlistToggle}
      className={className || `w-8 h-8 rounded-full bg-white/95 flex items-center justify-center shadow-sm backdrop-blur-sm transition-transform active:scale-95 ${isWishlisted ? 'text-red-500' : 'text-stone-700 hover:text-red-500'}`}
    >
      <svg className={iconClassName || "w-4 h-4 fill-none stroke-current"} strokeWidth="2" viewBox="0 0 24 24">
        <path fill={isWishlisted ? "currentColor" : "none"} d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </button>
  );
}
