from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt, ExpiredSignatureError
from datetime import datetime, timedelta
import os
from typing import Optional
from bson import ObjectId
import bcrypt
import logging

# Configure logger
logger = logging.getLogger(__name__)

from .database import get_database
from .config import settings

# Configuration
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

class OptionalHTTPBearer(HTTPBearer):
    def __init__(self, auto_error: bool = False):
        super().__init__(auto_error=auto_error)

security = OptionalHTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    try:
        # Convert the stored hash to bytes if it's a string
        if isinstance(hashed_password, str):
            hashed_password = hashed_password.encode('utf-8')
        
        # Convert the plain password to bytes
        if isinstance(plain_password, str):
            plain_password = plain_password.encode('utf-8')
            
        return bcrypt.checkpw(plain_password, hashed_password)
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False

def get_password_hash(password: str) -> str:
    """Generate a password hash."""
    try:
        # Generate a salt and hash the password
        salt = bcrypt.gensalt()
        if isinstance(password, str):
            password = password.encode('utf-8')
        hashed = bcrypt.hashpw(password, salt)
        return hashed.decode('utf-8')
    except Exception as e:
        logger.error(f"Password hashing error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error hashing password"
        )

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a new JWT token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    try:
        if not credentials:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        token = credentials.credentials
        try:
            # Log token for debugging
            logger.debug(f"Validating token: {token[:10]}...")
            
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")
            if user_id is None:
                logger.warning("Token payload missing 'sub' claim")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Could not validate credentials",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            # Get user from database to ensure they still exist
            db = get_database()
            user = await db.users.find_one({"_id": ObjectId(user_id)})
            if not user:
                logger.warning(f"User not found for ID: {user_id}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found",
                    headers={"WWW-Authenticate": "Bearer"},
                )
                
            return user
            
        except ExpiredSignatureError:
            logger.warning("Token has expired")
            # Generate a new token if refresh token is valid
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except JWTError as e:
            logger.error(f"JWT validation error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_admin_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current admin user"""
    user = await get_current_user(credentials)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    # Check both session header and database roles
    user_role = str(user.get("role", "")).upper()
    if user_role not in ["ADMIN", "SUPER_ADMIN"]:
        # Double check in database for security
        db = get_database()
        # Use _id since we ensure it's set in get_current_user
        db_user = await db.users.find_one({"_id": ObjectId(user["_id"])})
        if not db_user or str(db_user.get("role", "")).upper() not in ["ADMIN", "SUPER_ADMIN"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
    
    return user 