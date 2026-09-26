/**
 * POST /api/auth/otp/verify
 *
 * Verifies the OTP and creates a user session.
 */

import { NextResponse } from "next/server";
import { AstrovedAuthError, verifyOtp, mapLoginInfoToUser } from "@/lib/server/astrovedAuthApi";
import { attachUserSession } from "@/lib/server/authSession";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as any;
    const { method, otp } = body;

    if (!method || !otp || !/^[0-9]{4,8}$/.test(String(otp).trim())) {
      return NextResponse.json({ success: false, error: "Enter a valid OTP" }, { status: 400 });
    }

    let loginInfo;

    if (method === "email") {
      const email = String(body.email ?? "").toLowerCase().trim();
      if (!email) {
        return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
      }
      loginInfo = await verifyOtp({ method, email, otp });
    } else {
      const { country, number } = body;
      if (!country || !number) {
        return NextResponse.json({ success: false, error: "Country and number are required" }, { status: 400 });
      }
      loginInfo = await verifyOtp({ method, country, number, otp });
    }

    const authUser = mapLoginInfoToUser(loginInfo, {
      country: body.country,
      loginProvider: method,
    });

    const response = NextResponse.json({
      success: true,
      message: "OTP verified successfully",
      user: authUser,
      data: authUser,
    });

    await attachUserSession(response, authUser);
    return response;
  } catch (err) {
    if (err instanceof AstrovedAuthError) {
      console.error("[otp-verify]", err.message, "status:", err.statusCode);
      return NextResponse.json({ success: false, error: err.message }, { status: err.statusCode });
    }
    console.error("[otp-verify] Unexpected error:", err);
    return NextResponse.json({ success: false, error: "Unable to verify OTP. Please try again." }, { status: 500 });
  }
}
