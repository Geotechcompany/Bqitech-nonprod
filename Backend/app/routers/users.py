from fastapi import APIRouter, Depends, HTTPException, status, Body
from app.auth import get_current_user, verify_password, get_password_hash
from app.database import get_database
from typing import Dict, Any
from bson import ObjectId

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/settings", response_model=Dict[str, Any])
async def get_user_settings(current_user: dict = Depends(get_current_user)):
    """Get user settings"""
    try:
        db = get_database()
        user = await db.users.find_one({"_id": ObjectId(current_user["_id"])})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Transform ObjectId to string
        user["id"] = str(user["_id"])
        user["_id"] = str(user["_id"])
        
        # Remove sensitive data
        user.pop("password", None)
        
        return {"user": user}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.put("/settings", response_model=Dict[str, Any])
async def update_user_settings(
    settings: Dict[str, Any] = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """Update user settings"""
    try:
        db = get_database()
        
        # Remove any sensitive or immutable fields
        settings.pop("password", None)
        settings.pop("email", None)  # Email changes should be handled separately
        settings.pop("role", None)   # Role changes should be handled by admin
        
        # Update user
        result = await db.users.update_one(
            {"_id": ObjectId(current_user["_id"])},
            {"$set": settings}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No changes made"
            )
        
        # Get updated user
        updated_user = await db.users.find_one(
            {"_id": ObjectId(current_user["_id"])}
        )
        
        # Transform ObjectId to string
        updated_user["id"] = str(updated_user["_id"])
        updated_user["_id"] = str(updated_user["_id"])
        
        # Remove sensitive data
        updated_user.pop("password", None)
        
        return {"user": updated_user}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.put("/password", response_model=Dict[str, str])
async def update_password(
    password_data: Dict[str, str] = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """Update user password"""
    try:
        db = get_database()
        user = await db.users.find_one({"_id": ObjectId(current_user["_id"])})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Verify current password
        if not verify_password(password_data["currentPassword"], user["password"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Hash new password
        hashed_password = get_password_hash(password_data["newPassword"])
        
        # Update password
        result = await db.users.update_one(
            {"_id": ObjectId(current_user["_id"])},
            {"$set": {"password": hashed_password}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password update failed"
            )
        
        return {"message": "Password updated successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        ) 