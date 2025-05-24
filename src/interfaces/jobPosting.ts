export interface IJobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  description: string;
  requirements?: string;
  postedDate: Date;
  applications?: Array<{
    id: string;
    status: string;
    appliedDate: Date;
  }>;
  isActive?: boolean;
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
} 