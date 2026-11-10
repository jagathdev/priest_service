/**
 * Global UTM & Marketing Attribution Tracker
 * Captures query parameters (utm_source, utm_medium, utm_campaign, utm_term, utm_content, promo, ref)
 * and persists them in sessionStorage & localStorage across the user journey.
 */

export interface UtmDetails {
  utmSource: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  promo?: string; // Query string promo parameter (?promo=...) - distinct from promoCode (coupon discount)
  referrer?: string;
  landingPage?: string;
  capturedAt?: string;
}

const STORAGE_KEY = "ps_utm_attribution";

/**
 * Parses the current window URL and records UTM parameters if present.
 * If no UTM source is present, but an external document.referrer exists, infers the source.
 */
export const captureUtmFromUrl = (): UtmDetails | null => {
  if (typeof window === "undefined") return null;

  try {
    const urlParams = new URLSearchParams(window.location.search);

    const utmSource = urlParams.get("utm_source") || urlParams.get("source");
    const utmMedium = urlParams.get("utm_medium") || urlParams.get("medium");
    const utmCampaign = urlParams.get("utm_campaign") || urlParams.get("campaign");
    const utmTerm = urlParams.get("utm_term") || urlParams.get("term");
    const utmContent = urlParams.get("utm_content") || urlParams.get("content");
    const promoParam = urlParams.get("promo"); // Query parameter promo (marketing attribution)

    const rawReferrer = document.referrer || "";
    let inferredSource = "";

    if (!utmSource && rawReferrer) {
      try {
        const refUrl = new URL(rawReferrer);
        if (!refUrl.hostname.includes(window.location.hostname)) {
          if (refUrl.hostname.includes("google")) inferredSource = "Google Organic";
          else if (refUrl.hostname.includes("facebook") || refUrl.hostname.includes("fb.me")) inferredSource = "Facebook";
          else if (refUrl.hostname.includes("instagram")) inferredSource = "Instagram";
          else if (refUrl.hostname.includes("youtube")) inferredSource = "YouTube";
          else if (refUrl.hostname.includes("whatsapp")) inferredSource = "WhatsApp";
          else inferredSource = refUrl.hostname.replace(/^www\./, "");
        }
      } catch {
        // Invalid referrer URL
      }
    }

    const finalSource = utmSource || inferredSource;

    // If new UTM source or promo exists, store it
    if (finalSource || promoParam) {
      const details: UtmDetails = {
        utmSource: finalSource || "Direct",
        utmMedium: utmMedium || "",
        utmCampaign: utmCampaign || "",
        utmTerm: utmTerm || "",
        utmContent: utmContent || "",
        promo: promoParam || "",
        referrer: rawReferrer,
        landingPage: window.location.pathname + window.location.search,
        capturedAt: new Date().toISOString(),
      };

      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(details));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(details));
      } catch {
        // Storage quota / access restricted
      }

      return details;
    }
  } catch (err) {
    console.warn("[utmTracker] Error capturing UTM:", err);
  }

  return getStoredUtmDetails();
};

/**
 * Retrieves the stored UTM details from storage, or returns default direct attribution.
 */
export const getStoredUtmDetails = (): UtmDetails => {
  if (typeof window === "undefined") {
    return { utmSource: "Direct" };
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    }
  } catch {
    // Ignore parse error
  }

  return {
    utmSource: "Direct",
    promo: "",
    referrer: typeof document !== "undefined" ? document.referrer : "",
    landingPage: typeof window !== "undefined" ? window.location.pathname : "",
  };
};
