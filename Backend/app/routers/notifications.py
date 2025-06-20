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
    Get notifications for the current user
    """
    try:
        if not is_connected():
            raise HTTPException(status_code=503, detail="Database not available")
            
        db = get_database()
        
        # Get notifications that are either for this user or have no user (system notifications)
        user_id = str(current_user.get("_id", "")) if current_user else None
        notifications = await db.notifications.find({
            "$or": [
                {"userId": user_id},
                {"userId": None}
            ]
        }).sort("date", -1).skip(skip).limit(limit).to_list(length=None)

        # Convert MongoDB documents to response format
        response_data = []
        for notification in notifications:
            try:
                notification_dict = convert_mongo_doc(notification)
                if "_id" in notification_dict:
                    notification_dict["id"] = str(notification_dict.pop("_id"))
                notification_dict.setdefault("isRead", False)
                notification_dict.setdefault("__v", 0)
                response_data.append(notification_dict)
            except Exception as e:
                logger.error(f"Error processing notification: {str(e)}")
                continue

        return response_data

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
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Create a new notification
    """
    try:
        notification_dict = notification.model_dump()
        notification_dict["createdAt"] = datetime.utcnow()
        notification_dict["updatedAt"] = notification_dict["createdAt"]
        notification_dict["__v"] = 0

        result = await db.notifications.insert_one(notification_dict)
        
        created_notification = await db.notifications.find_one({"_id": result.inserted_id})
        created_notification["id"] = str(created_notification.pop("_id"))
        return created_notification

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
        update_dict = update_data.model_dump(exclude_unset=True)
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

@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a notification
    """
    try:
        db = get_database()
        # Verify notification exists and belongs to user
        notification = await db.notifications.find_one({
            "_id": ObjectId(notification_id),
            "userId": str(current_user["_id"])
        })
        
        if not notification:
            raise HTTPException(status_code=404, detail="Notification not found")

        # Delete notification
        await db.notifications.delete_one({"_id": ObjectId(notification_id)})
        return {"message": "Notification deleted successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 