import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error(
    'Missing MONGODB_URI: add it to .env.local locally, or in Vercel under Project Settings → Environment Variables (Production).'
  );
}

const uri = process.env.MONGODB_URI;
const options = {};

interface MongoGlobal {
  _mongoClientPromise?: Promise<MongoClient>;
}

const globalWithMongo = globalThis as typeof globalThis & MongoGlobal;

// One client promise per runtime isolate (recommended for Next.js on Vercel).
if (!globalWithMongo._mongoClientPromise) {
  const client = new MongoClient(uri, options);
  globalWithMongo._mongoClientPromise = client.connect();
}

const clientPromise: Promise<MongoClient> = globalWithMongo._mongoClientPromise;

export default clientPromise;
