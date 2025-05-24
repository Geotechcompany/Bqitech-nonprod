import { NextResponse } from "next/server"
import mongoose from 'mongoose'
import { BlogPost } from '@/models/blogPost'

export async function GET(request: Request) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!)

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const query = {
      published: true,
      ...(category && {
        category: {
          $eq: category.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        }
      })
    }

    const posts = await BlogPost.find(query)
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(posts)
  } catch (error) {
    console.error("Failed to fetch blog posts:", error)
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    )
  } finally {
    await mongoose.disconnect()
  }
} 