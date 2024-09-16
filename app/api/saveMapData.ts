import { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

interface MapData {
  cities: string[];
  prefectures: string[];
  cityColors: { [key: string]: string };
  selectedLayer: string;
}

const uri = process.env.MONGODB_URI || '';
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!client) {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default async (req: VercelRequest, res: VercelResponse) => {
  const { cities, prefectures, cityColors, selectedLayer }: MapData = req.body;
  const key = Math.random().toString(36).substring(2, 10); // ランダムなキーを生成

  try {
    const client = await clientPromise;
    const database = client.db('mapData');
    const collection = database.collection('maps');

    await collection.insertOne({ key, cities, prefectures, cityColors, selectedLayer });

    res.status(200).json({ key });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
};