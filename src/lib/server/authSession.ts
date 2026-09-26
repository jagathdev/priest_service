import { SignJWT } from "jose";
import { NextResponse } from "next/server";
import type { AuthUser } from "@/types/auth";

const USER_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;
const CURRENCY_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET || "BuhHgMQMMYX2KDVAIVuHyEwI4PAxsf915w-X_eF-c6M";
  return new TextEncoder().encode(secret);
}

export async function createUserToken(user: AuthUser) {
  return new SignJWT({
    userId: user.id,
    customerId: user.customerId,
    email: user.email,
    name: user.name,
    phone: user.phone,
    whatsapp: user.whatsapp,
    country: user.country,
    currency: user.currency,
    loginProvider: user.loginProvider,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function attachUserSession(response: NextResponse, user: AuthUser) {
  const token = await createUserToken(user);

  response.cookies.set("userToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: USER_TOKEN_MAX_AGE,
    path: "/",
  });

  response.cookies.set("userCurrency", user.currency || "INR", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: CURRENCY_COOKIE_MAX_AGE,
    path: "/",
  });
}

export function clearUserSession(response: NextResponse) {
  response.cookies.set("userToken", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  response.cookies.set("userCurrency", "", {
    httpOnly: false,
    expires: new Date(0),
    path: "/",
  });
}
