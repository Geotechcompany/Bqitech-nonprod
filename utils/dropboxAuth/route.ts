import axios from 'axios';

export async function refreshDropboxToken() {
  try {
    const response = await axios.post('https://api.dropbox.com/oauth2/token', null, {
      params: {
        grant_type: 'refresh_token',
        refresh_token: process.env.DROPBOX_REFRESH_TOKEN,
        client_id: process.env.DROPBOX_APP_KEY,
        client_secret: process.env.DROPBOX_APP_SECRET,
      },
    });

    const newAccessToken = response.data.access_token;
    
    // Update the environment variable or wherever you store the token
    process.env.DROPBOX_ACCESS_TOKEN = newAccessToken;

    return newAccessToken;
  } catch (error) {
    console.error('Failed to refresh Dropbox token:', error);
    return null;
  }
}