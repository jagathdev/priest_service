/**
 * POST /api/auth/otp/resend
 *
 * Resends the OTP to the user's WhatsApp/phone/email.
 */

import { NextResponse } from "next/server";
import { AstrovedAuthError, resendOtp } from "@/lib/server/astrovedAuthApi";

const phoneRegex = /^[0-9]{6,15}$/;
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as any;
    const { method } = body;

    if (method === "email") {
      const email = String(body.email ?? "").toLowerCase().trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ success: false, error: "Enter a valid email address" }, { status: 400 });
      }
      const result = await resendOtp({ method: "email", email });
      return NextResponse.json({ success: true, message: result.message, data: { expiresIn: 30 } });
    }

    if (method === "phone" || method === "whatsapp") {
      if (!body.country || !phoneRegex.test(String(body.number ?? ""))) {
        return NextResponse.json({ success: false, error: "Enter a valid mobile number" }, { status: 400 });
      }
      const result = await resendOtp({ method, country: body.country, number: body.number });
      return NextResponse.json({ success: true, message: result.message, data: { expiresIn: 30 } });
    }

    return NextResponse.json({ success: false, error: "Invalid method" }, { status: 400 });
  } catch (err) {
    if (err instanceof AstrovedAuthError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.statusCode });
    }
    console.error("[otp-resend] Unexpected error:", err);
    return NextResponse.json({ success: false, error: "Unable to resend OTP. Please try again." }, { status: 500 });
  }
}
