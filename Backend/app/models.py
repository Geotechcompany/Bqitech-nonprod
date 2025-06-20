from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime

class User(BaseModel):
    email: EmailStr
    name: str
    role: Optional[str] = "USER"
    is_active: Optional[bool] = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class Application(BaseModel):
    name: str
    email: EmailStr
    phone_number: Optional[str]
    position: str
    cv_url: Optional[str]
    status: Optional[str] = "applied"
    applied_date: Optional[datetime] = None
    user_id: Optional[str] = None

class Job(BaseModel):
    title: str
    description: str
    requirements: Optional[List[str]] = []
    department: Optional[str]
    location: Optional[str]
    is_active: Optional[bool] = True
    created_at: Optional[datetime] = None

class BlogPost(BaseModel):
    title: str
    content: str
    author_id: str
    is_published: Optional[bool] = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class Question(BaseModel):
    text: str
    type: Optional[str] = "text"
    job_ids: Optional[List[str]] = []
    order: Optional[int] = 0
    is_required: Optional[bool] = True 