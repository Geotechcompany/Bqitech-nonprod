import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import mongoose from 'mongoose'
import { BlogPost } from "@/models/blogPost"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

interface BlogPostDocument {
  _id: mongoose.Types.ObjectId
  title: string
  excerpt?: string
  content: string
  imageUrl?: string
  category?: string
  readTime?: string
  published: boolean
  slug: string
  author: string
  tags?: string[]
  metaDescription?: string
  createdAt: Date
  updatedAt: Date
}

const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  excerpt: z.string().min(1, "Excerpt is required").max(300, "Excerpt must be less than 300 characters"),
  content: z.string().min(1, "Content is required"),
  imageUrl: z.string().min(1, "Featured image is required").url("Must be a valid URL"),
  category: z.string().min(1, "Category is required"),
  readTime: z.string().min(1, "Read time is required"),
  published: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  metaDescription: z.string().max(160, "Meta description must be less than 160 characters").optional(),
})

// Add dynamic config to prevent static generation
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectToDatabase()
    const posts = await BlogPost.find<BlogPostDocument>()
      .sort({ createdAt: -1 })
      .lean()
      .exec()

    // Transform the response to match frontend expectations
    const transformedPosts = posts.map(post => ({
      id: post._id.toString(),
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || "",
      imageUrl: post.imageUrl || "",
      category: post.category || "",
      readTime: post.readTime || "",
      published: post.published,
      slug: post.slug,
      author: post.author,
      tags: post.tags || [],
      metaDescription: post.metaDescription || "",
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    }))

    return NextResponse.json(transformedPosts)
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
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validatedData = blogPostSchema.parse(body)
    
    await connectToDatabase()
    
    // Generate SEO-friendly slug from title
    const slug = validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100)
    
    // Create the blog post with all fields
    const post = await BlogPost.create({
      ...validatedData,
      published: validatedData.published,
      slug,
      author: session.user.id,
      metaDescription: validatedData.metaDescription || validatedData.excerpt.substring(0, 160),
      tags: validatedData.tags || [],
      views: 0,
      likes: 0,
    })

    // Transform the response to match frontend expectations
    const transformedPost = {
      id: post._id.toString(),
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      imageUrl: post.imageUrl,
      category: post.category,
      readTime: post.readTime,
      published: post.published,
      slug: post.slug,
      author: post.author,
      tags: post.tags || [],
      metaDescription: post.metaDescription,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    }
    
    return NextResponse.json(transformedPost, { status: 201 })
  } catch (error) {
    console.error("Failed to create blog post:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    )
  }
} 