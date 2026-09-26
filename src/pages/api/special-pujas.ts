import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('puja');

    if (req.method === 'POST') {
      const puja = req.body;
      if (!puja) return res.status(400).json({ error: 'Puja data is required' });
      const result = await collection.insertOne(puja);
      return res.status(201).json({ insertedId: result.insertedId, ...puja });
    } else if (req.method === 'GET') {
      // Find pujas that have a badge indicating it's a special puja
      const pujas = await collection.find({ badge: { $regex: /special/i } }).toArray();
      return res.status(200).json(pujas);
    } else if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'ID is required' });
      await collection.deleteOne({ _id: new ObjectId(id as string) });
      return res.status(200).json({ success: true });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('API error:', error);
    return res.status(500).json({
      error: 'Failed to process request',
      details: error.message || error.toString(),
    });
  }
}