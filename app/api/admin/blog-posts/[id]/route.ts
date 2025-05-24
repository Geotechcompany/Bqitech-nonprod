import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import mongoose from 'mongoose'
import { BlogPost } from '@/models/blogPost'
import { z } from "zod"

const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  imageUrl: z.string().min(1, "Image URL is required"),
  category: z.string().min(1, "Category is required"),
  readTime: z.string().min(1, "Read time is required"),
  published: z.boolean().optional().default(false),
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    const post = await BlogPost.findById(params.id)
    
    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(post)
  } catch (error) {
    console.error('Failed to fetch blog post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
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
  return updateBlogPost(request, params)
}

// Shared update function
async function updateBlogPost(
  request: Request,
  { id }: { id: string }
) {
  try {
    const data = await request.json()
    const validated = blogPostSchema.parse(data)
    
    const post = await BlogPost.findByIdAndUpdate(id, {
      title: validated.title,
      content: validated.content,
      excerpt: validated.excerpt,
      imageUrl: validated.imageUrl,
      category: validated.category,
      readTime: validated.readTime,
      published: validated.published ?? false,
    }, { new: true }).lean()
    
    return NextResponse.json(post)
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
    await connectToDatabase()
    await BlogPost.findByIdAndDelete(params.id)
    return NextResponse.json({ message: 'Blog post deleted successfully' })
  } catch (error) {
    console.error('Failed to delete blog post:', error)
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    )
  }
} 