from fastapi import APIRouter, Depends, HTTPException, status, Form, Request, Body
from fastapi.security import OAuth2PasswordRequestForm
from app.auth import create_access_token, verify_password, get_password_hash, get_current_user, SECRET_KEY, ALGORITHM
from app.database import get_database
from app.models import User
from typing import Dict, Any
from datetime import timedelta, datetime
from bson import ObjectId
from jose import jwt
import logging
import json

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login")
async def login(credentials: Dict[str, Any] = Body(...)):
    """Login endpoint"""
    try:
        db = get_database()
        
        email = credentials.get("email")
        password = credentials.get("password")
        
        if not email or not password:
            raise HTTPException(status_code=400, detail="Email and password required")
        
        # Find user
        user = await db.users.find_one({"email": email})
        if not user or not verify_password(password, user["password"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Create access token
        access_token = create_access_token(data={"sub": str(user["_id"])})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(user["_id"]),
                "email": user["email"],
                "name": user.get("name", ""),
                "role": user.get("role", "user")
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/signup")
async def signup(
    email: str = Form(...),
    password: str = Form(...),
    name: str = Form(...)
):
    """User registration endpoint"""
    try:
        db = get_database()
        
        # Check if user already exists
        existing_user = await db.users.find_one({"email": email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password
        hashed_password = get_password_hash(password)
        
        # Create user document
        user_data = {
            "email": email,
            "name": name,
            "password": hashed_password,
            "role": "USER",
            "is_active": True,
            "created_at": "2023-01-01T00:00:00",  # You might want to use datetime.utcnow()
            "email_verified": False
        }
        
        # Insert user into database
        result = await db.users.insert_one(user_data)
        
        return {
            "message": "User created successfully",
            "user_id": str(result.inserted_id)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return {
        "id": str(current_user["_id"]),
        "email": current_user["email"],
        "name": current_user.get("name", ""),
        "role": current_user.get("role", "user")
    }

@router.post("/logout")
async def logout(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Logout endpoint (for consistency, JWT tokens are stateless)"""
    return {"message": "Successfully logged out"}

@router.post("/refresh")
async def refresh_token(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Refresh JWT token"""
    try:
        # Create new access token using the user ID
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": str(current_user["_id"])},
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": 1800
        }
        
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/register")
async def register(user_data: Dict[str, Any] = Body(...)):
    """Register new user"""
    try:
        db = get_database()
        
        email = user_data.get("email")
        password = user_data.get("password")
        name = user_data.get("name", "")
        
        if not email or not password:
            raise HTTPException(status_code=400, detail="Email and password required")
        
        # Check if user exists
        existing_user = await db.users.find_one({"email": email})
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")
        
        # Hash password
        hashed_password = get_password_hash(password)
        
        # Create user
        user_doc = {
            "email": email,
            "password": hashed_password,
            "name": name,
            "role": "USER",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        result = await db.users.insert_one(user_doc)
        
        # Create access token
        access_token = create_access_token(data={"sub": str(result.inserted_id)})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(result.inserted_id),
                "email": email,
                "name": name,
                "role": "USER"
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/session")
async def get_session(request: Request):
    """Get current session - NextAuth compatibility endpoint"""
    try:
        # Check for X-User-Session header first (Next.js integration)
        session_header = request.headers.get("X-User-Session")
        if session_header:
            try:
                user_data = json.loads(session_header)
                return {
                    "user": {
                        "id": user_data.get("id"),
                        "email": user_data.get("email"),
                        "name": user_data.get("name"),
                        "role": user_data.get("role")
                    },
                    "expires": "2024-12-31T23:59:59.999Z"  # Placeholder expiry
                }
            except Exception as e:
                logger.error(f"Failed to parse session header: {e}")
        
        # Check for authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return {"user": None, "expires": None}
        
        token = auth_header.split(" ")[1]
        
        try:
            # Verify the token and get user info
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")
            
            if user_id:
                db = get_database()
                user = await db.users.find_one({"_id": ObjectId(user_id)})
                
                if user:
                    return {
                        "user": {
                            "id": str(user["_id"]),
                            "email": user.get("email"),
                            "name": user.get("name", ""),
                            "role": user.get("role", "USER")
                        },
                        "expires": datetime.fromtimestamp(payload.get("exp", 0)).isoformat() + "Z"
                    }
        except Exception as e:
            logger.error(f"Token verification error: {e}")
        
        return {"user": None, "expires": None}
    except Exception as e:
        logger.error(f"Session check error: {e}")
        return {"user": None, "expires": None}

@router.post("/_log")
async def auth_log(log_data: Dict[str, Any] = Body(...)):
    """NextAuth logging endpoint"""
    try:
        # Log the auth event (you can customize this based on your needs)
        logger.info(f"NextAuth log: {log_data}")
        return {"success": True}
    except Exception as e:
        logger.error(f"Auth log error: {e}")
        return {"success": False, "error": str(e)}