import { NextResponse } from "next/server";

/**
 * Returns admin login email for form prefill only. Password is never exposed.
 * Set ADMIN_EMAIL in your environment (e.g. .env.local).
 */
export async function GET() {
  const email = process.env.ADMIN_EMAIL || "admin@astroved.com";
  return NextResponse.json({ email });
}
