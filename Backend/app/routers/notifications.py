from fastapi import APIRouter, Depends, HTTPException, Body, Request
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from bson import ObjectId
from ..auth import get_current_user
from ..database import get_database, is_connected
from ..models.notification import NotificationCreate, NotificationResponse, NotificationUpdate
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
    """Convert MongoDB document to JSON-serializable dict"""
    if isinstance(doc, dict):
        return {
            key: convert_mongo_doc(value) 
            for key, value in doc.items()
        }
    elif isinstance(doc, list):
        return [convert_mongo_doc(item) for item in doc]
    elif isinstance(doc, ObjectId):
        return str(doc)
    elif isinstance(doc, datetime):
        return doc.isoformat()
    else:
        return doc

router = APIRouter(tags=["notifications"])

@router.get("/")
async def get_notifications(
    request: Request,
    current_user: dict = Depends(get_current_user),
    limit: int = 10,
    skip: int = 0
):
    """
    Get system/admin notifications (deprecated - use /api/admin/notifications for admin or /api/user-notifications for users)
    """
    try:
        if not is_connected():
            raise HTTPException(status_code=503, detail="Database not available")
            
        db = get_database()
        
        # Get current user ID
        user_id = str(current_user.get("_id", "")) if current_user else None
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID not found")
        
        logger.info(f"Fetching notifications for user: {user_id}")
        
        # For backward compatibility, return empty array and suggest using the correct endpoints
        logger.warning("Deprecated endpoint /api/notifications used. Use /api/admin/notifications for admin or /api/user-notifications for users")
        
        return []

    except Exception as e:
        logger.error(f"Error in get_notifications: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=str(e))

@router.options("/")
async def options_notifications(request: Request):
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

@router.post("/", response_model=NotificationResponse)
async def create_notification(
    notification: NotificationCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new notification
    """
    try:
        if not is_connected():
            raise HTTPException(status_code=503, detail="Database not available")
            
        db = get_database()
        
        # Get current user ID
        user_id = str(current_user.get("_id", "")) if current_user else None
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID not found")
        
        logger.info(f"Creating notification for user: {user_id}")
        logger.info(f"Notification data: {notification}")
        
        # Convert notification to dict and add metadata
        notification_dict = notification.dict()
        notification_dict["createdAt"] = datetime.utcnow()
        notification_dict["updatedAt"] = notification_dict["createdAt"]
        notification_dict["__v"] = 0
        
        # Ensure the notification has a userId (use current user if not specified)
        if not notification_dict.get("userId"):
            notification_dict["userId"] = user_id
        
        logger.info(f"Final notification dict: {notification_dict}")

        # Insert notification into database
        result = await db.notifications.insert_one(notification_dict)
        logger.info(f"Inserted notification with ID: {result.inserted_id}")
        
        # Retrieve the created notification
        created_notification = await db.notifications.find_one({"_id": result.inserted_id})
        if not created_notification:
            raise HTTPException(status_code=500, detail="Failed to retrieve created notification")
        
        # Convert to response format
        created_notification = convert_mongo_doc(created_notification)
        created_notification["id"] = str(created_notification.pop("_id"))
        
        logger.info(f"Successfully created notification: {created_notification}")
        return created_notification

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Unexpected error in create_notification: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.patch("/{notification_id}", response_model=NotificationResponse)
async def update_notification(
    notification_id: str,
    update_data: NotificationUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update a notification (mark as read/unread)
    """
    try:
        db = get_database()
        # Verify notification exists and belongs to user or is a system notification
        notification = await db.notifications.find_one({
            "_id": ObjectId(notification_id),
            "$or": [
                {"userId": str(current_user["_id"])},
                {"userId": None}
            ]
        })
        
        if not notification:
            raise HTTPException(status_code=404, detail="Notification not found")

        # Update notification
        update_dict = update_data.dict(exclude_unset=True)
        update_dict["updatedAt"] = datetime.utcnow()
        
        await db.notifications.update_one(
            {"_id": ObjectId(notification_id)},
            {"$set": update_dict}
        )

        # Get updated notification
        updated = await db.notifications.find_one({"_id": ObjectId(notification_id)})
        updated["id"] = str(updated.pop("_id"))
        return updated

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.options("/{notification_id}")
async def options_notification_by_id(notification_id: str, request: Request):
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
async def delete_notification(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a notification
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
        
        logger.info(f"Attempting to delete notification {notification_id} for user {user_id}")
        
        # Check if notification exists and belongs to user or is a system notification that user can delete
        notification = await db.notifications.find_one({
            "_id": obj_id,
            "$or": [
                {"userId": user_id},
                {"userId": None}  # Allow deletion of system notifications
            ]
        })
        
        if not notification:
            logger.warning(f"Notification {notification_id} not found or doesn't belong to user {user_id}")
            raise HTTPException(status_code=404, detail="Notification not found")

        # Delete notification
        result = await db.notifications.delete_one({"_id": obj_id})
        
        if result.deleted_count == 0:
            logger.error(f"Failed to delete notification {notification_id}")
            raise HTTPException(status_code=500, detail="Failed to delete notification")
        
        logger.info(f"Successfully deleted notification {notification_id}")
        return {"message": "Notification deleted successfully"}

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Unexpected error in delete_notification: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}") 