"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { captureUtmFromUrl, recordVisitorHit } from "@/lib/utmTracker";

/**
 * Client component that continuously listens for UTM parameters, promo codes,
 * and external referrers on route navigation, and records visitor hits.
 */
export default function UtmTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastRecordedPathRef = useRef<string | null>(null);

  useEffect(() => {
    captureUtmFromUrl();

    // Prevent duplicate hits for the exact same path and query in a single render cycle
    const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    if (lastRecordedPathRef.current !== fullPath) {
      lastRecordedPathRef.current = fullPath;
      recordVisitorHit(pathname);
    }
  }, [pathname, searchParams]);

  return null;
}

