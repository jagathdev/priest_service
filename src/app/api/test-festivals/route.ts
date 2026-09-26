import { NextResponse } from 'next/server';

export async function GET() {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZXhwIjoxNzc5MzU1NjA0LCJpYXQiOjE3NzkyNjkyMDQsInR5cGUiOiJhY2Nlc3MiLCJqdGkiOiJkZGY0NDQ2M2JiMGMzNTYxIiwic2NvcGVzIjpbInVzZXI6cmVhZCJdfQ.EpJJCg9T0Q2Gpe2OIxU16A1zQX8t3ctfXRn_Im1MEPM";
  
  try {
    const d1 = new Date();
    const d2 = new Date();
    d2.setMonth(d2.getMonth() + 3);

    const body = {
      start_date: d1.toISOString().split('T')[0],
      end_date: d2.toISOString().split('T')[0],
      timezone: 'Asia/Kolkata',
      latitude: 25.3176,
      longitude: 82.9739
    };

    const res = await fetch('https://qaengine.astroved.com/api/v1/panchanga/festivals/range', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    
    if (!res.ok) {
      return NextResponse.json({ error: `HTTP ${res.status}`, body: await res.text() });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
