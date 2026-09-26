import { NextResponse } from "next/server";
import {
  AstrovedAuthError,
  normalizeCurrency,
  registerWithAstroved,
} from "@/lib/server/astrovedAuthApi";
import type { SignupPayload } from "@/types/auth";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{6,15}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export const runtime = "nodejs";

function splitName(name?: string) {
  const parts = String(name ?? "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

function getCurrencyFromCountry(isoCode?: string) {
  if (isoCode?.toUpperCase() === "IN") return "INR";
  if (isoCode?.toUpperCase() === "MY") return "MYR";
  return "USD";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignupPayload;
    const fallbackName = splitName(body.name);
    const firstName = String(body.firstName ?? fallbackName.firstName).trim();
    const lastName = String(body.lastName ?? fallbackName.lastName).trim();
    const email = String(body.email ?? "").toLowerCase().trim();
    const phone = String(body.phone ?? "").replace(/[^0-9]/g, "");
    const country = body.country;
    const isWhatsappNumber = Boolean(body.isWhatsappNumber || body.whatsapp === body.phone);
    const password = String(body.password ?? "");
    const confirmPassword = String(body.confirmPassword ?? "");

    const name = `${firstName || ""} ${lastName || ""}`.trim();

    if (!firstName?.trim()) {
      return NextResponse.json({ success: false, error: "First name is required" }, { status: 400 });
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: "Enter a valid email address" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ success: false, error: "Passwords do not match" }, { status: 400 });
    }

    if (!country?.dialCode || !country?.isoCode || !country?.name) {
      return NextResponse.json({ success: false, error: "Select a country" }, { status: 400 });
    }

    if (country.isoCode.toUpperCase() === 'IN') {
      const indianPhoneRegex = /^[6-9]\d{9}$/;
      if (!indianPhoneRegex.test(phone)) {
        return NextResponse.json({ success: false, error: "Enter a valid Phone Number" }, { status: 400 });
      }
    } else {
      if (!phoneRegex.test(phone)) {
        return NextResponse.json({ success: false, error: "Enter a valid mobile number" }, { status: 400 });
      }
    }

    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters and include a letter and a number" },
        { status: 400 }
      );
    }

    const normalizedEmail = email;
    const currency = normalizeCurrency(getCurrencyFromCountry(country.isoCode));

    const registration = await registerWithAstroved({
      firstName,
      lastName,
      email: normalizedEmail,
      password,
      phone,
      country,
      isWhatsappNumber,
      currency,
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      data: {
        customerId: registration?.CustomerId ? String(registration.CustomerId) : undefined,
        isRegistered: registration?.IsRegistered,
        email: registration?.Email ?? normalizedEmail,
        phone: registration?.PhoneNumber ?? `${country.dialCode}|${phone}`,
        currency: normalizeCurrency(registration?.Currency ?? currency),
      },
    });
  } catch (error) {
    if (error instanceof AstrovedAuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }

    console.error("Signup error:", error);
    return NextResponse.json({ success: false, error: "Unable to create account" }, { status: 500 });
  }
}
