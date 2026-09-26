import { NextResponse } from "next/server";
import { getMangalDosha } from "@/lib/nakshatra";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dateValue = body.date?.trim();
    if (!dateValue) return NextResponse.json({ error: "Date is required" }, { status: 400 });

    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime()))
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });

    const result = getMangalDosha(parsedDate);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to calculate Mangal Dosha" }, { status: 500 });
  }
}
