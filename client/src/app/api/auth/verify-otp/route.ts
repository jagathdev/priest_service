import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const apiUrl = process.env.EMAIL_OTP_VERIFY_URL;
    const token = process.env.ASTROVED_AUTH_API_TOKEN;

    if (!apiUrl) {
      return NextResponse.json({ success: false, error: "EMAIL_OTP_VERIFY_URL is missing in environment variables" }, { status: 500 });
    }

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json({ success: false, error: data.message || "OTP verification failed" }, { status: res.status });
    }

    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "OTP verification error" }, { status: 500 });
  }
}

