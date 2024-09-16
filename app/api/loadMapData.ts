import { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
let client: MongoClient;
let clientPromise: Promise<MongoClient>;


client = new MongoClient(uri);
clientPromise = client.connect();


export default async (req: VercelRequest, res: VercelResponse) => {
  const { key } = req.query;

  try {
    const client = await clientPromise;
    const database = client.db('mapData');
    const collection = database.collection('maps');

    const data = await collection.findOne({ key });

    if (data) {
      res.status(200).json(data);
    } else {
      res.status(404).json({ error: 'Data not found' });
    }
  } catch (error) {
    console.error('Error loading data:', error);
    res.status(500).json({ error: 'Failed to load data' });
  }
};