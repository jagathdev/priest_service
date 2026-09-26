import { NextRequest, NextResponse } from 'next/server';
import { fetchFestivalsForMonth } from '@/lib/api/panchang';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    const latStr = searchParams.get('lat');
    const lonStr = searchParams.get('lon');

    if (!dateStr) {
      return NextResponse.json({ error: "Missing date parameter" }, { status: 400 });
    }

    const latitude = latStr ? parseFloat(latStr) : undefined;
    const longitude = lonStr ? parseFloat(lonStr) : undefined;

    // dateStr is expected to be YYYY-MM-DD
    const parts = dateStr.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10); // 1-12

    const data = await fetchFestivalsForMonth(year, month, latitude, longitude);
    
    if (!data) {
      return NextResponse.json(
        { error: 'Festivals API is currently unavailable.' },
        { status: 503 }
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('[FestivalsRoute] Error:', err?.message || err);
    return NextResponse.json(
      { error: `Internal server error: ${err?.message || 'unknown'}` },
      { status: 500 }
    );
  }
}
