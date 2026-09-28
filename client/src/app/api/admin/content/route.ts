import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (!type) {
      return NextResponse.json({ error: "Type is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    let items = await db.collection(type).find({}).toArray();

    if (type !== 'currency') {
       const currencyRatesArr = await db.collection('currency').find({}).toArray();
       if (currencyRatesArr.length > 0) {
          const rates = currencyRatesArr[0];
          const usdRate = Number(rates.usdConversionRate) || 0;
          const myrRate = Number(rates.myrConversionRate) || 0;
          
          if (usdRate > 0 && myrRate > 0) {
             items = items.map(item => {
                 // For standard prices
                 if (item.priceINR !== undefined) {
                     if (item.priceUSD === undefined || item.priceUSD === null) {
                         item.priceUSD = Number((item.priceINR * usdRate).toFixed(2));
                     }
                     if (item.priceMYR === undefined || item.priceMYR === null) {
                         item.priceMYR = Number((item.priceINR * myrRate).toFixed(2));
                     }
                 }
                 // For chadhava offerings
                 for (let i = 1; i <= 5; i++) {
                     if (item[`offering${i}PriceINR`] !== undefined) {
                         if (item[`offering${i}PriceUSD`] === undefined || item[`offering${i}PriceUSD`] === null) {
                             item[`offering${i}PriceUSD`] = Number((item[`offering${i}PriceINR`] * usdRate).toFixed(2));
                         }
                         if (item[`offering${i}PriceMYR`] === undefined || item[`offering${i}PriceMYR`] === null) {
                             item[`offering${i}PriceMYR`] = Number((item[`offering${i}PriceINR`] * myrRate).toFixed(2));
                         }
                     }
                 }
                 // For packages
                 if (Array.isArray(item.packages)) {
                     item.packages = item.packages.map((pkg: any) => {
                         if (pkg.priceINR !== undefined) {
                             if (pkg.priceUSD === undefined || pkg.priceUSD === null) {
                                 pkg.priceUSD = Number((pkg.priceINR * usdRate).toFixed(2));
                             }
                             if (pkg.priceMYR === undefined || pkg.priceMYR === null) {
                                 pkg.priceMYR = Number((pkg.priceINR * myrRate).toFixed(2));
                             }
                         }
                         return pkg;
                     });
                 }
                 return item;
             });
          }
       }
    }

    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const data = await req.json();

    if (!type) {
      return NextResponse.json({ error: "Type is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    // Add timestamp
    data.createdAt = new Date();
    data.updatedAt = new Date();

    const result = await db.collection(type).insertOne(data);

    return NextResponse.json({ _id: result.insertedId, ...data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!type || !id) {
      return NextResponse.json({ error: "Type and id are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    const result = await db.collection(type).deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");
    const data = await req.json();

    if (!type || !id) {
      return NextResponse.json({ error: "Type and id are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const updatePayload = {
      ...data,
      updatedAt: new Date(),
    };

    const result = await db
      .collection(type)
      .updateOne({ _id: new ObjectId(id) }, { $set: updatePayload });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, _id: id, ...updatePayload });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
