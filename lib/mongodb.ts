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
  if (mongoose.connection.readyState === 1) return;
  
  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
      heartbeatFrequencyMS: 10000,
      waitQueueTimeoutMS: 15000
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      if (err.name === 'MongoNetworkError') {
        setTimeout(connectToDatabase, 5000);
      }
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting reconnect...');
      setTimeout(connectToDatabase, 5000);
    });

  } catch (error) {
    console.error('Initial connection failed:', error);
    throw error;
  }
}

export default connectToDatabase; 