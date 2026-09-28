import { NextResponse } from 'next/server';
import { clearUserSession } from '@/lib/server/authSession';

export async function POST() {
  const response = NextResponse.json({ success: true });

  clearUserSession(response);

  return response;
}
