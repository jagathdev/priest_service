/**
 * Centralized Media & Image Configuration
 * Single source of truth for base URLs and clean fallbacks.
 * Prevents scattered hardcoded static image paths across client components.
 */

export const MEDIA_CONFIG = {
  /**
   * Base site & API domain
   */
  SITE_URL:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "https://priestservices.astroved.com"),

  API_BASE_URL:
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com",

  /**
   * Official Brand & System Assets
   */
  BRAND_LOGO: "/images/admin/priest-services-logo.webp",
  FAVICON: "/icons/Fav-Icon.png",

  /**
   * Clean Default Fallback Media Assets
   */
  DEFAULT_BANNER: "https://priestservices.astroved.com/assets/shanipooja_4.png",
  DEFAULT_PUJA_CARD: "https://priestservices.astroved.com/assets/shanipooja_4.png",
  DEFAULT_HOMA_CARD: "https://priestservices.astroved.com/assets/shanipooja_4.png",
  DEFAULT_TEMPLE_IMAGE: "/images/mandala.png",

  /**
   * Default Devotee Package Avatars
   */
  PACKAGE_AVATARS: {
    INDIVIDUAL: "/images/package_individual.webp",
    COUPLE: "/images/package_couple.png",
    FAMILY: "/images/package_family.png",
  },
};

/**
 * Resolves an image URL safely:
 * - If already absolute (http/https/data), returns as is (with safe URI encoding).
 * - If relative (/assets/..., /images/...), keeps relative for Next.js Image component.
 * - If missing or empty, returns the optional fallback.
 */
export function resolveImageUrl(
  url?: string | null,
  fallback: string = MEDIA_CONFIG.DEFAULT_BANNER
): string {
  if (!url || typeof url !== "string") {
    return fallback;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return fallback;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) {
    try {
      return encodeURI(decodeURI(trimmed));
    } catch {
      return trimmed;
    }
  }

  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  try {
    return encodeURI(decodeURI(normalized));
  } catch {
    return normalized;
  }
}

/**
 * Resolves an absolute image URL specifically for social metadata (Open Graph / Twitter).
 * Ensures full https:// prefix and valid domain without www.
 */
export function resolveAbsoluteImageUrl(
  url?: string | null,
  fallback: string = MEDIA_CONFIG.DEFAULT_BANNER
): string {
  const resolved = resolveImageUrl(url, fallback);

  if (resolved.startsWith("http://") || resolved.startsWith("https://")) {
    // Strip accidental dead "www.priestservices.astroved.com" domain
    return resolved.replace("https://www.priestservices.astroved.com", "https://priestservices.astroved.com");
  }

  const base = "https://priestservices.astroved.com";
  return `${base}${resolved.startsWith("/") ? "" : "/"}${resolved}`;
}
