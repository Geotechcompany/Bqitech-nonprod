from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class Answer(BaseModel):
    questionText: str
    answer: str

class Application(BaseModel):
    id: str
    name: str
    email: str
    phoneNumber: Optional[str] = None
    position: str
    status: str = "Applied"
    cvUrl: Optional[str] = None
    answers: Optional[List[Answer]] = None
    appliedDate: datetime = datetime.utcnow()
    updatedDate: Optional[datetime] = None
    interviewingDate: Optional[datetime] = None
    hiredDate: Optional[datetime] = None
    rejectedDate: Optional[datetime] = None
    disqualifiedDate: Optional[datetime] = None
    notes: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None 