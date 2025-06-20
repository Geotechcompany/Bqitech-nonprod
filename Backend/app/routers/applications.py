from fastapi import APIRouter, HTTPException, Query, Body
from typing import List, Optional, Dict, Any
from app.database import get_database
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/applications", tags=["applications"])

def convert_objectids_to_strings(doc):
    """Convert all ObjectId fields in a document to strings"""
    if isinstance(doc, dict):
        for key, value in doc.items():
            if isinstance(value, ObjectId):
                doc[key] = str(value)
            elif isinstance(value, dict):
                convert_objectids_to_strings(value)
            elif isinstance(value, list):
                doc[key] = convert_objectids_to_strings(value)
    elif isinstance(doc, list):
        for i, item in enumerate(doc):
            if isinstance(item, ObjectId):
                doc[i] = str(item)
            elif isinstance(item, dict):
                convert_objectids_to_strings(item)
            elif isinstance(item, list):
                doc[i] = convert_objectids_to_strings(item)
    return doc

@router.post("/")
async def submit_application(application_data: Dict[str, Any] = Body(...)):
    """Submit a new job application"""
    try:
        db = get_database()
        
        # Add timestamps and default status
        application_data["appliedDate"] = datetime.utcnow()
        application_data["status"] = "applied"
        application_data["createdAt"] = datetime.utcnow()
        application_data["updatedAt"] = datetime.utcnow()
        
        result = await db.applications.insert_one(application_data)
        
        application_data["_id"] = str(result.inserted_id)
        application_data["id"] = str(result.inserted_id)
        
        return {
            "message": "Application submitted successfully",
            "application": application_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def get_applications(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = Query(None)
):
    """Get applications with pagination and filtering"""
    try:
        db = get_database()
        
        filter_query = {}
        if status:
            filter_query["status"] = status
        
        applications_cursor = db.applications.find(filter_query).skip(skip).limit(limit).sort("appliedDate", -1)
        applications = await applications_cursor.to_list(length=limit)
        total = await db.applications.count_documents(filter_query)
        
        # Convert ObjectIds to strings
        for app in applications:
            convert_objectids_to_strings(app)
            app["id"] = str(app["_id"])
        
        return {
            "applications": applications,
            "total": total,
            "page": skip // limit + 1,
            "totalPages": (total + limit - 1) // limit
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{application_id}")
async def get_application(application_id: str):
    """Get specific application by ID"""
    try:
        db = get_database()
        
        application = await db.applications.find_one({"_id": ObjectId(application_id)})
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        convert_objectids_to_strings(application)
        application["id"] = str(application["_id"])
        
        return application
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid application ID") 