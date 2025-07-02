from fastapi import APIRouter, Depends, HTTPException, Query, Body, Request
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from bson import ObjectId
from ..auth import get_current_user
from ..database import get_database, is_connected
from ..models.user_notification import UserNotificationCreate, UserNotificationResponse, UserNotificationUpdate
from fastapi.responses import JSONResponse
import json
import logging

logger = logging.getLogger(__name__)

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

def convert_mongo_doc(doc):
    """Convert MongoDB document to JSON serializable format"""
    if doc is None:
        return None
    
    # Convert ObjectId to string
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    
    # Convert datetime objects
    for key, value in doc.items():
        if isinstance(value, datetime):
            doc[key] = value.isoformat()
        elif isinstance(value, ObjectId):
            doc[key] = str(value)
    
    return doc

router = APIRouter(tags=["user-notifications"])

@router.get("/")
async def get_user_notifications(
    request: Request,
    current_user: dict = Depends(get_current_user),
    limit: int = 10,
    skip: int = 0
):
    """
    Get notifications for the current user
    """
    try:
        if not is_connected():
            raise HTTPException(status_code=503, detail="Database not available")
            
        db = get_database()
        
        # Get notifications that are specifically for this user only
        user_id = str(current_user.get("_id", "")) if current_user else None
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID not found")
        
        logger.info(f"Fetching user notifications for user: {user_id}")
        
        # Get user-specific notifications from user_notifications collection
        notifications = await db.user_notifications.find({
            "userId": user_id
        }).sort("createdAt", -1).skip(skip).limit(limit).to_list(length=None)

        logger.info(f"Found {len(notifications)} user notifications")

        # Convert MongoDB documents to response format
        response_data = []
        for notification in notifications:
            try:
                notification_dict = convert_mongo_doc(notification)
                if "_id" in notification_dict:
                    notification_dict["id"] = str(notification_dict.pop("_id"))
                notification_dict.setdefault("isRead", False)
                notification_dict.setdefault("priority", "normal")
                response_data.append(notification_dict)
            except Exception as e:
                logger.error(f"Error processing user notification: {str(e)}")
                continue

        logger.info(f"Returning {len(response_data)} processed user notifications")
        return response_data

    except Exception as e:
        logger.error(f"Error in get_user_notifications: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=str(e))

@router.options("/")
async def options_user_notifications(request: Request):
    """Handle CORS preflight requests"""
    origin = request.headers.get("origin", "http://localhost:3000")
    return JSONResponse(
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": "3600",
        }
    )

@router.post("/", response_model=UserNotificationResponse)
async def create_user_notification(
    notification: UserNotificationCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new user notification
    """
    try:
        if not is_connected():
            raise HTTPException(status_code=503, detail="Database not available")
            
        db = get_database()
        
        # Get current user ID
        user_id = str(current_user.get("_id", "")) if current_user else None
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID not found")
        
        logger.info(f"Creating user notification for user: {user_id}")
        logger.info(f"Notification data: {notification}")
        
        # Convert notification to dict and add metadata
        notification_dict = notification.dict()
        notification_dict["createdAt"] = datetime.utcnow()
        notification_dict["updatedAt"] = notification_dict["createdAt"]
        
        # Ensure the notification has a userId (use current user if not specified)
        if not notification_dict.get("userId"):
            notification_dict["userId"] = user_id
        
        logger.info(f"Final user notification dict: {notification_dict}")

        # Insert notification into user_notifications collection
        result = await db.user_notifications.insert_one(notification_dict)
        logger.info(f"Inserted user notification with ID: {result.inserted_id}")
        
        # Retrieve the created notification
        created_notification = await db.user_notifications.find_one({"_id": result.inserted_id})
        if not created_notification:
            raise HTTPException(status_code=500, detail="Failed to retrieve created user notification")
        
        # Convert to response format
        created_notification = convert_mongo_doc(created_notification)
        created_notification["id"] = str(created_notification.pop("_id"))
        
        logger.info(f"Successfully created user notification: {created_notification}")
        return created_notification

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Unexpected error in create_user_notification: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.patch("/{notification_id}", response_model=UserNotificationResponse)
async def update_user_notification(
    notification_id: str,
    update_data: UserNotificationUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update a user notification (mark as read/unread)
    """
    try:
        db = get_database()
        user_id = str(current_user.get("_id", "")) if current_user else None
        
        # Verify notification exists and belongs to user
        notification = await db.user_notifications.find_one({
            "_id": ObjectId(notification_id),
            "userId": user_id
        })
        
        if not notification:
            raise HTTPException(status_code=404, detail="User notification not found")

        # Update notification
        update_dict = update_data.dict(exclude_unset=True)
        update_dict["updatedAt"] = datetime.utcnow()
        
        await db.user_notifications.update_one(
            {"_id": ObjectId(notification_id)},
            {"$set": update_dict}
        )

        # Get updated notification
        updated = await db.user_notifications.find_one({"_id": ObjectId(notification_id)})
        updated = convert_mongo_doc(updated)
        updated["id"] = str(updated.pop("_id"))
        return updated

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.options("/{notification_id}")
async def options_user_notification_by_id(notification_id: str, request: Request):
    """Handle CORS preflight requests for specific notification operations"""
    origin = request.headers.get("origin", "http://localhost:3000")
    return JSONResponse(
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": "3600",
        }
    )

@router.delete("/{notification_id}")
async def delete_user_notification(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a user notification
    """
    try:
        if not is_connected():
            raise HTTPException(status_code=503, detail="Database not available")
            
        db = get_database()
        
        # Validate ObjectId format
        try:
            obj_id = ObjectId(notification_id)
        except Exception as e:
            logger.error(f"Invalid ObjectId format: {notification_id}, error: {str(e)}")
            raise HTTPException(status_code=400, detail="Invalid notification ID format")
        
        # Get current user ID
        user_id = str(current_user.get("_id", "")) if current_user else None
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID not found")
        
        logger.info(f"Attempting to delete user notification {notification_id} for user {user_id}")
        
        # Check if notification exists and belongs to user
        notification = await db.user_notifications.find_one({
            "_id": obj_id,
            "userId": user_id
        })
        
        if not notification:
            logger.warning(f"User notification {notification_id} not found or doesn't belong to user {user_id}")
            raise HTTPException(status_code=404, detail="User notification not found")

        # Delete notification
        result = await db.user_notifications.delete_one({"_id": obj_id})
        
        if result.deleted_count == 0:
            logger.error(f"Failed to delete user notification {notification_id}")
            raise HTTPException(status_code=500, detail="Failed to delete user notification")
        
        logger.info(f"Successfully deleted user notification {notification_id}")
        return {"message": "User notification deleted successfully"}

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Unexpected error in delete_user_notification: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/seed")
async def seed_user_notifications(
    current_user: dict = Depends(get_current_user)
):
    """Seed the database with sample user notifications for testing"""
    db = get_database()
    user_id = str(current_user.get("_id", "")) if current_user else None
    
    sample_notifications = [
        {
            "title": "Application Submitted",
            "message": "Your application for Software Engineer position has been submitted successfully",
            "type": "success",
            "userId": user_id,
            "isRead": False,
            "createdAt": datetime.utcnow() - timedelta(minutes=30),
            "priority": "normal"
        },
        {
            "title": "Profile Updated",
            "message": "Your profile information has been updated successfully",
            "type": "info",
            "userId": user_id,
            "isRead": False,
            "createdAt": datetime.utcnow() - timedelta(hours=2),
            "priority": "low"
        },
        {
            "title": "Application Status Update",
            "message": "Your application status has been updated to 'Under Review'",
            "type": "info",
            "userId": user_id,
            "isRead": True,
            "createdAt": datetime.utcnow() - timedelta(days=1),
            "priority": "normal"
        },
        {
            "title": "Interview Invitation",
            "message": "You have been invited for an interview. Please check your email for details.",
            "type": "success",
            "userId": user_id,
            "isRead": False,
            "createdAt": datetime.utcnow() - timedelta(hours=4),
            "priority": "high"
        },
        {
            "title": "Password Changed",
            "message": "Your password has been changed successfully",
            "type": "warning",
            "userId": user_id,
            "isRead": False,
            "createdAt": datetime.utcnow() - timedelta(hours=6),
            "priority": "normal"
        }
    ]
    
    result = await db.user_notifications.insert_many(sample_notifications)
    
    return {
        "message": f"Created {len(result.inserted_ids)} sample user notifications",
        "ids": [str(id) for id in result.inserted_ids]
    } 