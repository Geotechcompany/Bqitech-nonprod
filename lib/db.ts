// lib/db.ts
import mongoose from 'mongoose'
import { Application } from '@/models/application'

export const getStatuses = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!)
    const statuses = await Application.distinct('status')
    return statuses
  } catch (error) {
    console.error('Error fetching statuses:', error)
    return []
  } finally {
    await mongoose.disconnect()
  }
}