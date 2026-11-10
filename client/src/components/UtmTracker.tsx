"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { captureUtmFromUrl } from "@/lib/utmTracker";

/**
 * Client component that continuously listens for UTM parameters, promo codes,
 * and external referrers on route navigation.
 */
export default function UtmTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    captureUtmFromUrl();
  }, [pathname, searchParams]);

  return null;
}

