// pages/api/admin/applications.ts
import { NextApiRequest, NextApiResponse } from 'next'
import mongoose from 'mongoose'
import { Application } from '@/models/application'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Connect to MongoDB
      await mongoose.connect(process.env.MONGODB_URI!, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000
      })

      // Fetch all applications
      const applications = await Application.find().lean()
      
      res.status(200).json(applications)
    } catch (error) {
      console.error('Failed to fetch applications:', error)
      res.status(500).json({ error: 'Failed to fetch applications' })
    } finally {
      // Disconnect from MongoDB
      await mongoose.disconnect()
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}