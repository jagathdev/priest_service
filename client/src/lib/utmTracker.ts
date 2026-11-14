/**
 * Global UTM & Marketing Attribution Tracker
 *
 * Rules:
 * 1. Cookie-Only Storage:
 *    - All UTM attribution data is stored STRICTLY in browser cookies.
 *    - NO localStorage or sessionStorage is used. Any legacy keys are cleaned up.
 * 2. 7-Day Expiry:
 *    - Cookies are saved with max-age = 7 days (604,800 seconds).
 * 3. Overwriting:
 *    - When a user enters with new UTM tags or ?promo=..., the new values immediately
 *      overwrite the existing cookies and reset the 7-day timer.
 * 4. Cleanup on Order Conversion:
 *    - Once an order is completed/paid, `clearUtmAttribution()` deletes the cookies.
 */

export interface UtmDetails {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  promo?: string; // Query string promo parameter (?promo=...)
  landingPage?: string;
  capturedAt?: string;
}

const STORAGE_KEY = "ps_utm_attribution";
const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60; // 604,800 seconds (7 days)

/**
 * Helper to read cookie value by name in browser
 */
const getCookie = (name: string): string => {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
};

/**
 * Helper to set a cookie with 7-day expiry
 */
const setCookie = (name: string, value: string, maxAgeSeconds: number = SEVEN_DAYS_SECONDS): void => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
};

/**
 * Helper to delete a cookie immediately
 */
const deleteCookie = (name: string): void => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
};

/**
 * Parses the current window URL and records UTM parameters ONLY if explicitly present in the query string.
 * Stores STRICTLY in Cookies with a 7-day expiration. Overwrites any previous UTM cookies.
 */
export const captureUtmFromUrl = (): UtmDetails | null => {
  if (typeof window === "undefined") return null;

  try {
    // Purge any legacy localStorage or sessionStorage keys to ensure cookie-only operation
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }

    const urlParams = new URLSearchParams(window.location.search);

    const utmSource = urlParams.get("utm_source") || urlParams.get("source");
    const utmMedium = urlParams.get("utm_medium") || urlParams.get("medium");
    const utmCampaign = urlParams.get("utm_campaign") || urlParams.get("campaign");
    const utmTerm = urlParams.get("utm_term") || urlParams.get("term");
    const utmContent = urlParams.get("utm_content") || urlParams.get("content");
    const promoParam = urlParams.get("promo");

    // ONLY capture if explicit UTM or promo query parameter is present in URL
    const hasExplicitUtm = !!(
      utmSource ||
      utmMedium ||
      utmCampaign ||
      utmTerm ||
      utmContent ||
      promoParam
    );

    if (hasExplicitUtm) {
      const details: UtmDetails = {
        utmSource: utmSource || "",
        utmMedium: utmMedium || "",
        utmCampaign: utmCampaign || "",
        utmTerm: utmTerm || "",
        utmContent: utmContent || "",
        promo: promoParam || "",
        landingPage: window.location.pathname + window.location.search,
        capturedAt: new Date().toISOString(),
      };

      try {
        const serialized = JSON.stringify(details);
        // Overwrite cookie with 7-day expiry
        setCookie(STORAGE_KEY, serialized, SEVEN_DAYS_SECONDS);
        if (details.utmSource) {
          setCookie("ps_utm_source", details.utmSource, SEVEN_DAYS_SECONDS);
        }
        if (details.utmMedium) {
          setCookie("ps_utm_medium", details.utmMedium, SEVEN_DAYS_SECONDS);
        }
        if (details.utmCampaign) {
          setCookie("ps_utm_campaign", details.utmCampaign, SEVEN_DAYS_SECONDS);
        }
      } catch {
        // Storage restricted
      }

      return details;
    }
  } catch (err) {
    console.warn("[utmTracker] Error capturing UTM:", err);
  }

  return getStoredUtmDetails();
};

/**
 * Retrieves the stored UTM details STRICTLY from cookies.
 * Does not check localStorage or sessionStorage.
 * Returns empty object if no UTM cookie exists.
 */
export const getStoredUtmDetails = (): UtmDetails => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = getCookie(STORAGE_KEY);

    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    }

    const cookieSource = getCookie("ps_utm_source");
    const cookieMedium = getCookie("ps_utm_medium");
    const cookieCampaign = getCookie("ps_utm_campaign");
    if (cookieSource || cookieMedium || cookieCampaign) {
      return {
        utmSource: cookieSource,
        utmMedium: cookieMedium,
        utmCampaign: cookieCampaign,
      };
    }
  } catch {
    // Ignore parse error
  }

  return {};
};

/**
 * Builds query parameters from stored cookie UTM attributes ONLY if explicit UTM parameters exist.
 * Otherwise returns empty string.
 */
export const buildUtmQueryString = (): string => {
  if (typeof window === "undefined") return "";

  try {
    const utm = getStoredUtmDetails();
    const params = new URLSearchParams();

    if (utm.utmSource) {
      params.set("utm_source", utm.utmSource);
    }
    if (utm.utmMedium) {
      params.set("utm_medium", utm.utmMedium);
    }
    if (utm.utmCampaign) {
      params.set("utm_campaign", utm.utmCampaign);
    }
    if (utm.utmTerm) {
      params.set("utm_term", utm.utmTerm);
    }
    if (utm.utmContent) {
      params.set("utm_content", utm.utmContent);
    }
    if (utm.promo) {
      params.set("promo", utm.promo);
    }

    const qs = params.toString();
    return qs ? `&${qs}` : "";
  } catch {
    return "";
  }
};

/**
 * Generates or retrieves a persistent visitor session ID stored in cookies.
 * Prevents counting the same user multiple times on page refreshes.
 */
export const getVisitorSessionId = (): string => {
  if (typeof document === "undefined") return "";
  let sessionId = getCookie("ps_visitor_session");
  if (!sessionId) {
    sessionId = "vs_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString(36);
    // Session cookie valid for 24 hours
    setCookie("ps_visitor_session", sessionId, 24 * 60 * 60);
  }
  return sessionId;
};

/**
 * Sends a lightweight visitor hit to the backend for traffic & UTM analytics
 */
export const recordVisitorHit = async (details?: UtmDetails | null): Promise<void> => {
  if (typeof window === "undefined") return;

  try {
    const sessionId = getVisitorSessionId();
    if (!sessionId) return;

    // Read stored UTM or provided details
    const activeDetails = details || getStoredUtmDetails();

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

    await fetch(`${baseUrl}/api/analytics/track-visitor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId,
        utmSource: activeDetails?.utmSource || "Direct",
        utmMedium: activeDetails?.utmMedium || "",
        utmCampaign: activeDetails?.utmCampaign || "",
        utmTerm: activeDetails?.utmTerm || "",
        utmContent: activeDetails?.utmContent || "",
        promo: activeDetails?.promo || "",
        landingPage: typeof window !== "undefined" ? window.location.pathname : "/",
        referrer: typeof document !== "undefined" ? document.referrer : "",
      }),
      keepalive: true,
    });
  } catch (err) {
    // Non-blocking
    console.debug("[utmTracker] visitor tracking ping skipped:", err);
  }
};

/**
 * Deletes all UTM attribution cookies.
 * Called when an order is completed, removing all marketing tags from the browser.
 */
export const clearUtmAttribution = (): void => {
  if (typeof window === "undefined") return;

  try {
    deleteCookie(STORAGE_KEY);
    deleteCookie("ps_utm_source");
    deleteCookie("ps_utm_medium");
    deleteCookie("ps_utm_campaign");

    // Also clean any legacy storage keys if they exist
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
};
