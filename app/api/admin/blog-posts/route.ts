import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import mongoose from 'mongoose'
import { z } from "zod"

const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  author: { type: String, required: true },
  publishedAt: { type: Date, default: Date.now },
  isPublished: { type: Boolean, default: false },
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', blogPostSchema)

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 60) // Limit length
}

// Add dynamic config to prevent static generation
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectToDatabase()
    const posts = await BlogPost.find().sort({ publishedAt: -1 })
    return NextResponse.json(posts)
  } catch (error) {
    console.error("Failed to fetch blog posts:", error)
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    await connectToDatabase()
    
    const post = await BlogPost.create({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error("Failed to create blog post:", error)
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    )
  }
} 