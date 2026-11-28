/**
 * Global UTM & Marketing Attribution Tracker
 *
 * Rules:
 * 1. Cookie-Only Storage:
 *    - All UTM and referral attribution data is stored STRICTLY in browser cookies.
 *    - NO localStorage or sessionStorage is used. Any legacy keys are cleaned up.
 * 2. 7-Day Expiry:
 *    - Cookies are saved with max-age = 7 days (604,800 seconds).
 * 3. First-Visit Capture:
 *    - When a user enters the webpage, captures:
 *      • document.referrer (e.g. https://www.google.com/ or social platform)
 *      • landingPage (the entry URL path)
 *      • firstVisitedAt (ISO timestamp)
 *      • utmSource / utmCampaign / promo (if provided in URL or detected from organic referrer)
 *    - Internal navigation within the website does not overwrite the initial external referrer/landing page.
 * 4. Overwriting:
 *    - When a user enters with new explicit UTM tags or ?promo=..., the campaign values
 *      overwrite existing cookies and reset the 7-day timer.
 * 5. Cleanup on Order Conversion:
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
  referrer?: string;
  firstVisitedAt?: string;
  capturedAt?: string;
}

const STORAGE_KEY = "ps_utm_attribution";
const COOKIE_SOURCE = "ps_utm_source";
const COOKIE_MEDIUM = "ps_utm_medium";
const COOKIE_CAMPAIGN = "ps_utm_campaign";
const COOKIE_REFERRER = "ps_referrer";
const COOKIE_LANDING_PAGE = "ps_landing_page";
const COOKIE_FIRST_VISITED_AT = "ps_first_visited_at";

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
 * Detects organic search or social source from a raw referrer URL
 */
const detectOrganicSource = (referrerUrl: string): string => {
  if (!referrerUrl) return "";
  try {
    const parsed = new URL(referrerUrl);
    const host = parsed.hostname.toLowerCase();

    if (host.includes("google.")) return "Google Search";
    if (host.includes("bing.")) return "Bing Search";
    if (host.includes("yahoo.")) return "Yahoo Search";
    if (host.includes("duckduckgo.")) return "DuckDuckGo";
    if (host.includes("youtube.")) return "YouTube";
    if (host.includes("instagram.")) return "Instagram";
    if (host.includes("facebook.") || host.includes("fb.me")) return "Facebook";
    if (host.includes("twitter.") || host.includes("t.co") || host.includes("x.com")) return "Twitter / X";
    if (host.includes("linkedin.")) return "LinkedIn";
    if (host.includes("pinterest.")) return "Pinterest";
    if (host.includes("whatsapp.")) return "WhatsApp";

    return host.replace(/^www\./, "");
  } catch {
    return "";
  }
};

/**
 * Checks if a referrer is an internal link on the same domain
 */
const isInternalReferrer = (referrerUrl: string): boolean => {
  if (!referrerUrl || typeof window === "undefined") return false;
  try {
    const refHost = new URL(referrerUrl).hostname.toLowerCase();
    const currentHost = window.location.hostname.toLowerCase();
    return refHost === currentHost;
  } catch {
    return false;
  }
};

/**
 * Parses the current window URL and records UTM parameters and initial landing page/referrer.
 * Stores STRICTLY in Cookies with a 7-day expiration.
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

    const currentPath = window.location.pathname + window.location.search;
    const rawReferrer = typeof document !== "undefined" ? document.referrer || "" : "";
    const isInternal = isInternalReferrer(rawReferrer);

    // Existing stored values
    const existingReferrer = getCookie(COOKIE_REFERRER);
    let existingLandingPage = getCookie(COOKIE_LANDING_PAGE);
    let existingFirstVisitedAt = getCookie(COOKIE_FIRST_VISITED_AT);

    // 1. First-visit Landing Page & Timestamp:
    // If user first landed on generic root "/" and navigates to a specific ritual/page,
    // upgrade the landing page to the specific ritual (e.g. /puja/navagraha-shanti-puja)
    // so we know which specific puja or homa the user is interested in.
    const isSpecializedPage = currentPath !== "/" && !currentPath.startsWith("/admin") && !currentPath.startsWith("/api");
    const shouldUpgradeLanding = (!existingLandingPage || existingLandingPage === "/") && isSpecializedPage;

    if (!existingLandingPage || shouldUpgradeLanding) {
      existingLandingPage = currentPath;
      setCookie(COOKIE_LANDING_PAGE, existingLandingPage, SEVEN_DAYS_SECONDS);
    }

    if (!existingFirstVisitedAt) {
      existingFirstVisitedAt = new Date().toISOString();
      setCookie(COOKIE_FIRST_VISITED_AT, existingFirstVisitedAt, SEVEN_DAYS_SECONDS);
    }

    // 2. Referrer: capture external referrer on entry; do NOT overwrite with internal navigation
    let effectiveReferrer = existingReferrer;
    if (!existingReferrer && rawReferrer && !isInternal) {
      effectiveReferrer = rawReferrer;
      setCookie(COOKIE_REFERRER, effectiveReferrer, SEVEN_DAYS_SECONDS);
    }

    // 3. UTM Parameters from Query string
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get("utm_source") || urlParams.get("source");
    const utmMedium = urlParams.get("utm_medium") || urlParams.get("medium");
    const utmCampaign = urlParams.get("utm_campaign") || urlParams.get("campaign");
    const utmTerm = urlParams.get("utm_term") || urlParams.get("term");
    const utmContent = urlParams.get("utm_content") || urlParams.get("content");
    const promoParam = urlParams.get("promo");

    const hasExplicitUtm = !!(
      utmSource ||
      utmMedium ||
      utmCampaign ||
      utmTerm ||
      utmContent ||
      promoParam
    );

    // If no explicit UTM, check if we can detect an organic source from external referrer
    const organicSource = (!hasExplicitUtm && !isInternal && rawReferrer) ? detectOrganicSource(rawReferrer) : "";

    const needsCookieUpdate = hasExplicitUtm || organicSource || !getCookie(STORAGE_KEY) || shouldUpgradeLanding;

    if (needsCookieUpdate) {
      const existingDetails = getStoredUtmDetails();

      const resolvedSource = utmSource || (hasExplicitUtm ? "" : (organicSource || existingDetails.utmSource || ""));
      const resolvedMedium = utmMedium || (organicSource && !utmMedium ? "organic" : (existingDetails.utmMedium || ""));
      const resolvedCampaign = utmCampaign || existingDetails.utmCampaign || "";
      const resolvedTerm = utmTerm || existingDetails.utmTerm || "";
      const resolvedContent = utmContent || existingDetails.utmContent || "";
      const resolvedPromo = promoParam || existingDetails.promo || "";

      const details: UtmDetails = {
        utmSource: resolvedSource,
        utmMedium: resolvedMedium,
        utmCampaign: resolvedCampaign,
        utmTerm: resolvedTerm,
        utmContent: resolvedContent,
        promo: resolvedPromo,
        landingPage: existingLandingPage || currentPath,
        referrer: effectiveReferrer || (rawReferrer && !isInternal ? rawReferrer : ""),
        firstVisitedAt: existingFirstVisitedAt || new Date().toISOString(),
        capturedAt: new Date().toISOString(),
      };

      try {
        const serialized = JSON.stringify(details);
        setCookie(STORAGE_KEY, serialized, SEVEN_DAYS_SECONDS);
        if (details.utmSource) {
          setCookie(COOKIE_SOURCE, details.utmSource, SEVEN_DAYS_SECONDS);
        }
        if (details.utmMedium) {
          setCookie(COOKIE_MEDIUM, details.utmMedium, SEVEN_DAYS_SECONDS);
        }
        if (details.utmCampaign) {
          setCookie(COOKIE_CAMPAIGN, details.utmCampaign, SEVEN_DAYS_SECONDS);
        }
        if (details.referrer) {
          setCookie(COOKIE_REFERRER, details.referrer, SEVEN_DAYS_SECONDS);
        }
        if (details.landingPage) {
          setCookie(COOKIE_LANDING_PAGE, details.landingPage, SEVEN_DAYS_SECONDS);
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
 * Retrieves the stored UTM & referrer details STRICTLY from cookies.
 * Does not check localStorage or sessionStorage.
 * Returns empty object if no UTM cookie exists.
 */
export const getStoredUtmDetails = (): UtmDetails => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = getCookie(STORAGE_KEY);
    let details: UtmDetails = {};

    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        details = parsed;
      }
    }

    // Fill in from separate individual cookies if missing
    if (!details.utmSource) details.utmSource = getCookie(COOKIE_SOURCE);
    if (!details.utmMedium) details.utmMedium = getCookie(COOKIE_MEDIUM);
    if (!details.utmCampaign) details.utmCampaign = getCookie(COOKIE_CAMPAIGN);
    if (!details.referrer) details.referrer = getCookie(COOKIE_REFERRER);
    if (!details.landingPage) details.landingPage = getCookie(COOKIE_LANDING_PAGE);
    if (!details.firstVisitedAt) details.firstVisitedAt = getCookie(COOKIE_FIRST_VISITED_AT);

    return details;
  } catch {
    return {};
  }
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
 * Retrieves or initializes an anonymous visitor session ID stored in cookies.
 * Valid for 30 days.
 */
export const getOrCreateVisitorSessionId = (): string => {
  if (typeof window === "undefined") return "";

  const SESSION_COOKIE_NAME = "ps_visitor_session";
  let sessionId = getCookie(SESSION_COOKIE_NAME);

  if (!sessionId) {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      sessionId = crypto.randomUUID();
    } else {
      sessionId = "vs_" + Math.random().toString(36).substring(2, 15) + "_" + Date.now().toString(36);
    }
    // Store in cookie for 30 days
    setCookie(SESSION_COOKIE_NAME, sessionId, 30 * 24 * 60 * 60);
  }

  return sessionId;
};

/**
 * Sends a visitor hit to the backend analytics API (/api/analytics/track-visitor).
 * Deduplicated per route/landing. Non-blocking and fails gracefully.
 */
export const recordVisitorHit = async (landingPath?: string): Promise<void> => {
  if (typeof window === "undefined") return;

  try {
    const sessionId = getOrCreateVisitorSessionId();
    if (!sessionId) return;

    // Do not track admin portal visits
    const currentPath = landingPath || window.location.pathname;
    if (currentPath.startsWith("/admin") || currentPath.startsWith("/api")) {
      return;
    }

    const utm = getStoredUtmDetails();
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

    const payload = {
      sessionId,
      utmSource: utm.utmSource || "Direct",
      utmMedium: utm.utmMedium || "",
      utmCampaign: utm.utmCampaign || "",
      utmTerm: utm.utmTerm || "",
      utmContent: utm.utmContent || "",
      promo: utm.promo || "",
      landingPage: utm.landingPage || currentPath + (window.location.search || ""),
      referrer: utm.referrer || (typeof document !== "undefined" ? document.referrer || "" : ""),
    };

    fetch(`${baseUrl}/api/analytics/track-visitor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Non-blocking catch
    });
  } catch {
    // Non-blocking
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
    deleteCookie(COOKIE_SOURCE);
    deleteCookie(COOKIE_MEDIUM);
    deleteCookie(COOKIE_CAMPAIGN);
    deleteCookie(COOKIE_REFERRER);
    deleteCookie(COOKIE_LANDING_PAGE);
    deleteCookie(COOKIE_FIRST_VISITED_AT);

    // Also clean any legacy storage keys if they exist
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
};
