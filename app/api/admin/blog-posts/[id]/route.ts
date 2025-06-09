import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import mongoose from 'mongoose'
import { BlogPost } from '@/models/blogPost'
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
  createdAt: Date
  updatedAt: Date
}

const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  excerpt: z.string().min(1, "Excerpt is required").max(300, "Excerpt must be less than 300 characters").optional(),
  content: z.string().min(1, "Content is required").optional(),
  imageUrl: z.string().min(1, "Featured image is required").url("Must be a valid URL").optional(),
  category: z.string().min(1, "Category is required").optional(),
  readTime: z.string().min(1, "Read time is required").optional(),
  published: z.boolean().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id || !mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid blog post ID" },
        { status: 400 }
      )
    }

    await connectToDatabase()
    const post = await BlogPost.findById<BlogPostDocument>(params.id).lean()

    if (!post) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      )
    }

    // Transform the response to match frontend expectations
    const transformedPost = {
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
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    }

    return NextResponse.json(transformedPost)
  } catch (error) {
    console.error("Failed to fetch blog post:", error)
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
      { status: 500 }
    )
  }
}

// Handle both PUT and PATCH methods
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    await connectToDatabase()
    
    const updatedPost = await BlogPost.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: new Date() },
      { new: true }
    )
    
    if (!updatedPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('Failed to update blog post:', error)
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (!params.id || !mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid blog post ID" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = blogPostSchema.parse(body)

    await connectToDatabase()
    
    // If only updating published status, don't require other fields
    if (Object.keys(validatedData).length === 1 && 'published' in validatedData) {
      const post = await BlogPost.findByIdAndUpdate<BlogPostDocument>(
        params.id,
        { published: validatedData.published },
        { new: true, runValidators: true }
      ).lean()

      if (!post) {
        return NextResponse.json(
          { error: "Blog post not found" },
          { status: 404 }
        )
      }

      return NextResponse.json(post)
    }

    // For other updates, ensure required fields are present
    const post = await BlogPost.findById<BlogPostDocument>(params.id).lean()
    if (!post) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      )
    }

    const updatedPost = await BlogPost.findByIdAndUpdate<BlogPostDocument>(
      params.id,
      { 
        ...validatedData,
        published: validatedData.published,
        slug: validatedData.title 
          ? validatedData.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '')
              .substring(0, 60)
          : post.slug
      },
      { new: true, runValidators: true }
    ).lean()

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error("Failed to update blog post:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update blog post" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (!params.id || !mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid blog post ID" },
        { status: 400 }
      )
    }

    await connectToDatabase()
    const post = await BlogPost.findByIdAndDelete<BlogPostDocument>(params.id)

    if (!post) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "Blog post deleted successfully" })
  } catch (error) {
    console.error("Failed to delete blog post:", error)
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 }
    )
  }
} 