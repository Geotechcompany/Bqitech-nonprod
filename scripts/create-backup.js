require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function createBackup() {
  try {
    console.log('Starting database backup...');

    // Initialize data object
    const data = {};

    // Fetch data with error handling for each model
    const models = [
      { name: 'user', query: prisma.user.findMany() },
      { name: 'application', query: prisma.application.findMany() },
      { name: 'jobPostings', query: prisma.jobPostings.findMany() },
      { name: 'notification', query: prisma.notification.findMany() },
      { name: 'userSettings', query: prisma.userSettings.findMany() },
      { name: 'notificationPreference', query: prisma.notificationPreference.findMany() },
      { name: 'blogPost', query: prisma.blogPost.findMany() }
    ];

    // Fetch data for each model
    for (const model of models) {
      try {
        console.log(`Fetching ${model.name}s...`);
        const result = await model.query;
        data[`${model.name}s`] = result;
        console.log(`✓ Successfully backed up ${result.length} ${model.name}s`);
      } catch (error) {
        if (error.code === 'P2022') {
          console.log(`⚠ Skipping ${model.name}s (table not found)`);
          continue;
        }
        throw error;
      }
    }

    // Create filename with current date and time
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `data_backup_${timestamp}.json`;
    
    // Write to file
    fs.writeFileSync(
      path.join(process.cwd(), filename),
      JSON.stringify(data, null, 2)
    );

    console.log(`\n✓ Backup completed successfully! File saved as: ${filename}`);
    
    // Log backup statistics
    console.log('\nBackup Statistics:');
    Object.entries(data).forEach(([key, value]) => {
      console.log(`${key}: ${value.length} records`);
    });

  } catch (error) {
    console.error('Error creating backup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the backup
createBackup()
  .then(() => console.log('\nBackup script completed'))
  .catch((error) => {
    console.error('Backup script failed:', error);
    process.exit(1);
  }); 