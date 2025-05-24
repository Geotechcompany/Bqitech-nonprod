import mongoose from 'mongoose'

const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: { type: String, required: true },
  imageUrl: { type: String, required: true },
  category: { type: String, required: true },
  readTime: { type: String, required: true },
  published: { type: Boolean, default: false },
  slug: { type: String, unique: true },
  authorId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

export const BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', blogPostSchema) 