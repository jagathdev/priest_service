import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { getJwtSecret } from '@/lib/server/authSession';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('userToken')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, getJwtSecret());
    return NextResponse.json({
      authenticated: true,
      user: {
        id: payload.userId,
        customerId: payload.customerId,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        whatsapp: payload.whatsapp,
        country: payload.country,
        currency: payload.currency,
        loginProvider: payload.loginProvider,
      }
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
