from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class NotificationType(str, Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    SUCCESS = "success"

class NotificationBase(BaseModel):
    title: str
    message: str
    type: NotificationType = Field(default=NotificationType.INFO)
    date: datetime
    isRead: bool = False
    userId: Optional[str] = None

class NotificationCreate(NotificationBase):
    pass

class NotificationUpdate(BaseModel):
    isRead: Optional[bool] = None
    title: Optional[str] = None
    message: Optional[str] = None
    type: Optional[NotificationType] = None
    date: Optional[datetime] = None

class NotificationResponse(NotificationBase):
    id: str
    createdAt: datetime
    updatedAt: datetime
    __v: int = 0
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        } 