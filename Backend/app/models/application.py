from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema: Any, handler: Any) -> dict[str, Any]:
        json_schema = handler(core_schema)
        json_schema.update(type="string")
        return json_schema

class Answer(BaseModel):
    value: Any

    model_config = {
        "json_schema_extra": {
            "example": {
                "value": "answer1"
            }
        }
    }

class Application(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id")
    jobId: PyObjectId
    cvUrl: str
    answers: List[Answer]
    appliedDate: datetime
    status: str = "New"
    position: str
    userId: Optional[PyObjectId] = None

    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {
            ObjectId: str,
            datetime: lambda dt: dt.isoformat()
        },
        "json_schema_extra": {
            "example": {
                "_id": "683558b1dd79cc67e0a4926a",
                "jobId": "682b293a27eefc80eae4f51a",
                "cvUrl": "https://dl.dropboxusercontent.com/scl/fi/f17p451wySnmgcdm4cGbc/Aggrey-_",
                "answers": [{"value": "answer1"}, {"value": "answer2"}],
                "appliedDate": "2025-05-27T06:16:17.269Z",
                "status": "New",
                "position": "Junior Salesforce Developer",
                "userId": "6833934f545a3e59dbff6c2c"
            }
        }
    } 