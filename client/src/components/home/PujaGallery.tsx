"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import GalleryLightboxModal from "@/components/common/GalleryLightboxModal";

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

interface PujaGalleryProps {
  initialPujas?: any[];
  initialHomas?: any[];
}

export default function PujaGallery({ initialPujas, initialHomas }: PujaGalleryProps) {
  const [allPujas, setAllPujas] = useState<any[]>(initialPujas || []);
  const [allHomas, setAllHomas] = useState<any[]>(initialHomas || []);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [galleryLightboxOpen, setGalleryLightboxOpen] = useState(false);
  const [galleryLightboxIdx, setGalleryLightboxIdx] = useState(0);

  // Gallery Draggable / Nav Scroll / Touch Swipe
  const galleryScrollRef = useRef<HTMLDivElement | null>(null);
  const [isGalleryDragging, setIsGalleryDragging] = useState(false);
  const galleryStartXRef = useRef<number>(0);
  const galleryStartYRef = useRef<number>(0);
  const galleryScrollLeftRef = useRef<number>(0);
  const galleryMovedRef = useRef<boolean>(false);
  const galleryDirectionRef = useRef<"horizontal" | "vertical" | null>(null);
  const isAutoScrollPausedRef = useRef<boolean>(false);
  const autoScrollResumeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch pujas & homas for gallery if not preloaded
  useEffect(() => {
    async function fetchData() {
      const expressBase = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";

      if (!initialPujas || initialPujas.length === 0) {
        try {
          const res = await fetch(`${expressBase}/api/pujas`);
          if (res.ok) {
            const data = await res.json();
            const rawList = data?.data && Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
            setAllPujas(rawList.filter((item: any) => !item.status || item.status === "active"));
          }
        } catch (err) {
          console.error("Failed to fetch pujas for gallery:", err);
        }
      }

      if (!initialHomas || initialHomas.length === 0) {
        try {
          const res = await fetch(`${expressBase}/api/homas`);
          if (res.ok) {
            const data = await res.json();
            const rawList = data?.data && Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
            setAllHomas(rawList.filter((item: any) => !item.status || item.status === "active"));
          }
        } catch (err) {
          console.error("Failed to fetch homas for gallery:", err);
        }
      }
    }
    fetchData();
  }, [initialPujas, initialHomas]);

  // Dynamically extract and shuffle gallery images across all Pujas and Homas
  const dynamicGalleryImages = useMemo(() => {
    const serviceBuckets: { src: string; alt: string }[][] = [];
    const seenUrls = new Set<string>();

    const aspectPresets = [
      "w-[190px] sm:w-[220px] md:w-[250px] h-[300px] sm:h-[350px] md:h-[380px]", // Tall portrait
      "w-[240px] sm:w-[280px] md:w-[320px] h-[210px] sm:h-[240px] md:h-[260px]", // Wide landscape
      "w-[200px] sm:w-[230px] md:w-[260px] h-[340px] sm:h-[390px] md:h-[420px]", // Very tall portrait
      "w-[250px] sm:w-[290px] md:w-[330px] h-[190px] sm:h-[220px] md:h-[240px]", // Landscape
      "w-[230px] sm:w-[270px] md:w-[300px] h-[240px] sm:h-[280px] md:h-[300px]", // Medium balanced
    ];

    const extractServiceImages = (service: any): { src: string; alt: string }[] => {
      const items: { src: string; alt: string }[] = [];
      const addUrl = (raw: any) => {
        if (!raw) return;
        if (typeof raw === "string") {
          const parts = raw.split(/[\n,]+/);
          for (const p of parts) {
            const trimmed = p.trim();
            if (trimmed) {
              const formatted = getSafeImageUrl(trimmed);
              if (formatted && !seenUrls.has(formatted)) {
                seenUrls.add(formatted);
                items.push({ src: formatted, alt: service.title || "Sacred Ritual" });
              }
            }
          }
        } else if (Array.isArray(raw)) {
          for (const it of raw) addUrl(it);
        }
      };

      addUrl(service.gallery);
      addUrl(service.galleryUrl);
      if (service.details?.gallery) addUrl(service.details.gallery);
      return items;
    };

    for (const p of allPujas) {
      const imgs = extractServiceImages(p);
      if (imgs.length > 0) serviceBuckets.push(imgs);
    }

    for (const h of allHomas) {
      const imgs = extractServiceImages(h);
      if (imgs.length > 0) serviceBuckets.push(imgs);
    }

    const shuffled: { src: string; alt: string; aspect: string }[] = [];
    let hasMore = true;
    let round = 0;
    while (hasMore) {
      hasMore = false;
      for (const bucket of serviceBuckets) {
        if (round < bucket.length) {
          const item = bucket[round];
          const aspect = aspectPresets[shuffled.length % aspectPresets.length];
          shuffled.push({ ...item, aspect });
          hasMore = true;
        }
      }
      round++;
    }

    return shuffled.filter((item) => !failedImages[item.src]);
  }, [allPujas, allHomas, failedImages]);

  // Infinite Seamless Auto-scroll Loop
  useEffect(() => {
    const container = galleryScrollRef.current;
    if (!container) return;

    let animationFrameId: number;
    let initialized = false;

    const scrollStep = () => {
      if (!container) return;

      const singleSetWidth = container.scrollWidth / 3;
      if (!initialized && singleSetWidth > 0) {
        container.scrollLeft = singleSetWidth;
        initialized = true;
      }

      if (!isGalleryDragging && !isAutoScrollPausedRef.current && singleSetWidth > 0) {
        container.scrollLeft += 0.65;

        if (container.scrollLeft >= singleSetWidth * 2) {
          container.scrollLeft -= singleSetWidth;
        } else if (container.scrollLeft <= 0) {
          container.scrollLeft += singleSetWidth;
        }
      }

      animationFrameId = requestAnimationFrame(scrollStep);
    };

    animationFrameId = requestAnimationFrame(scrollStep);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (autoScrollResumeTimerRef.current) {
        clearTimeout(autoScrollResumeTimerRef.current);
      }
    };
  }, [isGalleryDragging, dynamicGalleryImages.length]);

  const pauseAutoScrollTemporarily = (durationMs = 2500) => {
    isAutoScrollPausedRef.current = true;
    if (autoScrollResumeTimerRef.current) {
      clearTimeout(autoScrollResumeTimerRef.current);
    }
    autoScrollResumeTimerRef.current = setTimeout(() => {
      isAutoScrollPausedRef.current = false;
    }, durationMs);
  };

  // Mouse Drag Handlers
  const handleGalleryMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!galleryScrollRef.current) return;
    setIsGalleryDragging(true);
    galleryMovedRef.current = false;
    galleryStartXRef.current = e.pageX;
    galleryScrollLeftRef.current = galleryScrollRef.current.scrollLeft;
    pauseAutoScrollTemporarily(6000);
  };

  const handleGalleryMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isGalleryDragging || !galleryScrollRef.current) return;
    const diff = (e.pageX - galleryStartXRef.current) * 1.5;
    if (Math.abs(diff) > 5) {
      galleryMovedRef.current = true;
    }
    const container = galleryScrollRef.current;
    container.scrollLeft = galleryScrollLeftRef.current - diff;

    const maxScroll = container.scrollWidth - container.clientWidth;
    if (maxScroll > 0) {
      if (container.scrollLeft <= 0) {
        container.scrollLeft += maxScroll / 2;
        galleryScrollLeftRef.current += maxScroll / 2;
      } else if (container.scrollLeft >= maxScroll) {
        container.scrollLeft -= maxScroll / 2;
        galleryScrollLeftRef.current -= maxScroll / 2;
      }
    }
  };

  const handleGalleryMouseUpOrLeave = () => {
    if (isGalleryDragging) {
      setIsGalleryDragging(false);
      pauseAutoScrollTemporarily(3000);
    }
  };

  // Touch Swipe Handlers (Mobile & Tablet)
  const handleGalleryTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!galleryScrollRef.current) return;
    galleryMovedRef.current = false;
    galleryStartXRef.current = e.touches[0].clientX;
    galleryStartYRef.current = e.touches[0].clientY;
    galleryDirectionRef.current = null;
    galleryScrollLeftRef.current = galleryScrollRef.current.scrollLeft;
  };

  const handleGalleryTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!galleryScrollRef.current) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = Math.abs(currentX - galleryStartXRef.current);
    const deltaY = Math.abs(currentY - galleryStartYRef.current);

    if (galleryDirectionRef.current === null) {
      if (deltaY > deltaX && deltaY > 6) {
        galleryDirectionRef.current = "vertical";
        setIsGalleryDragging(false);
        return;
      } else if (deltaX > deltaY && deltaX > 6) {
        galleryDirectionRef.current = "horizontal";
        setIsGalleryDragging(true);
        pauseAutoScrollTemporarily(10000);
      } else {
        return;
      }
    }

    if (galleryDirectionRef.current === "vertical") {
      return;
    }

    const diff = (currentX - galleryStartXRef.current) * 1.3;
    if (Math.abs(diff) > 5) {
      galleryMovedRef.current = true;
    }
    const container = galleryScrollRef.current;
    container.scrollLeft = galleryScrollLeftRef.current - diff;

    const maxScroll = container.scrollWidth - container.clientWidth;
    if (maxScroll > 0) {
      if (container.scrollLeft <= 0) {
        container.scrollLeft += maxScroll / 2;
        galleryScrollLeftRef.current += maxScroll / 2;
      } else if (container.scrollLeft >= maxScroll) {
        container.scrollLeft -= maxScroll / 2;
        galleryScrollLeftRef.current -= maxScroll / 2;
      }
    }
  };

  const handleGalleryTouchEnd = () => {
    if (galleryDirectionRef.current === "horizontal") {
      pauseAutoScrollTemporarily(3500);
    }
    galleryDirectionRef.current = null;
    setIsGalleryDragging(false);
  };

  const scrollGallery = (direction: "left" | "right") => {
    if (!galleryScrollRef.current) return;
    pauseAutoScrollTemporarily(4000);
    const container = galleryScrollRef.current;
    const scrollAmount = typeof window !== "undefined" && window.innerWidth < 640 ? 240 : 350;
    const singleSetWidth = container.scrollWidth / 3;

    if (direction === "right") {
      if (singleSetWidth > 0 && container.scrollLeft >= singleSetWidth * 2 - scrollAmount) {
        container.scrollLeft -= singleSetWidth;
      }
      container.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    } else {
      if (singleSetWidth > 0 && container.scrollLeft <= singleSetWidth) {
        container.scrollLeft += singleSetWidth;
      }
      container.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="pt-10 pb-8 sm:pt-14 sm:pb-12 bg-white relative overflow-hidden group/gallery">
      {/* Background Typography at Top */}
      <h2 className="text-[44px] min-[375px]:text-[52px] min-[425px]:text-[60px] sm:text-[95px] md:text-[120px] lg:text-[160px] xl:text-[185px] font-bold text-stone-200/90 font-serif tracking-tight text-center select-none pointer-events-none whitespace-nowrap absolute top-1 sm:top-2 left-1/2 -translate-x-1/2 z-0 leading-none">
        Puja Gallery
      </h2>

      {/* Left Navigation Button */}
      <button
        type="button"
        onClick={() => scrollGallery("left")}
        aria-label="Previous gallery images"
        className="absolute left-3 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-all shadow-md active:scale-95 cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
      </button>

      {/* Right Navigation Button */}
      <button
        type="button"
        onClick={() => scrollGallery("right")}
        aria-label="Next gallery images"
        className="absolute right-3 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-all shadow-md active:scale-95 cursor-pointer"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
      </button>

      {/* Draggable & Touch Swipeable Row Container */}
      <div
        ref={galleryScrollRef}
        onMouseDown={handleGalleryMouseDown}
        onMouseMove={handleGalleryMouseMove}
        onMouseUp={handleGalleryMouseUpOrLeave}
        onMouseLeave={handleGalleryMouseUpOrLeave}
        onTouchStart={handleGalleryTouchStart}
        onTouchMove={handleGalleryTouchMove}
        onTouchEnd={handleGalleryTouchEnd}
        className={`relative z-10 w-full pt-12 min-[375px]:pt-14 sm:pt-20 md:pt-24 pb-2 px-4 sm:px-8 overflow-x-auto select-none no-scrollbar touch-pan-y ${
          isGalleryDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{
          scrollBehavior: "auto",
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
        }}
      >
        <div className="flex gap-4 sm:gap-6 items-end w-max pb-2">
          {[...dynamicGalleryImages, ...dynamicGalleryImages, ...dynamicGalleryImages].map((img, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (galleryMovedRef.current) return;
                setGalleryLightboxIdx(idx % dynamicGalleryImages.length);
                setGalleryLightboxOpen(true);
              }}
              className={`relative shrink-0 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-stone-200/80 group transition-transform duration-300 hover:scale-[1.02] ${img.aspect}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                unoptimized
                draggable={false}
                sizes="(max-width: 640px) 250px, (max-width: 1024px) 350px, 450px"
                className="object-cover object-center transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none"
                onError={() => {
                  setFailedImages((prev) => ({ ...prev, [img.src]: true }));
                }}
              />
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                <div className="w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-xs shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                  <ZoomIn className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Puja Gallery Lightbox Modal */}
      <GalleryLightboxModal
        isOpen={galleryLightboxOpen}
        onClose={() => setGalleryLightboxOpen(false)}
        images={dynamicGalleryImages}
        initialIndex={galleryLightboxIdx}
      />
    </section>
  );
}
