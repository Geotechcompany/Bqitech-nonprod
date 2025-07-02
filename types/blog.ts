export interface AuthorProfile {
  name: string
  bio: string
  profileImage: string
  title: string
  socialLinks?: {
    twitter?: string
    linkedin?: string
    github?: string
    website?: string
  }
}

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
  author?: string | AuthorProfile
  authorProfile?: AuthorProfile
  tags?: string[]
  metaDescription?: string
} 