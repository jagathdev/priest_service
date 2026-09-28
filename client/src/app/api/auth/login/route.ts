import { NextResponse } from "next/server";
import type { EmailLoginPayload } from "@/types/auth";
import {
  AstrovedAuthError,
  authenticatePasswordLogin,
  mapLoginInfoToUser,
} from "@/lib/server/astrovedAuthApi";
import { attachUserSession, getJwtSecret } from "@/lib/server/authSession";
import { SignJWT } from "jose";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { email, password } = (await request.json()) as EmailLoginPayload;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ── Admin check ──────────────────────────────────────────────────────────
    // Check against master admin credentials from .env.local BEFORE hitting
    // the backend API. This keeps admin login fully independent from user auth.
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@astroved.com").toLowerCase().trim().replace(/\r/g, "");
    const adminPassword = (process.env.ADMIN_PASSWORD || "astroved_admin_2026").trim().replace(/\r/g, "");

    let isAdminValid = false;

    if (adminEmail && normalizedEmail === adminEmail && password === adminPassword) {
      isAdminValid = true;
    } else {
      // Secondary check against MongoDB admins collection if admin password was changed in DB
      try {
        const clientPromise = (await import("@/lib/mongodb")).default;
        const bcrypt = (await import("bcryptjs")).default;
        const client = await clientPromise;
        const db = client.db();
        const adminDoc = await db.collection("admins").findOne({ email: normalizedEmail });
        if (adminDoc && adminDoc.password) {
          isAdminValid = await bcrypt.compare(password, adminDoc.password);
        }
      } catch (dbError) {
        // Ignore DB connection errors for admin env check
      }
    }

    if (isAdminValid) {
      const adminToken = await new SignJWT({ role: "admin", email: normalizedEmail })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(getJwtSecret());

      const response = NextResponse.json({ success: true, isAdmin: true });

      response.cookies.set("adminToken", adminToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      });

      return response;
    }
    // ── End admin check ──────────────────────────────────────────────────────

    const loginInfo = await authenticatePasswordLogin({
      email: normalizedEmail,
      password,
    });
    const authUser = mapLoginInfoToUser(loginInfo, { loginProvider: "email" });

    const response = NextResponse.json({
      success: true,
      isAdmin: false,
      user: authUser,
      data: authUser,
    });

    await attachUserSession(response, authUser);

    return response;
  } catch (error) {
    if (error instanceof AstrovedAuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }

    if (error instanceof Error && error.message.includes("JWT_SECRET")) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: false, error: "Unable to log in" }, { status: 500 });
  }
}
