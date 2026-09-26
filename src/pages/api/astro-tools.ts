import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('astro-tools');

    if (req.method === 'POST') {
      const data = req.body;
      const result = await collection.insertOne(data);
      return res.status(201).json({ _id: result.insertedId, ...data });
    } else if (req.method === 'GET') {
      const items = await collection.find({}).toArray();
      return res.status(200).json(items);
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
