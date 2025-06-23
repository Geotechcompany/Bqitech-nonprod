import os
import logging
import requests
from datetime import datetime, timedelta
from typing import Optional, Dict

logger = logging.getLogger(__name__)

class DropboxTokenManager:
    def __init__(self):
        self.app_key = os.getenv("DROPBOX_APP_KEY")
        self.app_secret = os.getenv("DROPBOX_APP_SECRET")
        self.refresh_token = os.getenv("DROPBOX_REFRESH_TOKEN")
        self.access_token = os.getenv("DROPBOX_ACCESS_TOKEN")
        self.token_expiry: Optional[datetime] = None
        
    async def get_access_token(self) -> str:
        """Get a valid access token, refreshing if necessary."""
        if not self._is_token_valid():
            await self._refresh_access_token()
        return self.access_token

    def _is_token_valid(self) -> bool:
        """Check if the current access token is valid."""
        if not self.access_token or not self.token_expiry:
            return False
        # Add 5 minutes buffer before expiry
        return datetime.utcnow() < (self.token_expiry - timedelta(minutes=5))

    async def _refresh_access_token(self) -> None:
        """Refresh the access token using the refresh token."""
        try:
            response = requests.post(
                "https://api.dropbox.com/oauth2/token",
                data={
                    "grant_type": "refresh_token",
                    "refresh_token": self.refresh_token,
                    "client_id": self.app_key,
                    "client_secret": self.app_secret,
                }
            )
            response.raise_for_status()
            
            data = response.json()
            self.access_token = data["access_token"]
            # Dropbox tokens typically expire in 4 hours
            self.token_expiry = datetime.utcnow() + timedelta(seconds=data.get("expires_in", 14400))
            
            logger.info("Successfully refreshed Dropbox access token")
            
        except Exception as e:
            logger.error(f"Failed to refresh Dropbox token: {str(e)}")
            raise

# Global token manager instance
token_manager = DropboxTokenManager()

async def get_dropbox_access_token() -> str:
    """Get a valid Dropbox access token."""
    return await token_manager.get_access_token() 