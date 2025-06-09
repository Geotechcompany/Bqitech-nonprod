interface Question {
  _id: string;
  jobIds: string[];
  question: string;
  type: string;
  // ... other fields
}

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  imageUrl: string
  category: string
  readTime: string
  published: boolean
  slug: string
  author: string
  tags: string[]
  views: number
  likes: number
  metaDescription: string
  createdAt: string
  updatedAt: string
} 