const mongoose = require('mongoose');
require('dotenv').config();

async function migrateJobIds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Get raw collection reference instead of using models
    const collection = mongoose.connection.db.collection('jobquestions');
    const questions = await collection.find({}).toArray();
    
    for (const question of questions) {
      const validJobIds = [];
      for (const rawId of question.jobIds) {
        const id = String(rawId).trim();
        
        if (mongoose.isValidObjectId(id)) {
          validJobIds.push(new mongoose.Types.ObjectId(id));
        } 
        // Handle nested objects from previous population
        else if (id && id._id) {
          validJobIds.push(new mongoose.Types.ObjectId(id._id));
        }
      }

      // Update if changes needed
      if (validJobIds.length !== question.jobIds.length) {
        console.log(`Updating question ${question._id}`);
        await collection.updateOne(
          { _id: question._id },
          { $set: { jobIds: validJobIds } }
        );
      }
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateJobIds(); 