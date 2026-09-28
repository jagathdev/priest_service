import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { getJwtSecret } from '@/lib/server/authSession';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('userToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, getJwtSecret());
    const userId = payload.userId;

    const bookingData = await request.json();
    
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('bookings');

    const result = await collection.insertOne({
      userId,
      customerName: payload.name,
      customerEmail: payload.email,
      bookingType: bookingData.type || 'puja', // 'puja' or 'chadhava'
      title: bookingData.title || (bookingData.type === 'chadhava' ? 'Spiritual Chadhava' : 'Sacred Puja Service'),
      amount: bookingData.amount,
      currency: bookingData.currency || 'INR',
      devoteeName: bookingData.devoteeName || bookingData.name || '',
      gotra: bookingData.gotra || '',
      address: bookingData.address || '',
      whatsapp: bookingData.whatsapp || bookingData.wa || '',
      items: bookingData.items || [],
      status: 'success',
      bookingDate: new Date(),
      orderId: bookingData.orderId,
    });

    return NextResponse.json({ success: true, bookingId: result.insertedId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create booking';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
