"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { captureUtmFromUrl, recordVisitorHit } from "@/lib/utmTracker";

/**
 * Client component that continuously listens for UTM parameters, promo codes,
 * and tracks unique visitors per session for Admin Dashboard analytics.
 */
export default function UtmTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasTrackedInitialVisit = useRef(false);

  useEffect(() => {
    const captured = captureUtmFromUrl();

    // Track on initial page load or when explicit UTM arrives
    if (!hasTrackedInitialVisit.current || captured) {
      hasTrackedInitialVisit.current = true;
      recordVisitorHit(captured);
    }
  }, [pathname, searchParams]);

  return null;
}

