import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/priest_service";
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
