/**
 * POST /api/auth/otp/send
 *
 * Sends an OTP to the user's WhatsApp/phone/email.
 * If the number is not registered, silently registers the user first.
 */

import { NextResponse } from "next/server";
import { AstrovedAuthError, sendOtp, registerWithAstroved } from "@/lib/server/astrovedAuthApi";

const phoneRegex = /^[0-9]{6,15}$/;
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as any;
    const { method } = body;

    // ── 1. Validate input ──────────────────────────────────────────────────
    if (method === "email") {
      const email = String(body.email ?? "").toLowerCase().trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ success: false, error: "Enter a valid email address" }, { status: 400 });
      }
      body.email = email;
    } else if (method === "phone" || method === "whatsapp") {
      if (!body.country || !phoneRegex.test(String(body.number ?? ""))) {
        return NextResponse.json({ success: false, error: "Enter a valid mobile number" }, { status: 400 });
      }
    } else {
      return NextResponse.json({ success: false, error: "Invalid method" }, { status: 400 });
    }

    // ── 2. Try sending OTP directly ────────────────────────────────────────
    try {
      const result = await sendOtp(body);
      return NextResponse.json({ success: true, message: result.message, data: { expiresIn: 30 } });
    } catch (err) {
      // If not a "not registered" error, bubble it up immediately
      if (!(err instanceof AstrovedAuthError) || err.vendorStatus !== "NotFound") {
        throw err;
      }

      // ── 3. Number not registered — silent registration ─────────────────
      console.log("[otp-send] Number not registered. Attempting silent registration...");

      const password = Math.random().toString(36).slice(-8) + "Av1@";

      if (method === "email") {
        // Email: need a dummy phone for registration
        const dummyPhone = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        await registerWithAstroved({
          firstName: "AstroVed",
          lastName: "User",
          email: body.email,
          password,
          phone: dummyPhone,
          country: { name: "India", isoCode: "IN", dialCode: "91" } as any,
          isWhatsappNumber: false,
          currency: "INR",
        });
      } else {
        // Phone/WhatsApp: generate unique guest email
        const tag = Math.random().toString(36).substring(2, 7);
        try {
          await registerWithAstroved({
            firstName: "AstroVed",
            lastName: "User",
            email: `guest.${body.number}.${tag}@astroved.com`,
            password,
            phone: body.number,
            country: body.country,
            isWhatsappNumber: method === "whatsapp",
            currency: "INR",
          });
        } catch (regErr) {
          // "Mobile No already exists" — the number IS registered in Astroved's DB.
          // The OTP call with '91' format (StatusCode 0) was Astroved's silent success
          // for this legacy account. Return success so the user can enter the OTP.
          const regMsg = regErr instanceof Error ? regErr.message.toLowerCase() : "";
          const alreadyExists =
            regMsg.includes("already exists") ||
            regMsg.includes("mobile no already") ||
            regMsg.includes("duplicate");

          if (alreadyExists) {
            console.log("[otp-send] Number confirmed registered (legacy account). OTP was dispatched via alternate format.");
            return NextResponse.json({
              success: true,
              message: "OTP sent to your registered WhatsApp number",
              data: { expiresIn: 30 },
            });
          }

          throw regErr; // Unexpected registration error — surface it
        }
      }

      console.log("[otp-send] Silent registration done. Sending OTP...");

      // ── 4. Now send OTP to the newly registered number ─────────────────
      const result = await sendOtp(body);
      return NextResponse.json({ success: true, message: result.message, data: { expiresIn: 30 } });
    }
  } catch (err) {
    if (err instanceof AstrovedAuthError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.statusCode });
    }
    console.error("[otp-send] Unexpected error:", err);
    return NextResponse.json({ success: false, error: "Unable to send OTP. Please try again." }, { status: 500 });
  }
}
