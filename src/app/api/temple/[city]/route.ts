import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ city: string }> }
) {
  try {
    const { city } = await params;
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('temples');

    const query = city.toLowerCase() !== 'all' 
      ? { city: { $regex: new RegExp(`^${city}$`, 'i') } } 
      : {};

    const items = await collection.find(query).toArray();
    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
