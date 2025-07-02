from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

class UserNotificationCreate(BaseModel):
    title: str
    message: str
    type: str = "info"  # info, warning, error, success
    userId: str
    isRead: bool = False
    link: Optional[str] = None
    priority: str = "normal"  # low, normal, high, urgent

class UserNotificationUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    type: Optional[str] = None
    isRead: Optional[bool] = None
    link: Optional[str] = None
    priority: Optional[str] = None

class UserNotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    type: str
    userId: str
    isRead: bool
    link: Optional[str] = None
    priority: str
    createdAt: datetime
    updatedAt: datetime
    
    class Config:
        json_encoders = {
            ObjectId: str,
            datetime: lambda v: v.isoformat()
        } 