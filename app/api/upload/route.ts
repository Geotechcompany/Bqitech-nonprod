import { NextRequest, NextResponse } from "next/server"
import { Dropbox } from "dropbox"
import { getDropboxAccessToken } from "@/lib/dropbox"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Get file buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
    const filename = `${file.name.split('.')[0]}-${uniqueSuffix}.${file.name.split('.').pop()}`
    
    // Initialize Dropbox
    const accessToken = await getDropboxAccessToken()
    const dbx = new Dropbox({ 
      accessToken,
      fetch: fetch // Provide the fetch implementation
    })

    // Upload to Dropbox
    const uploadResponse = await dbx.filesUpload({
      path: `/blog-images/${filename}`,
      contents: buffer,
    })

    // Get shared link
    const sharedLinkResponse = await dbx.sharingCreateSharedLink({
      path: uploadResponse.result.path_display || ''
    })

    // Convert shared link to direct link
    const directLink = sharedLinkResponse.result.url
      .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
      .replace('?dl=0', '')

    return NextResponse.json({ url: directLink }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST'
      }
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    )
  }
} 