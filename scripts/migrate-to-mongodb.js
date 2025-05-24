const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const mongoose = require('mongoose');
const { 
  User, 
  Application, 
  JobPosting, 
  Notification, 
  UserSettings, 
  NotificationPreference, 
  BlogPost,
  JobQuestion
} = require('../prisma/mongodb-schema');

const prisma = new PrismaClient();
const MONGODB_URI = process.env.MONGODB_URI;

async function migrateData() {
  try {
    console.log('Starting migration from PostgreSQL to MongoDB...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    let data;
    try {
      data = JSON.parse(fs.readFileSync('./data_backup_2025-05-19T11-47-30-218Z.json', 'utf-8'));
      console.log('Using backup data from file');
    } catch (error) {
      console.log('No backup file found, fetching directly from PostgreSQL');
      data = {
        users: await prisma.user.findMany(),
        applications: await prisma.application.findMany(),
        jobQuestions: await prisma.jobQuestion.findMany(),
        jobPostings: await prisma.jobPosting.findMany({
          include: {
            questions: true
          }
        }),
        notifications: await prisma.notification.findMany(),
        userSettings: await prisma.userSettings.findMany(),
        notificationPreferences: await prisma.notificationPreference.findMany(),
        blogPosts: await prisma.blogPost.findMany(),
      };
    }
    
    // Clear existing collections
    console.log('Clearing existing MongoDB collections...');
    await Promise.all([
      User.deleteMany({}),
      Application.deleteMany({}),
      JobPosting.deleteMany({}),
      Notification.deleteMany({}),
      UserSettings.deleteMany({}),
      NotificationPreference.deleteMany({}),
      BlogPost.deleteMany({}),
      JobQuestion.deleteMany({})
    ]);

    // Migrate data without using _id field
    console.log('Migrating users...');
    for (const user of data.users) {
      const { id, ...userData } = user;
      await User.create(userData);
    }
    
    console.log('Migrating applications...');
    for (const application of data.applications) {
      try {
        const { id, ...applicationData } = application;
        // Set default values for required fields if they're missing
        const sanitizedData = {
          ...applicationData,
          resumeUrl: applicationData.resumeUrl || '',
          experience: applicationData.experience || 'Not specified',
          hearAbout: applicationData.hearAbout || 'Not specified',
          salary: applicationData.salary || 'Not specified'
        };
        await Application.create(sanitizedData);
      } catch (error) {
        console.warn(`Failed to migrate application: ${error.message}`);
        continue; // Skip failed records but continue migration
      }
    }
    
    console.log('Migrating job postings and questions...');
    const jobPostingMap = new Map();

    if (data.jobPostings && Array.isArray(data.jobPostings)) {
      for (const jobPosting of data.jobPostings) {
        try {
          const { id, questions, ...jobData } = jobPosting;
          
          // Create the job posting first
          const newJobPosting = await JobPosting.create({
            ...jobData,
            isActive: jobData.isActive ?? true // Set default if not present
          });
          jobPostingMap.set(id, newJobPosting._id);
          
          // Create questions if they exist
          if (questions && Array.isArray(questions) && questions.length > 0) {
            const questionPromises = questions.map(async question => {
              try {
                const { id: questionId, jobPostingId, ...questionData } = question;
                const newQuestion = await JobQuestion.create({
                  ...questionData,
                  jobId: newJobPosting._id.toString()
                });
                return newQuestion._id;
              } catch (error) {
                console.error(`Failed to create question for job ${jobPosting.title}:`, error);
                return null;
              }
            });
            
            const questionIds = (await Promise.all(questionPromises))
              .filter(id => id !== null);
            
            if (questionIds.length > 0) {
              // Update job posting with question references
              await JobPosting.findByIdAndUpdate(
                newJobPosting._id,
                { $set: { questions: questionIds } }
              );
            }
          }
          console.log(`✓ Migrated job posting: ${jobPosting.title}`);
        } catch (error) {
          console.error(`Failed to migrate job posting:`, error);
          continue; // Skip failed job but continue migration
        }
      }
      console.log(`✓ Completed migrating ${data.jobPostings.length} job postings`);
    } else {
      console.log('No job postings found in backup data, skipping...');
    }

    // Handle orphaned questions
    if (data.jobQuestions && Array.isArray(data.jobQuestions)) {
      console.log('Checking for orphaned questions...');
      for (const question of data.jobQuestions) {
        try {
          const { id, jobPostingId, ...questionData } = question;
          
          // Skip if already migrated with a job posting
          const existingQuestion = await JobQuestion.findOne({
            question: questionData.question,
            jobId: jobPostingId ? jobPostingMap.get(jobPostingId)?.toString() : null
          });
          
          if (!existingQuestion) {
            await JobQuestion.create({
              ...questionData,
              jobId: jobPostingId ? jobPostingMap.get(jobPostingId)?.toString() : null
            });
          }
        } catch (error) {
          console.error(`Failed to migrate orphaned question:`, error);
          continue;
        }
      }
      console.log(`✓ Completed checking orphaned questions`);
    } else {
      console.log('No orphaned questions found in backup data, skipping...');
    }
    
    console.log('Migrating notifications...');
    for (const notification of data.notifications) {
      const { id, ...notificationData } = notification;
      await Notification.create(notificationData);
    }
    
    console.log('Migrating user settings...');
    for (const settings of data.userSettings) {
      const { id, ...settingsData } = settings;
      await UserSettings.create(settingsData);
    }
    
    console.log('Migrating notification preferences...');
    for (const pref of data.notificationPreferences) {
      const { id, ...prefData } = pref;
      await NotificationPreference.create(prefData);
    }
    
    if (data.blogPosts?.length > 0) {
      console.log('Migrating blog posts...');
      for (const post of data.blogPosts) {
        const { id, ...postData } = post;
        await BlogPost.create(postData);
      }
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await mongoose.disconnect();
    await prisma.$disconnect();
  }
}

migrateData();