from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Any, ClassVar
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

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "user"

class UserCreate(UserBase):
    password: str

    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "Geoffrey Audia Aldwin",
                "email": "geoffrey@example.com",
                "password": "strongpassword123",
                "role": "user"
            }
        }
    }

class UserUpdate(UserBase):
    password: Optional[str] = None
    emailVerified: Optional[datetime] = None
    is_verified: Optional[bool] = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "Geoffrey Audia Aldwin",
                "email": "geoffrey@example.com",
                "role": "user",
                "is_verified": True
            }
        }
    }

class User(UserBase):
    id: Optional[PyObjectId] = Field(alias="_id")
    password: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    version: Optional[int] = Field(0, alias="__v")
    emailVerified: Optional[datetime] = None
    is_verified: bool = False
    updated_at: Optional[datetime] = None

    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {
            ObjectId: str,
            datetime: lambda dt: dt.isoformat()
        },
        "json_schema_extra": {
            "example": {
                "_id": "6833934f545a3e59dbff6c2c",
                "name": "Geoffrey Audia Aldwin",
                "email": "geoffrey@example.com",
                "password": "hashedpassword123",
                "role": "user",
                "createdAt": "2024-03-19T10:00:00",
                "updatedAt": "2024-03-19T10:00:00",
                "__v": 0,
                "is_verified": False
            }
        }
    }

class UserProfile(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: str | None = None

class PasswordChange(BaseModel):
    currentPassword: str = Field(..., min_length=1)
    newPassword: str = Field(..., min_length=8)
    confirmPassword: str = Field(..., min_length=8)

    class Config:
        json_schema_extra = {
            "example": {
                "currentPassword": "current123",
                "newPassword": "newpassword123",
                "confirmPassword": "newpassword123"
            }
        } 