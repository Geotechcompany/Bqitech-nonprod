import { NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(req: Request) {
  const { code } = await req.json() // Get the code from the request body

  if (!code) {
    return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 })
  }

  try {
    const response = await axios.post('https://api.dropbox.com/oauth2/token', null, {
      params: {
        grant_type: 'authorization_code',
        code: code,
        client_id: process.env.DROPBOX_APP_KEY,
        client_secret: process.env.DROPBOX_APP_SECRET,
        redirect_uri: process.env.DROPBOX_REDIRECT_URI, // Ensure this matches your app settings
      },
    })

    const {  refresh_token } = response.data

    // Store tokens securely (e.g., in a database or environment variables)
    // For demonstration, we'll just return them in the response
    return NextResponse.json({  refresh_token })
  } catch (error) {
    console.error('Error exchanging token:', error)
    return NextResponse.json({ error: 'Failed to exchange token' }, { status: 500 })
  }
}