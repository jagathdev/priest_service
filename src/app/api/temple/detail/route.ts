import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('temples');

    // Try finding by slug first
    let temple = await collection.findOne({ slug });

    // If not found, try by _id (ObjectId)
    if (!temple) {
      try {
        temple = await collection.findOne({ _id: new ObjectId(slug) });
      } catch {
        // slug is not a valid ObjectId, ignore
      }
    }

    if (!temple) {
      return NextResponse.json({ error: 'Temple not found' }, { status: 404 });
    }

    return NextResponse.json(temple);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
