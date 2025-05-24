import fetch from 'node-fetch';

interface QuestionData {
  jobId: string;
  question: string;
  type: 'text' | 'select' | 'radio' | 'boolean' | 'file';
  options: string[];
  required: boolean;
  order: number;
}

// Add a type for job
interface Job {
  id: string;
  title: string;
}

// Add interface for the response
interface QuestionResponse {
  id: string;
  [key: string]: any;
}

async function postQuestions() {
  try {
    // First, fetch all job postings
    const jobsResponse = await fetch('http://localhost:3000/api/admin/jobs');
    if (!jobsResponse.ok) {
      throw new Error(`Failed to fetch jobs: ${jobsResponse.statusText}`);
    }
    
    // Cast the response to the correct type
    const jobs = await jobsResponse.json() as Job[];
    
    if (jobs.length === 0) {
      console.log('No job postings found. Please create job postings first.');
      return;
    }
    
    // Log available jobs
    console.log('Available jobs:');
    jobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title} (${job.id})`);
    });
    
    // Common questions from the form in the image
    const commonQuestions: Omit<QuestionData, 'jobId'>[] = [
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
    
    // Post each question for each job
    for (const job of jobs) {
      console.log(`\nPosting questions for job: ${job.title}`);
      
      for (const questionData of commonQuestions) {
        const fullQuestionData = {
          ...questionData,
          jobId: job.id
        };
        
        console.log(`Posting question: "${questionData.question}"`);
        
        const response = await fetch('http://localhost:3000/api/admin/questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(fullQuestionData),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to post question "${questionData.question}": ${errorText}`);
          continue;
        }
        
        const result = await response.json() as QuestionResponse;
        console.log(`Successfully posted question: "${questionData.question}" (ID: ${result.id})`);
      }
    }
    
    console.log('\nAll questions posted successfully!');
  } catch (error) {
    console.error('Error posting questions:', error);
  }
}

postQuestions()
  .then(() => console.log('Script completed'))
  .catch((e) => console.error('Script failed:', e)); 