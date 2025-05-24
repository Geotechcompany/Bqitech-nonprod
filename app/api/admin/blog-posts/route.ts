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
    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        content: true,
        excerpt: true,
        imageUrl: true,
        category: true,
        readTime: true,
        slug: true,
        published: true,
        createdAt: true,
        updatedAt: true,
      }
    })
    console.log('Fetched posts:', posts)
    return NextResponse.json(posts)
  } catch (error) {
    console.error("Failed to fetch blog posts:", error)
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const validated = blogPostSchema.parse(data)
    
    const baseSlug = generateSlug(validated.title)

    const post = await prisma.blogPost.create({
      data: {
        title: validated.title,
        content: validated.content,
        excerpt: validated.excerpt,
        imageUrl: validated.imageUrl,
        category: validated.category,
        readTime: validated.readTime,
        published: validated.published ?? false,
        slug: baseSlug,
        authorId: "system"
      }
    })
    
    return NextResponse.json(post)
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