export interface JobPosting {
  _id: string;
  id: string;
  title: string;
  department?: string;
  location: string;
  
  description: string;
  postedDate: string;
  employmentType: string;
  category: string;
  isActive: boolean;
  salary?: {
    currency: string;
    min: number;
    max: number;
  } | null;
  questions: string[];
}
