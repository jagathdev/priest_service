import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Fetch counts from different collections
    const [specialPujas, puja, temples, chadhava, library, panchang, astroTools, store, reviews] = await Promise.all([
      db.collection('special-pujas').countDocuments(),
      db.collection('puja').countDocuments(),
      db.collection('temples').countDocuments(),
      db.collection('chadhava').countDocuments(),
      db.collection('library').countDocuments(),
      db.collection('panchang').countDocuments(),
      db.collection('astro-tools').countDocuments(),
      db.collection('store').countDocuments(),
      db.collection('reviews').countDocuments(),
    ]);

    return NextResponse.json({
      specialPujas,
      puja,
      temples,
      chadhava,
      library,
      panchang,
      astroTools,
      store,
      reviews
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
