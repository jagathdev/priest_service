import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import clientPromise from "@/lib/mongodb";
import { getJwtSecret } from "@/lib/server/authSession";
// @ts-ignore
import bcrypt from "bcryptjs";


export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Normalize email for comparison (case-insensitive and trimmed)
    const normalizedEmail = email?.toLowerCase().trim() || '';

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@astroved.com').toLowerCase().trim().replace(/\r/g, '');
    const adminPassword = (process.env.ADMIN_PASSWORD || 'astroved_admin_2026').trim().replace(/\r/g, '');

    let isValid = false;

    // 1. ENV credentials act as master backdoor
    if (adminEmail && normalizedEmail === adminEmail && password === adminPassword) {
      isValid = true;
    } else {
      // 2. DB admin fallback
      try {
        const client = await clientPromise;
        const db = client.db();
        const admin = await db.collection("admins").findOne({ email: normalizedEmail });
        if (admin && admin.password) {
          isValid = await bcrypt.compare(password, admin.password);
        }
      } catch (dbErr) {
        console.warn("Admin DB lookup skipped:", dbErr);
      }
    }

    if (isValid) {
      const token = await new SignJWT({ role: 'admin', email: normalizedEmail })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('24h')
        .sign(getJwtSecret());

      const response = NextResponse.json({ success: true });
      
      response.cookies.set('adminToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
