"use client";

import React, { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const emptySubscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export interface LightboxImageItem {
  src: string;
  alt?: string;
}

export type LightboxImage = string | LightboxImageItem;

interface GalleryLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: LightboxImage[];
  initialIndex?: number;
}

export default function GalleryLightboxModal({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
}: GalleryLightboxModalProps) {
  const mounted = useIsMounted();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [prevTrigger, setPrevTrigger] = useState({ isOpen, initialIndex, len: images.length });
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Sync index when initialIndex, isOpen, or images.length changes
  if (
    prevTrigger.isOpen !== isOpen ||
    prevTrigger.initialIndex !== initialIndex ||
    prevTrigger.len !== images.length
  ) {
    setPrevTrigger({ isOpen, initialIndex, len: images.length });
    if (isOpen) {
      const validIndex =
        images.length > 0
          ? ((initialIndex % images.length) + images.length) % images.length
          : 0;
      setCurrentIndex(validIndex);
    }
  }

  const total = images.length;

  const handlePrev = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (total <= 1) return;
      setCurrentIndex((prev) => (prev - 1 + total) % total);
    },
    [total]
  );

  const handleNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (total <= 1) return;
      setCurrentIndex((prev) => (prev + 1) % total);
    },
    [total]
  );

  // Keyboard navigation & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    setTouchStartX(null);
  };

  if (!mounted || !isOpen || total === 0) return null;

  const getItemSrc = (item: LightboxImage) => {
    const raw = typeof item === "string" ? item : item?.src || "";
    if (!raw) return "";
    try {
      return encodeURI(decodeURI(raw));
    } catch {
      return encodeURI(raw);
    }
  };

  const getItemAlt = (item: LightboxImage, idx: number) =>
    typeof item === "string"
      ? `Puja gallery photo ${idx + 1}`
      : item?.alt || `Puja gallery photo ${idx + 1}`;

  const currentItem = images[currentIndex];
  const currentSrc = getItemSrc(currentItem);
  const currentAlt = getItemAlt(currentItem, currentIndex);

  const prevIndex = (currentIndex - 1 + total) % total;
  const prevSrc = getItemSrc(images[prevIndex]);

  const nextIndex = (currentIndex + 1) % total;
  const nextSrc = getItemSrc(images[nextIndex]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery viewer"
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#151413]/95 backdrop-blur-md select-none transition-opacity duration-200"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Right Close Button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close modal"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-7 md:right-8 z-50 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white/90 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/10 shadow-lg"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Previous Button (Left) */}
      {total > 1 && (
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous image"
          className="absolute left-3 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 z-50 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white/90 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/10 shadow-xl"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {/* Next Button (Right) */}
      {total > 1 && (
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next image"
          className="absolute right-3 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 z-50 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white/90 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/10 shadow-xl"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {/* Gallery Stage Container */}
      <div className="relative w-full h-full flex items-center justify-center px-4 sm:px-12 md:px-20 overflow-hidden pointer-events-none">
        {/* Left Dimmed/Blurred Preview (Desktop/Tablet) */}
        {total > 1 && prevSrc && (
          <div
            onClick={handlePrev}
            aria-label="Go to previous photo"
            className="hidden sm:flex absolute left-1/2 -translate-x-[110%] top-1/2 -translate-y-1/2 z-10 max-h-[66vh] max-w-[32vw] items-center justify-end opacity-25 hover:opacity-45 transition-all duration-300 cursor-pointer pointer-events-auto select-none"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={prevSrc}
              alt="Previous photo preview"
              className="max-h-[66vh] w-auto max-w-full object-contain rounded-xl filter blur-[1.5px] scale-95 shadow-lg"
            />
          </div>
        )}

        {/* Center Active Main Image */}
        <div
          className="relative z-20 flex items-center justify-center max-h-[75vh] sm:max-h-[78vh] md:max-h-[82vh] max-w-[90vw] sm:max-w-[78vw] md:max-w-[65vw] pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={currentSrc}
            src={currentSrc}
            alt={currentAlt}
            className="max-h-[75vh] sm:max-h-[78vh] md:max-h-[82vh] w-auto max-w-full object-contain rounded-lg sm:rounded-xl shadow-2xl border border-white/10 transition-all duration-200 select-none"
          />
        </div>

        {/* Right Dimmed/Blurred Preview (Desktop/Tablet) */}
        {total > 1 && nextSrc && (
          <div
            onClick={handleNext}
            aria-label="Go to next photo"
            className="hidden sm:flex absolute left-1/2 translate-x-[10%] top-1/2 -translate-y-1/2 z-10 max-h-[66vh] max-w-[32vw] items-center justify-start opacity-25 hover:opacity-45 transition-all duration-300 cursor-pointer pointer-events-auto select-none"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={nextSrc}
              alt="Next photo preview"
              className="max-h-[66vh] w-auto max-w-full object-contain rounded-xl filter blur-[1.5px] scale-95 shadow-lg"
            />
          </div>
        )}
      </div>

      {/* Bottom Counter Pill (e.g., "9 / 9") */}
      <div
        className="absolute bottom-5 sm:bottom-6 md:bottom-7 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-full bg-white/15 text-white/95 text-xs sm:text-sm font-semibold tracking-wider backdrop-blur-md border border-white/10 shadow-lg select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {currentIndex + 1} / {total}
      </div>
    </div>,
    document.body
  );
}
