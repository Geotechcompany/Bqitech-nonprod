import { NextResponse } from "next/server"
import mongoose from 'mongoose'
import { BlogPost } from '@/models/blogPost'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!)

    const post = await BlogPost.findOne({ 
      slug: params.slug,
      published: true
    }).lean()

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
  } finally {
    await mongoose.disconnect()
  }
} 