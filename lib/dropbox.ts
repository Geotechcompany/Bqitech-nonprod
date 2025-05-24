import { Dropbox } from "dropbox"

export async function getDropboxAccessToken(): Promise<string> {
  // If you're using refresh tokens
  if (process.env.DROPBOX_REFRESH_TOKEN) {
    const response = await fetch('https://api.dropbox.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: process.env.DROPBOX_REFRESH_TOKEN,
        client_id: process.env.DROPBOX_APP_KEY!,
        client_secret: process.env.DROPBOX_APP_SECRET!,
      }),
    })

    const data = await response.json()
    return data.access_token
  }

  // If you're using a long-lived access token
  return process.env.DROPBOX_ACCESS_TOKEN!
} 