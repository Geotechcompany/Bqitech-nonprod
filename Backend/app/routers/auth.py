from fastapi import APIRouter, Depends, HTTPException, status, Form, Request, Body
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from app.auth import create_access_token, verify_password, get_password_hash, get_current_user, SECRET_KEY, ALGORITHM
from app.database import get_database
from app.models import User
from typing import Dict, Any, Optional
from datetime import timedelta, datetime
from bson import ObjectId
from jose import jwt
import logging
import json
import os
from pydantic import BaseModel
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["auth"])

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

class LoginCredentials(BaseModel):
    email: str
    password: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

@router.post("/login")
async def login(
    request: Request,
    credentials: OAuth2PasswordRequestForm = Depends()
):
    """Login user and return tokens"""
    try:
        db = get_database()
        
        # Find user by email
        user = await db.users.find_one({"email": credentials.username})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
            
        # Verify password
        if not verify_password(credentials.password, user["password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
            
        # Create access token
        access_token = create_access_token(
            data={"sub": str(user["_id"])}
        )
        
        # Create refresh token
        refresh_token = create_access_token(
            data={"sub": str(user["_id"])}
        )
        
        # Get verification status (standardize on isEmailVerified)
        is_verified = user.get("isEmailVerified", False)
        if not is_verified:
            # Check legacy fields for backward compatibility
            is_verified = user.get("is_verified", False) or user.get("email_verified", False)
            # Update to new field if verified in legacy fields
            if is_verified:
                await db.users.update_one(
                    {"_id": user["_id"]},
                    {"$set": {"isEmailVerified": True}}
                )
        
        # Format user data
        user_data = {
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user.get("name", ""),
            "role": user.get("role", "USER"),
            "isEmailVerified": is_verified,
            "avatar": user.get("avatar", ""),
            "createdAt": user.get("createdAt", "").isoformat() if user.get("createdAt") else None
        }
        
        # Get origin from request headers
        origin = request.headers.get("origin", "http://localhost:3000")
        
        return JSONResponse(
            content={
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer",
                "user": user_data
            },
            headers={
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-User-Session"
            }
        )
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.options("/login", include_in_schema=False)
async def options_login(request: Request):
    """Handle CORS preflight requests for login"""
    origin = request.headers.get("origin", "http://localhost:3000")
    return JSONResponse(
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-User-Session",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": "3600",
        }
    )

@router.post("/signup")
async def signup(
    email: str = Form(...),
    password: str = Form(...),
    name: str = Form(...)
):
    """User registration endpoint"""
    try:
        db = get_database()
        
        # Normalize email to lowercase
        email = email.lower()
        
        # Check if user already exists (case-insensitive)
        existing_user = await db.users.find_one({
            "email": {"$regex": f"^{email}$", "$options": "i"}
        })
        
        if existing_user:
            logger.warning(f"Signup attempt with existing email: {email}")
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
            "createdAt": datetime.utcnow(),
            "isEmailVerified": False
        }
        
        # Insert user into database
        result = await db.users.insert_one(user_data)
        
        logger.info(f"New user registered: {email}")
        return {
            "message": "User created successfully",
            "user_id": str(result.inserted_id)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup error: {str(e)}")
        logger.exception("Full traceback:")
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
async def refresh_token(
    request: Request,
    refresh_token: str = Body(..., embed=True)
):
    """Refresh access token"""
    try:
        # Verify refresh token
        payload = jwt.decode(
            refresh_token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
            
        # Get user from database
        db = get_database()
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
            
        # Create new access token
        access_token = create_access_token(
            data={"sub": str(user["_id"])}
        )
        
        # Create new refresh token
        new_refresh_token = create_access_token(
            data={"sub": str(user["_id"])}
        )
        
        # Format user data
        user_data = {
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user.get("name", ""),
            "role": user.get("role", "USER"),
            "isEmailVerified": user.get("isEmailVerified", False),
            "avatar": user.get("avatar", ""),
            "createdAt": user.get("createdAt", "").isoformat() if user.get("createdAt") else None
        }
        
        # Get origin from request headers
        origin = request.headers.get("origin", "http://localhost:3000")
        
        return JSONResponse(
            content={
                "access_token": access_token,
                "refresh_token": new_refresh_token,
                "token_type": "bearer",
                "user": user_data
            },
            headers={
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-User-Session"
            }
        )
    except jwt.ExpiredSignatureError:
        logger.error("Refresh token expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired"
        )
    except jwt.JWTError as e:
        logger.error(f"JWT decode error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate refresh token"
        )
    except Exception as e:
        logger.error(f"Token refresh error: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.options("/refresh", include_in_schema=False)
async def options_refresh(request: Request):
    """Handle CORS preflight requests for refresh token"""
    origin = request.headers.get("origin", "http://localhost:3000")
    return JSONResponse(
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-User-Session",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": "3600",
        }
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

@router.post("/verify-email")
async def verify_email(
    request: Request,
    email: str = Body(...),
    code: str = Body(...)
):
    """Verify user's email address"""
    try:
        db = get_database()
        
        # Find user
        user = await db.users.find_one({"email": email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Verify code (you'll need to implement your verification logic here)
        # For now, we'll just mark the email as verified
        result = await db.users.update_one(
            {"_id": user["_id"]},
            {
                "$set": {
                    "isEmailVerified": True,
                    "verifiedAt": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to verify email"
            )
        
        return {"message": "Email verified successfully"}
        
    except Exception as e:
        logger.error(f"Email verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/verify-email/status")
async def check_email_verification(
    request: Request,
    email: str = Body(...)
):
    """Check email verification status"""
    try:
        db = get_database()
        
        # Find user
        user = await db.users.find_one({"email": email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check verification status
        is_verified = user.get("isEmailVerified", False)
        if not is_verified:
            # Check legacy fields
            is_verified = user.get("is_verified", False) or user.get("email_verified", False)
            # Update to new field if verified in legacy fields
            if is_verified:
                await db.users.update_one(
                    {"_id": user["_id"]},
                    {"$set": {"isEmailVerified": True}}
                )
        
        return {"isEmailVerified": is_verified}
        
    except Exception as e:
        logger.error(f"Email verification status check error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )