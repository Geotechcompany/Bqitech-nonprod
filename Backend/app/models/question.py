from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class Question(BaseModel):
    id: str
    text: str
    type: str  # text, multiple_choice, checkbox, etc.
    required: bool = True
    options: Optional[List[str]] = None  # For multiple choice questions
    order: int = 0
    category: Optional[str] = None
    job_ids: List[str] = []  # List of job IDs this question is associated with
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow() 