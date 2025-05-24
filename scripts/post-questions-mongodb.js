require('dotenv').config();
const mongoose = require('mongoose');
const { JobPosting, JobQuestion } = require('../prisma/mongodb-schema');

const commonQuestions = [
  {
    question: 'First Name',
    type: 'text',
    options: [],
    required: true,
    order: 1,
  },
  {
    question: 'Last Name',
    type: 'text',
    options: [],
    required: true,
    order: 2,
  },
  {
    question: 'Email',
    type: 'text',
    options: [],
    required: true,
    order: 3,
  },
  {
    question: 'Phone Number',
    type: 'text',
    options: [],
    required: true,
    order: 4,
  },
  {
    question: 'How many years of full-time work experience do you have?',
    type: 'select',
    options: [
      'Less than 1 year',
      '1-2 years',
      '3-5 years',
      '6-10 years',
      'More than 10 years'
    ],
    required: true,
    order: 5,
  },
  {
    question: 'Do you have at least 2 years of experience in configuration COTS software?',
    type: 'radio',
    options: ['Yes', 'No'],
    required: true,
    order: 6,
  },
  {
    question: 'Do you have experience in SQL scripting (Oracle or SQL Server) and JavaScript?',
    type: 'radio',
    options: ['Yes', 'No'],
    required: true,
    order: 7,
  },
  {
    question: 'Have you worked on report development using SSRS or Crystal Reports?',
    type: 'radio',
    options: ['Yes', 'No'],
    required: true,
    order: 8,
  },
  {
    question: 'Salary Expectation (In Kenyan Shillings)',
    type: 'text',
    options: [],
    required: true,
    order: 9,
  }
];

async function postQuestions() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Fetch all active job postings
    const jobPostings = await JobPosting.find({ isActive: true });
    
    if (jobPostings.length === 0) {
      console.log('No active job postings found. Please create job postings first.');
      return;
    }

    console.log(`Found ${jobPostings.length} active job postings`);

    // For each job posting
    for (const jobPosting of jobPostings) {
      console.log(`\nProcessing questions for job: ${jobPosting.title}`);

      // Check if questions already exist for this job
      const existingQuestions = await JobQuestion.find({ jobId: jobPosting._id });
      
      if (existingQuestions.length > 0) {
        console.log(`Questions already exist for ${jobPosting.title}. Skipping...`);
        continue;
      }

      // Create questions for this job
      const questionPromises = commonQuestions.map(async (questionData) => {
        const fullQuestionData = {
          ...questionData,
          jobId: jobPosting._id.toString()
        };

        console.log(`Creating question: "${questionData.question}"`);
        
        try {
          const newQuestion = await JobQuestion.create(fullQuestionData);
          console.log(`Successfully created question: "${questionData.question}" (ID: ${newQuestion._id})`);
          return newQuestion._id;
        } catch (error) {
          console.error(`Failed to create question "${questionData.question}":`, error.message);
          return null;
        }
      });

      // Wait for all questions to be created
      const questionIds = (await Promise.all(questionPromises)).filter(id => id !== null);

      // Update job posting with question references
      await JobPosting.findByIdAndUpdate(
        jobPosting._id,
        { $set: { questions: questionIds } }
      );

      console.log(`Added ${questionIds.length} questions to job: ${jobPosting.title}`);
    }

    console.log('\nAll questions posted successfully!');
  } catch (error) {
    console.error('Error posting questions:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
postQuestions()
  .then(() => console.log('Script completed'))
  .catch((e) => console.error('Script failed:', e)); 