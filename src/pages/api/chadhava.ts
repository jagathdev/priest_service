import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

type Offering = {
  id: string;
  name: string;
  price: number;
  priceINR?: number;
  priceUSD?: number;
  priceMYR?: number;
  description: string;
  imageUrl?: string;
};

type Faq = {
  question: string;
  answer: string;
};

type ChadhavaRecord = {
  _id?: ObjectId | string;
  title: string;
  subtitle?: string;
  description?: string;
  heroTitle?: string;
  content?: string;
  imageUrl?: string;
  location?: string;
  slug?: string;
  offerings?: Offering[];
  faqs?: Faq[];
  [key: string]: unknown;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const getStringField = (record: ChadhavaRecord, key: string) => {
  const value = record[key];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
};

const getNumberField = (record: ChadhavaRecord, key: string) => {
  const value = record[key];
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};

const buildOfferingsFromFlatFields = (record: ChadhavaRecord): Offering[] | undefined => {
  const result: Offering[] = [];
  for (let i = 1; i <= 10; i += 1) {
    const name = getStringField(record, `offering${i}Name`);
    const priceINR = getNumberField(record, `offering${i}PriceINR`);
    const priceUSD = getNumberField(record, `offering${i}PriceUSD`);
    const priceMYR = getNumberField(record, `offering${i}PriceMYR`);
    const priceLegacy = getNumberField(record, `offering${i}Price`);
    const description = getStringField(record, `offering${i}Description`);
    const imageUrl = getStringField(record, `offering${i}ImageUrl`);

    if (!name) continue;

    // Use priceINR or legacy price as standard price
    const finalPriceINR = priceINR !== undefined ? priceINR : (priceLegacy !== undefined ? priceLegacy : 0);

    if (priceINR === undefined && priceLegacy === undefined) continue;

    result.push({
      id: slugify(`${name}-${i}`),
      name,
      price: finalPriceINR,
      priceINR: finalPriceINR,
      priceUSD: priceUSD,
      priceMYR: priceMYR,
      description: description || `Sacred offering for ${name}.`,
      imageUrl,
    });
  }
  return result.length > 0 ? result : undefined;
};

const buildFaqsFromFlatFields = (record: ChadhavaRecord): Faq[] | undefined => {
  const result: Faq[] = [];
  for (let i = 1; i <= 10; i += 1) {
    const question = getStringField(record, `faq${i}Question`);
    const answer = getStringField(record, `faq${i}Answer`);
    if (!question || !answer) continue;
    result.push({ question, answer });
  }
  return result.length > 0 ? result : undefined;
};

const normalizeChadhava = (record: ChadhavaRecord) => ({
  ...record,
  _id: record._id ? String(record._id) : undefined,
  slug: record.slug || slugify(record.title),
  heroTitle: getStringField(record, 'heroTitle') || record.title,
  subtitle: getStringField(record, 'subtitle'),
  description: getStringField(record, 'description'),
  content: getStringField(record, 'content') || record.description,
  imageUrl: getStringField(record, 'imageUrl'),
  location: getStringField(record, 'location'),
  offerings: buildOfferingsFromFlatFields(record) ?? record.offerings ?? [],
  faqs: buildFaqsFromFlatFields(record) ?? record.faqs ?? [],
});

const fallbackChadhava: ChadhavaRecord[] = [
  {
    title: "Akshaya Punya Prapti 4-Teerth Udakumbha Seva",
    subtitle: "19 April, Sunday, Vaishakh Shukla Tritiya",
    description: "Serve 'Udakumbha' (Cooling Water-Pots) to thirsty Sadhus and the destitute across India's 4 Holiest Ghats!",
    heroTitle: "Akshaya Tritiya Akshaya Punya Prapti 4-Teerth Udakumbha Seva",
    content: "Our scriptures classify this incredibly selfless act specifically as the highly guarded 'Udakumbha Seva'. By pushing this exceptionally sublime Karmic deed explicitly atop Hinduism's wildly unbreakable cosmic timeline multiplier known strictly as 'Akshaya Tritiya' across 4 highly vibrating majestic Indian river systems.",
    imageUrl: "https://www.srimandir.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fimg_chadhava_web_banner.3fc5e49e.webp&w=1200&q=75",
    location: "Kashi, Haridwar, Ujjain, Prayagraj",
    slug: "akshaya-punya-prapti-4-teerth-udakumbha-seva",
    offerings: [
      { id: "offering-1", name: "Contribute to Clay Water Pot Seva in Kashi", price: 51, description: "Contributing to clay water pot seva for the needy in Kashi brings Akshaya Punya, satisfies thirst, and invokes lifelong peace and blessings." },
      { id: "offering-2", name: "Special Combo Chadhava: Clay Water Pot Seva at 4 Sacred Locations", price: 185, description: "Complete Udakumbha Seva across 4 holiest cities." }
    ],
    faqs: [
      { question: "What is Udakumbha Seva?", answer: "It is the act of offering water in clay pots to the needy and sadhus during hot months, especially on Akshaya Tritiya." }
    ]
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('chadhava');

    if (req.method === 'POST') {
      const data = req.body;
      const result = await collection.insertOne(data);
      return res.status(201).json({ _id: result.insertedId, ...data });
    } else if (req.method === 'GET') {
      const { slug, id } = req.query;
      
      if (id && typeof id === 'string') {
        const item = await collection.findOne({ _id: new ObjectId(id) });
        if (!item) return res.status(404).json({ error: 'Not found' });
        return res.status(200).json(normalizeChadhava(item as unknown as ChadhavaRecord));
      }

      const items = await collection.find({}).toArray();
      const normalized = (items.length > 0 ? items : fallbackChadhava).map((item) => normalizeChadhava(item as unknown as ChadhavaRecord));

      if (slug && typeof slug === 'string') {
        const found = normalized.find(i => i.slug === slug);
        if (!found) return res.status(404).json({ error: 'Not found' });
        return res.status(200).json(found);
      }

      return res.status(200).json(normalized);
    } else if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'ID is required' });
      await collection.deleteOne({ _id: new ObjectId(id as string) });
      return res.status(200).json({ success: true });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
