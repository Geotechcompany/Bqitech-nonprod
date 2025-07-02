import os
from pydantic import BaseModel, Field
from typing import List, Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseModel):
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = int(os.getenv("PORT", "10000"))
    debug: bool = False
    
    # Database
    DATABASE_URL: str = Field(default=os.getenv("MONGODB_URI"))
    MONGODB_URI: Optional[str] = Field(default=os.getenv("MONGODB_URI"))
    mongodb_uri: Optional[str] = os.getenv("MONGODB_URI")
    
    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "BQI Tech Backend"
    app_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:3000"
    
    # Security
    SECRET_KEY: str = Field(default=os.getenv("SECRET_KEY", "your-secret-key-change-in-production"))
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    algorithm: str = os.getenv("ALGORITHM", "HS256")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:10000",
        "https://bqitech.com",
        "https://bqitech-nonprod.netlify.app",
        "https://www.bqitech-nonprod.netlify.app"
    ]
    
    # Email Configuration
    smtp_host: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port: int = int(os.getenv("SMTP_PORT", "465"))
    smtp_user: str = os.getenv("SMTP_USER", "")
    smtp_pass: str = os.getenv("SMTP_PASS", "")
    from_email: str = os.getenv("FROM_EMAIL", "")
    hr_email: str = os.getenv("HR_EMAIL", "hr@bqitech.com")
    
    # Cloudinary Configuration
    cloudinary_cloud_name: str = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    cloudinary_api_key: str = os.getenv("CLOUDINARY_API_KEY", "")
    cloudinary_api_secret: str = os.getenv("CLOUDINARY_API_SECRET", "")
    
    # Redis Configuration
    redis_url: str = os.getenv("REDIS_URL", "")
    upstash_redis_rest_url: str = os.getenv("UPSTASH_REDIS_REST_URL", "")
    upstash_redis_rest_token: str = os.getenv("UPSTASH_REDIS_REST_TOKEN", "")
    
    # File Upload Configuration
    max_file_size: int = 10485760  # 10MB
    allowed_extensions: str = "pdf,doc,docx,jpg,jpeg,png,gif,webp"
    
    # Rate Limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 3600
    
    # Dropbox Configuration
    dropbox_app_key: str = os.getenv("DROPBOX_APP_KEY", "")
    dropbox_app_secret: str = os.getenv("DROPBOX_APP_SECRET", "")
    dropbox_access_token: str = os.getenv("DROPBOX_ACCESS_TOKEN", "")
    dropbox_refresh_token: str = os.getenv("DROPBOX_REFRESH_TOKEN", "")
    dropbox_redirect_uri: str = os.getenv("DROPBOX_REDIRECT_URI", "")
    
    # Pusher Configuration
    pusher_app_id: str = os.getenv("PUSHER_APP_ID", "")
    pusher_key: str = os.getenv("PUSHER_KEY", "")
    pusher_secret: str = os.getenv("PUSHER_SECRET", "")
    pusher_cluster: str = os.getenv("PUSHER_CLUSTER", "us2")
    
    # reCAPTCHA Configuration
    recaptcha_site_key: str = os.getenv("RECAPTCHA_SITE_KEY", "")
    recaptcha_secret_key: str = os.getenv("RECAPTCHA_SECRET_KEY", "")
    
    class Config:
        case_sensitive = False

# Initialize settings
settings = Settings() 