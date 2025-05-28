import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

interface GlobalWithMongoose extends Global {
  mongoose?: CachedConnection;
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as GlobalWithMongoose).mongoose;

if (!cached) {
  cached = (global as GlobalWithMongoose).mongoose = {
    conn: null,
    promise: null
  };
}

export async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) return { db: mongoose.connection.db };

  const conn = await mongoose.connect(process.env.MONGODB_URI!, {
    serverSelectionTimeoutMS: 5000
  });

  return { db: conn.connection.db };
}

export default connectToDatabase; 