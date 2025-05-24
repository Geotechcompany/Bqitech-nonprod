import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
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
    const post = await prisma.blogPost.findUnique({
      where: { id: params.id }
    })

    if (!post) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(post)
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
  return updateBlogPost(request, params)
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
    
    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        title: validated.title,
        content: validated.content,
        excerpt: validated.excerpt,
        imageUrl: validated.imageUrl,
        category: validated.category,
        readTime: validated.readTime,
        published: validated.published ?? false,
      }
    })
    
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
    await prisma.blogPost.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Blog post deleted successfully" })
  } catch (error) {
    console.error("Failed to delete blog post:", error)
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 }
    )
  }
} 