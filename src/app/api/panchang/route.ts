import { NextRequest, NextResponse } from 'next/server';
import { fetchPanchangData } from '@/lib/api/panchang';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || undefined;
    const latStr = searchParams.get('lat');
    const lonStr = searchParams.get('lon');

    const latitude  = latStr ? parseFloat(latStr) : undefined;
    const longitude = lonStr ? parseFloat(lonStr) : undefined;

    console.log('[PanchangRoute] GET called — date:', date, 'lat:', latitude, 'lon:', longitude);

    const data = await fetchPanchangData({ date, latitude, longitude });

    if (!data) {
      console.warn('[PanchangRoute] fetchPanchangData returned null — API unavailable.');
      return NextResponse.json(
        { error: 'Panchang API is currently unavailable. Please try again shortly.' },
        { status: 503 }
      );
    }

    console.log('[PanchangRoute] Returning real data. Tithi:', data?.tithi?.name);
    return NextResponse.json(data);

  } catch (err: any) {
    console.error('[PanchangRoute] Unhandled error in GET handler:', err?.message || err);
    return NextResponse.json(
      { error: `Internal server error: ${err?.message || 'unknown'}` },
      { status: 500 }
    );
  }
}
