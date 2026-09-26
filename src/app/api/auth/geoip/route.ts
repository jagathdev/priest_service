import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    // 1. Check for standard Vercel country headers
    const vercelCountry =
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("x-country-code");

    if (vercelCountry) {
      return NextResponse.json({ country: vercelCountry.toUpperCase() });
    }

    // 2. Read the client's IP from headers
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip")?.trim();

    if (clientIp && clientIp !== "127.0.0.1" && clientIp !== "::1") {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const response = await fetch(`http://ip-api.com/json/${clientIp}`, {
          signal: controller.signal,
        });
        clearTimeout(timeout);
        const data = await response.json();
        if (data && data.countryCode) {
          return NextResponse.json({ country: data.countryCode.toUpperCase() });
        }
      } catch (err) {
        console.error("GeoIP lookup failed via ip-api.com:", err);
      }
    }

    // Default fallback to "IN"
    return NextResponse.json({ country: "IN" });
  } catch (error) {
    console.error("GeoIP route error:", error);
    return NextResponse.json({ country: "IN" });
  }
}
