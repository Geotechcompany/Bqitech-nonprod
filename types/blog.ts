export interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  imageUrl: string
  category: string
  readTime: string
  slug: string
  published: boolean
  createdAt: string
  updatedAt?: string
  authorId?: string
} 