import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  db: any | null;
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
    promise: null,
    db: null
  };
}

const MAX_RETRIES = 3;
let retryCount = 0;

export function isConnected(): boolean {
  return cached.conn?.connection.readyState === 1;
}

export async function connectToDatabase() {
  if (await isConnected()) {
    return { db: cached.db! };
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI!, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 60000,
      maxPoolSize: 25,
      waitQueueTimeoutMS: 15000,
      retryWrites: true,
      retryReads: true
    }).then(async (conn) => {
      await conn.connection.db.admin().ping();
      conn.connection.on('error', err => {
        console.error('MongoDB connection error:', err);
        cached.conn = null;
        cached.db = null;
        cached.promise = null;
      });
      return conn;
    }).catch(error => {
      cached.promise = null;
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
    cached.db = cached.conn.connection.db;
    return { db: cached.db! };
  } catch (error) {
    cached.promise = null;
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(`Retrying connection (${retryCount}/${MAX_RETRIES})...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      return connectToDatabase();
    }
    throw new Error('Database connection failed after retries');
  }
}

export default connectToDatabase; 