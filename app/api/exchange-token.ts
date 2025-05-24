
   import { NextApiRequest, NextApiResponse } from 'next'
   import axios from 'axios'

   export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     const { code } = req.query

     if (!code) {
       return res.status(400).json({ error: 'Authorization code is required' })
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

       const { access_token, refresh_token } = response.data

       // Store tokens securely (e.g., in a database or environment variables)
       // For demonstration, we'll just return them in the response
       return res.status(200).json({ access_token, refresh_token })
     } catch (error) {
       console.error('Error exchanging token:', error)
       return res.status(500).json({ error: 'Failed to exchange token' })
     }
   }