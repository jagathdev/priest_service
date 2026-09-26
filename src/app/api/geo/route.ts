import { NextRequest, NextResponse } from "next/server";

// Simple in-memory cache to avoid redundant lookups for the same IP
// (resets on server restart, but reduces API calls during a single deployment)
const geoCache = new Map<string, { country: string; timestamp: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function getClientIp(req: NextRequest): string | null {
  // Check standard proxy/CDN headers first
  const cfIpCountry = req.headers.get("cf-ipcountry"); // Cloudflare provides country directly
  if (cfIpCountry) return `__cf__${cfIpCountry}`; // special prefix to skip API call

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return null;
}

function currencyFromCountry(countryCode: string): "INR" | "USD" | "MYR" {
  if (countryCode === "IN") return "INR";
  if (countryCode === "MY") return "MYR";
  return "USD";
}

export async function GET(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // Cloudflare already tells us the country — no API call needed
    if (clientIp?.startsWith("__cf__")) {
      const countryCode = clientIp.replace("__cf__", "");
      return NextResponse.json({
        country: countryCode,
        currency: currencyFromCountry(countryCode),
        source: "cloudflare",
      });
    }

    if (!clientIp) {
      return NextResponse.json({
        country: "IN",
        currency: "INR",
        source: "default",
      });
    }

    // Check in-memory cache
    const cached = geoCache.get(clientIp);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({
        country: cached.country,
        currency: currencyFromCountry(cached.country),
        source: "cache",
      });
    }

    // Use api.country.is — completely free, no API key, no rate limits
    const geoRes = await fetch(`https://api.country.is/${clientIp}`, {
      next: { revalidate: 3600 }, // Next.js fetch cache: 1 hour
    });

    if (!geoRes.ok) {
      throw new Error(`Geo API responded with status ${geoRes.status}`);
    }

    const geoData = await geoRes.json();
    const countryCode: string = geoData.country ?? "IN";

    // Store in cache
    geoCache.set(clientIp, { country: countryCode, timestamp: Date.now() });

    return NextResponse.json({
      country: countryCode,
      currency: currencyFromCountry(countryCode),
      source: "api",
    });
  } catch (error) {
    console.error("[/api/geo] Error detecting country:", error);
    // Safe fallback — do not expose error details to client
    return NextResponse.json({
      country: "IN",
      currency: "INR",
      source: "fallback",
    });
  }
}
