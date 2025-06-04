// pages/api/admin/applications.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from '@/lib/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { db } = await connectToDatabase();
      const applications = await db.collection('applications')
        .find()
        .toArray();
      
      res.status(200).json(applications);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      res.status(500).json({ error: 'Failed to fetch applications' });
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}