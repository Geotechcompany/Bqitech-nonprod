from fastapi import APIRouter, HTTPException, Query, Body, Depends, Request, status
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict, Any
from app.database import get_database, is_connected
from datetime import datetime
from bson import ObjectId
from app.auth import get_current_user
from app.models import Application
import logging
from fastapi.responses import Response
import json

logger = logging.getLogger(__name__)
router = APIRouter(
    tags=["applications"],
    responses={404: {"description": "Not found"}},
)

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        if isinstance(obj, ObjectId):
            return str(obj)
        return super().default(obj)

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
        application_data["status"] = "Applied"
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
    request: Request,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get applications with pagination and filtering"""
    try:
        logger.info("Received GET /applications request")
        logger.info(f"Headers: {dict(request.headers)}")
        logger.info(f"Current user: {current_user}")
        
        if not is_connected():
            raise HTTPException(status_code=503, detail="Database not available")
            
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
            del app["_id"]  # Remove the original _id
        
        response_data = {
            "applications": applications,
            "total": total,
            "page": skip // limit + 1,
            "totalPages": (total + limit - 1) // limit
        }

        return response_data
    except Exception as e:
        logger.error(f"Error in get_applications: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/technical-assessment")
async def get_technical_assessment_applications(
    request: Request,
    current_user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """Get technical assessment applications"""
    try:
        db = get_database()
        if db is None:
            logger.error("Database not connected")
            raise HTTPException(status_code=503, detail="Database not available")
        
        # Handle case variations of "technical assessment"
        status_filter = {"status": {"$in": ["technical assessment", "Technical Assessment", "TECHNICAL_ASSESSMENT", "technical_assessment"]}}
        applications_cursor = db.applications.find(status_filter).skip(skip).limit(limit).sort("appliedDate", -1)
        applications = await applications_cursor.to_list(length=limit)
        total = await db.applications.count_documents(status_filter)
        
        # Convert all ObjectIds to strings
        for app in applications:
            convert_objectids_to_strings(app)
            app["id"] = str(app["_id"])
        
        # Structure the response properly
        response_data = {
            "applications": applications,
            "total": total,
            "page": skip // limit + 1,
            "totalPages": (total + limit - 1) // limit
        }

        # Convert to JSON-serializable format
        response_json = json.loads(
            json.dumps(response_data, cls=CustomJSONEncoder)
        )

        # Get the origin from the request headers
        origin = request.headers.get("origin", "http://localhost:3000")

        # Return applications with proper CORS headers
        return JSONResponse(
            content=response_json,
            headers={
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Max-Age": "3600",
            }
        )
    except Exception as e:
        logger.error(f"Error in get_technical_assessment_applications: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/shortlisted")
async def get_shortlisted_applications(
    request: Request,
    current_user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """Get shortlisted applications"""
    try:
        db = get_database()
        if db is None:
            logger.error("Database not connected")
            raise HTTPException(status_code=503, detail="Database not available")

        status_filter = {"status": {"$in": ["shortlisted", "Shortlisted", "SHORTLISTED"]}}
        applications_cursor = db.applications.find(status_filter).skip(skip).limit(limit).sort("appliedDate", -1)
        applications = await applications_cursor.to_list(length=limit)
        total = await db.applications.count_documents(status_filter)

        # Convert ObjectIds to strings
        for app in applications:
            convert_objectids_to_strings(app)
            app["id"] = str(app["_id"])

        # Structure the response properly
        response_data = {
            "applications": applications,
            "total": total,
            "page": skip // limit + 1,
            "totalPages": (total + limit - 1) // limit
        }

        # Convert to JSON-serializable format
        response_json = json.loads(
            json.dumps(response_data, cls=CustomJSONEncoder)
        )

        # Get the origin from the request headers
        origin = request.headers.get("origin", "http://localhost:3000")

        # Return applications with proper CORS headers
        return JSONResponse(
            content=response_json,
            headers={
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Max-Age": "3600",
            }
        )
    except Exception as e:
        logger.error(f"Error in get_shortlisted_applications: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/interviewing")
async def get_interviewing_applications(
    request: Request,
    current_user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """Get interviewing applications"""
    try:
        db = get_database()
        if db is None:
            logger.error("Database not connected")
            raise HTTPException(status_code=503, detail="Database not available")
        
        applications_cursor = db.applications.find({"status": "interviewing"}).skip(skip).limit(limit).sort("interviewingDate", -1)
        applications = await applications_cursor.to_list(length=limit)
        total = await db.applications.count_documents({"status": "interviewing"})
        
        # Convert all ObjectIds to strings
        for app in applications:
            convert_objectids_to_strings(app)
            app["id"] = str(app["_id"])
        
        # Structure the response properly
        response_data = {
            "applications": applications,
            "total": total,
            "page": skip // limit + 1,
            "totalPages": (total + limit - 1) // limit
        }

        # Convert to JSON-serializable format
        response_json = json.loads(
            json.dumps(response_data, cls=CustomJSONEncoder)
        )

        # Get the origin from the request headers
        origin = request.headers.get("origin", "http://localhost:3000")

        # Return applications with proper CORS headers
        return JSONResponse(
            content=response_json,
            headers={
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Max-Age": "3600",
            }
        )
    except Exception as e:
        logger.error(f"Error in get_interviewing_applications: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/hired")
async def get_hired_applications(
    request: Request,
    current_user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """Get hired applications"""
    try:
        db = get_database()
        if db is None:
            logger.error("Database not connected")
            raise HTTPException(status_code=503, detail="Database not available")
        
        applications_cursor = db.applications.find({"status": "hired"}).skip(skip).limit(limit).sort("hiredDate", -1)
        applications = await applications_cursor.to_list(length=limit)
        total = await db.applications.count_documents({"status": "hired"})
        
        # Convert all ObjectIds to strings
        for app in applications:
            convert_objectids_to_strings(app)
            app["id"] = str(app["_id"])
        
        # Structure the response properly
        response_data = {
            "applications": applications,
            "total": total,
            "page": skip // limit + 1,
            "totalPages": (total + limit - 1) // limit
        }

        # Convert to JSON-serializable format
        response_json = json.loads(
            json.dumps(response_data, cls=CustomJSONEncoder)
        )

        # Get the origin from the request headers
        origin = request.headers.get("origin", "http://localhost:3000")

        # Return applications with proper CORS headers
        return JSONResponse(
            content=response_json,
            headers={
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Max-Age": "3600",
            }
        )
    except Exception as e:
        logger.error(f"Error in get_hired_applications: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/rejected")
async def get_rejected_applications(
    request: Request,
    current_user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """Get rejected applications"""
    try:
        db = get_database()
        
        applications_cursor = db.applications.find({"status": "rejected"}).skip(skip).limit(limit).sort("rejectedDate", -1)
        applications = await applications_cursor.to_list(length=limit)
        total = await db.applications.count_documents({"status": "rejected"})
        
        # Convert all ObjectIds to strings
        for app in applications:
            convert_objectids_to_strings(app)
            app["id"] = str(app["_id"])
        
        return {"applications": applications, "total": total}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/disqualified")
async def get_disqualified_applications(
    request: Request,
    current_user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """Get disqualified applications"""
    try:
        db = get_database()
        if db is None:
            logger.error("Database not connected")
            raise HTTPException(status_code=503, detail="Database not available")
        
        # Use the exact status value from the database
        status_filter = {"status": "Disqualified"}
        applications_cursor = db.applications.find(status_filter).skip(skip).limit(limit).sort("appliedDate", -1)
        applications = await applications_cursor.to_list(length=limit)
        total = await db.applications.count_documents(status_filter)
        
        # Convert all ObjectIds to strings
        for app in applications:
            convert_objectids_to_strings(app)
            app["id"] = str(app["_id"])
        
        # Structure the response properly
        response_data = {
            "applications": applications,
            "total": total,
            "page": skip // limit + 1,
            "totalPages": (total + limit - 1) // limit
        }

        # Convert to JSON-serializable format
        response_json = json.loads(
            json.dumps(response_data, cls=CustomJSONEncoder)
        )

        # Get the origin from the request headers
        origin = request.headers.get("origin", "http://localhost:3000")

        # Return applications with proper CORS headers
        return JSONResponse(
            content=response_json,
            headers={
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Max-Age": "3600",
            }
        )
    except Exception as e:
        logger.error(f"Error in get_disqualified_applications: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recent")
async def get_recent_applications(
    current_user: dict = Depends(get_current_user),
    limit: int = Query(10, ge=1, le=50)
):
    """Get recent applications"""
    try:
        db = get_database()
        
        applications_cursor = db.applications.find().sort("appliedDate", -1).limit(limit)
        applications = await applications_cursor.to_list(length=limit)
        
        # Convert all ObjectIds to strings
        for app in applications:
            convert_objectids_to_strings(app)
            app["id"] = str(app["_id"])
            # Ensure appliedDate is properly formatted
            if app.get("appliedDate"):
                app["appliedDate"] = app["appliedDate"]
        
        return applications
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{application_id}", response_model=Dict[str, Any])
async def get_application(
    application_id: str,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Get a single application by ID"""
    try:
        db = get_database()
        application = await db.applications.find_one({"_id": ObjectId(application_id)})
        
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
            
        return convert_objectids_to_strings(application)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{application_id}", response_model=Dict[str, Any])
async def update_application(
    application_id: str,
    application: Dict[str, Any],
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Update an application"""
    try:
        db = get_database()
        result = await db.applications.update_one(
            {"_id": ObjectId(application_id)},
            {"$set": application}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Application not found")
            
        updated_application = await db.applications.find_one({"_id": ObjectId(application_id)})
        return convert_objectids_to_strings(updated_application)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{application_id}")
async def delete_application(
    application_id: str,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Delete an application"""
    try:
        db = get_database()
        result = await db.applications.delete_one({"_id": ObjectId(application_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Application not found")
            
        return {"message": "Application deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.options("/", include_in_schema=False)
async def options_applications(request: Request):
    """Handle CORS preflight requests"""
    origin = request.headers.get("origin", "http://localhost:3000")
    return JSONResponse(
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-User-Session",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": "3600",
        }
    )

@router.get("/", response_model=Dict[str, List[Dict[str, Any]]])
async def get_user_applications(current_user: dict = Depends(get_current_user)):
    """Get all applications for the current user"""
    try:
        db = get_database()
        
        # Find all applications for the user
        applications = await db.applications.find({
            "userId": ObjectId(current_user["_id"])
        }).sort("appliedDate", -1).to_list(length=None)
        
        # Transform ObjectIds to strings for JSON serialization
        for app in applications:
            app["id"] = str(app["_id"])
            app["_id"] = str(app["_id"])
            app["userId"] = str(app["userId"])
            if "jobId" in app:
                app["jobId"] = str(app["jobId"])
        
        return {"applications": applications}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/{application_id}", response_model=Dict[str, Any])
async def get_application(
    application_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific application by ID"""
    try:
        db = get_database()
        
        # Find the specific application
        application = await db.applications.find_one({
            "_id": ObjectId(application_id),
            "userId": ObjectId(current_user["_id"])
        })
        
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        # Transform ObjectIds to strings
        application["id"] = str(application["_id"])
        application["_id"] = str(application["_id"])
        application["userId"] = str(application["userId"])
        if "jobId" in application:
            application["jobId"] = str(application["jobId"])
        
        return application
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/stats", response_model=Dict[str, Dict[str, int]])
async def get_application_stats(current_user: dict = Depends(get_current_user)):
    """Get application statistics for the current user"""
    try:
        db = get_database()
        
        # Get all applications for the user
        applications = await db.applications.find({
            "userId": ObjectId(current_user["_id"])
        }).to_list(length=None)
        
        # Initialize stats
        stats = {
            "totalApplications": len(applications),
            "shortlisted": 0,
            "technicalAssessment": 0,
            "interviewing": 0,
            "hired": 0,
            "disqualified": 0
        }
        
        # Count applications by status
        for app in applications:
            status = app.get("status", "").lower()
            if status == "shortlisted":
                stats["shortlisted"] += 1
            elif status == "technical_assessment":
                stats["technicalAssessment"] += 1
            elif status == "interviewing":
                stats["interviewing"] += 1
            elif status == "hired":
                stats["hired"] += 1
            elif status == "disqualified":
                stats["disqualified"] += 1
        
        return {"stats": stats}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        ) 