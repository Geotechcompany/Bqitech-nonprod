from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class BlogPost(BaseModel):
    id: str
    title: str
    content: str
    author: str
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