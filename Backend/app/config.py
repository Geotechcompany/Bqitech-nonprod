import os
from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List, Optional

class Settings(BaseSettings):
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False
    
    # Database
    DATABASE_URL: str = Field(default="mongodb://localhost:27017/bqitech", alias="DATABASE_URL")
    MONGODB_URI: Optional[str] = Field(default=None, alias="MONGODB_URI")
    mongodb_uri: Optional[str] = None
    
    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "BQI Tech Backend"
    app_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:3000"
    
    # Security
    SECRET_KEY: str = Field(default="your-secret-key-change-in-production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    algorithm: str = "HS256"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    
    # Email Configuration
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 465
    smtp_user: str = ""
    smtp_pass: str = ""
    from_email: str = ""
    hr_email: str = "hr@bqitech.com"
    
    # Cloudinary Configuration
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""
    
    # Redis Configuration
    redis_url: str = ""
    upstash_redis_rest_url: str = ""
    upstash_redis_rest_token: str = ""
    
    # File Upload Configuration
    max_file_size: int = 10485760  # 10MB
    allowed_extensions: str = "pdf,doc,docx"
    
    # Rate Limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 3600
    
    # Dropbox Configuration
    dropbox_app_key: str = ""
    dropbox_app_secret: str = ""
    dropbox_access_token: str = ""
    dropbox_refresh_token: str = ""
    dropbox_redirect_uri: str = ""
    
    # Pusher Configuration
    pusher_app_id: str = ""
    pusher_key: str = ""
    pusher_secret: str = ""
    pusher_cluster: str = "us2"
    
    # reCAPTCHA Configuration
    recaptcha_site_key: str = ""
    recaptcha_secret_key: str = ""
    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False
    }

settings = Settings() 