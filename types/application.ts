interface User {
  id: string
  email: string
  name: string
  phoneNumber?: string
}

export interface Application {
    id: string
    name: string
    userId?: string
    user?: User
    email: string
    phoneNumber: string
    location: string
    position: string
    cvUrl: string
    hearAbout: string
    otherSource?: string
    experience: string
    salary: string
    status: string
    appliedDate: Date
    shortlistedDate?: string
    assessmentDate?: string
    assessmentScore?: number
    interviewDate?: string
    interviewer?: string
    hireDate?: string
    startDate?: string
    disqualifiedDate?: string
    disqualifiedReason?: string
    answers: Array<{
      questionText: string;
      answer: string;
    }>;
    cotsExperience?: string;
    sqlJavaScriptExperience?: string;
    reportDevelopmentExperience?: string;
    jobId?: {
      _id: string;
      title: string;
    };
  }
  
  export interface ShortlistedCandidate extends Application {
    shortlistedDate: string // Ensure this is not optional for shortlisted candidates
  }
  
  export interface TechnicalAssessmentCandidate extends Application {
    assessmentDate: string // Ensure this is not optional for technical assessment candidates
  }
  
  export interface InterviewingCandidate extends Application {
    interviewDate: string // Ensure this is not optional for interviewing candidates
    interviewer: string // Ensure this is not optional for interviewing candidates
  }
  
  export interface DisqualifiedCandidate extends Application {
    disqualifiedDate: string // Ensure this is not optional for disqualified candidates
    disqualifiedReason: string // Ensure this is not optional for disqualified candidates
  }
  
  export interface HiredCandidate extends Application {
    hireDate: string // Ensure this is not optional for hired candidates
    startDate: string // Ensure this is not optional for hired candidates
  }
  
  export interface ApiResponse {
    applications: ShortlistedCandidate[]
  }