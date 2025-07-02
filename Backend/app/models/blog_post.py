from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime

class SocialLinks(BaseModel):
    twitter: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    website: Optional[str] = None

class AuthorProfile(BaseModel):
    name: str
    bio: str
    profile_image: str
    title: str
    social_links: Optional[SocialLinks] = None

class BlogPost(BaseModel):
    id: str
    title: str
    content: str
    author: str  # Keep for backward compatibility
    author_profile: Optional[AuthorProfile] = None
    slug: str
    status: str = "draft"  # draft, published, archived
    featured_image: Optional[str] = None
    excerpt: Optional[str] = None
    categories: List[str] = []
    tags: List[str] = []
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()
    published_at: Optional[datetime] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    views: int = 0 