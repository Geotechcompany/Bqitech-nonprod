import mongoose from 'mongoose';
import { JobQuestion } from '@/prisma/mongodb-schema';

async function migrateJobIds() {
  await mongoose.connect(process.env.MONGODB_URI!);
  
  // Get raw MongoDB collection handle
  const collection = mongoose.connection.db.collection('jobquestions');
  
  // Add jobIds field to all questions missing it
  const result = await collection.updateMany(
    { jobIds: { $exists: false } }, // Find documents without jobIds
    { $set: { jobIds: [] } }, // Set empty array
    { bypassDocumentValidation: true } // Skip schema validation
  );

  console.log(`Migrated ${result.modifiedCount} questions`);
  
  // Add index if needed
  await collection.createIndex({ jobIds: 1 });
  
  process.exit(0);
}

migrateJobIds().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
}); 