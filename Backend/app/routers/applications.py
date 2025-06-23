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

class JSONEncoder(json.JSONEncoder):
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
async def submit_application(
    application_data: Dict[str, Any] = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """Submit a new job application"""
    try:
        logger.info("Received application submission")
        logger.info(f"Current user: {json.dumps(current_user, default=str)}")
        logger.info(f"Application data: {json.dumps(application_data, default=str)}")
        
        # Check database connection
        if not is_connected():
            logger.error("Database not connected")
            raise HTTPException(status_code=503, detail="Database not available")
            
        db = get_database()
        
        # Check for existing application
        user_id = str(current_user["_id"])
        job_id = application_data.get("jobId")
        
        if not job_id:
            raise HTTPException(status_code=400, detail="Job ID is required")
            
        existing_application = await db.applications.find_one({
            "userId": user_id,
            "jobId": job_id
        })
        
        if existing_application:
            raise HTTPException(
                status_code=400,
                detail="You have already applied for this position"
            )
        
        # Add timestamps and default status
        application_data["appliedDate"] = datetime.utcnow()
        application_data["status"] = application_data.get("status", "New")
        application_data["createdAt"] = datetime.utcnow()
        application_data["updatedAt"] = datetime.utcnow()
        
        # Link the application to the current user
        application_data["userId"] = user_id
        logger.info(f"Setting userId to: {user_id}")
        
        # Log the final application data before insertion
        logger.info(f"Final application data: {json.dumps(application_data, default=str)}")
        
        try:
            result = await db.applications.insert_one(application_data)
            logger.info(f"Application inserted with ID: {result.inserted_id}")
        except Exception as e:
            logger.error(f"Database insertion error: {str(e)}")
            raise
        
        application_data["_id"] = str(result.inserted_id)
        application_data["id"] = str(result.inserted_id)
        
        # Verify the application was saved
        saved_app = await db.applications.find_one({"_id": result.inserted_id})
        if saved_app:
            logger.info(f"Successfully verified application in database: {json.dumps(saved_app, default=str)}")
        else:
            logger.warning("Could not verify application in database after insertion")
        
        return {
            "message": "Application submitted successfully",
            "application": application_data
        }
    except Exception as e:
        logger.error(f"Error submitting application: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def get_applications(
    page: int = 1,
    limit: int = 10,
    current_user: dict = Depends(get_current_user)
):
    """Get all applications for the current user"""
    try:
        if not is_connected():
            logger.error("Database not connected")
            raise HTTPException(status_code=503, detail="Database not available")
            
        db = get_database()
        
        # Get user ID
        user_id = str(current_user["_id"])
        logger.info(f"Fetching applications for user: {user_id}")
        
        # Calculate skip value for pagination
        skip = (page - 1) * limit
        
        # Get total count
        total = await db.applications.count_documents({"userId": user_id})
        
        # Use aggregation pipeline to join with jobpostings collection
        pipeline = [
            {"$match": {"userId": user_id}},
            {"$skip": skip},
            {"$limit": limit},
            {
                "$lookup": {
                    "from": "jobpostings",
                    "let": { "jobId": { "$toObjectId": "$jobId" } },
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {
                                    "$eq": ["$_id", "$$jobId"]
                                }
                            }
                        },
                        {
                            "$project": {
                                "title": 1,
                                "department": 1,
                                "location": 1
                            }
                        }
                    ],
                    "as": "jobDetails"
                }
            },
            {
                "$addFields": {
                    "jobDetails": {
                        "$cond": {
                            "if": { "$gt": [{ "$size": "$jobDetails" }, 0] },
                            "then": { "$arrayElemAt": ["$jobDetails", 0] },
                            "else": None
                        }
                    }
                }
            }
        ]
        
        cursor = db.applications.aggregate(pipeline)
        applications = await cursor.to_list(length=limit)
        
        # Convert ObjectIds to strings and ensure job details are properly formatted
        for app in applications:
            app["id"] = str(app["_id"])
            if "jobDetails" in app and app["jobDetails"]:
                app["position"] = app["jobDetails"].get("title", "N/A")
            else:
                # Try to get job details directly if lookup failed
                job = await db.jobpostings.find_one({"_id": app["jobId"]})
                if job:
                    app["position"] = job.get("title", "N/A")
                    app["jobDetails"] = {
                        "title": job.get("title"),
                        "department": job.get("department"),
                        "location": job.get("location")
                    }
                else:
                    app["position"] = "N/A"
                    app["jobDetails"] = None
            
        # Calculate total pages
        total_pages = (total + limit - 1) // limit
        
        logger.info(f"Found {len(applications)} applications for user {user_id}")
        
        # Use custom JSON encoder for the response
        response = {
            "applications": applications,
            "total": total,
            "page": page,
            "totalPages": total_pages
        }
        
        # Convert to JSON string and back to handle datetime serialization
        return json.loads(json.dumps(response, cls=JSONEncoder))
        
    except Exception as e:
        logger.error(f"Error getting applications: {str(e)}")
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
            json.dumps(response_data, cls=JSONEncoder)
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
            json.dumps(response_data, cls=JSONEncoder)
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
            json.dumps(response_data, cls=JSONEncoder)
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
            json.dumps(response_data, cls=JSONEncoder)
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
        if db is None:
            logger.error("Database not connected")
            raise HTTPException(status_code=503, detail="Database not available")
        
        status_filter = {"status": "rejected"}
        applications_cursor = db.applications.find(status_filter).skip(skip).limit(limit).sort("rejectedDate", -1)
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
            json.dumps(response_data, cls=JSONEncoder)
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
        logger.error(f"Error in get_rejected_applications: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(
            status_code=500,
            detail="Failed to get rejected applications"
        )

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
            json.dumps(response_data, cls=JSONEncoder)
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
        if db is None:
            logger.error("Database not connected")
            raise HTTPException(status_code=503, detail="Database not available")
        
        try:
            application = await db.applications.find_one({"_id": ObjectId(application_id)})
        except Exception as e:
            logger.error(f"Error converting application ID {application_id} to ObjectId: {str(e)}")
            raise HTTPException(status_code=400, detail="Invalid application ID format")
        
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Convert ObjectIds to strings
        application = convert_objectids_to_strings(application)
        application["id"] = str(application["_id"])
        
        # Get the origin from the request headers
        origin = request.headers.get("origin", "http://localhost:3000")
        
        # Return application with proper CORS headers
        return JSONResponse(
            content=json.loads(json.dumps(application, cls=JSONEncoder)),
            headers={
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Max-Age": "3600",
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_application: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(
            status_code=500,
            detail="Failed to get application"
        )

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
        if db is None:
            logger.error("Database not connected")
            raise HTTPException(status_code=503, detail="Database not available")
        
        # Validate application ID format
        try:
            obj_id = ObjectId(application_id)
        except Exception as e:
            logger.error(f"Error converting application ID {application_id} to ObjectId: {str(e)}")
            raise HTTPException(status_code=400, detail="Invalid application ID format")
        
        # Add update timestamp
        application["updatedAt"] = datetime.utcnow()
        
        try:
            result = await db.applications.update_one(
                {"_id": obj_id},
                {"$set": application}
            )
        except Exception as e:
            logger.error(f"Error updating application {application_id}: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Failed to update application in database"
            )
        
        if result.modified_count == 0:
            if not await db.applications.find_one({"_id": obj_id}):
                raise HTTPException(status_code=404, detail="Application not found")
            else:
                logger.info(f"No changes made to application {application_id}")
        
        # Get updated application
        updated_application = await db.applications.find_one({"_id": obj_id})
        if not updated_application:
            logger.error(f"Could not retrieve updated application {application_id}")
            raise HTTPException(
                status_code=500,
                detail="Failed to retrieve updated application"
            )
        
        # Convert ObjectIds to strings
        updated_application = convert_objectids_to_strings(updated_application)
        updated_application["id"] = str(updated_application["_id"])
        
        # Get the origin from the request headers
        origin = request.headers.get("origin", "http://localhost:3000")
        
        # Return updated application with proper CORS headers
        return JSONResponse(
            content=json.loads(json.dumps(updated_application, cls=JSONEncoder)),
            headers={
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Max-Age": "3600",
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in update_application: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(
            status_code=500,
            detail="Failed to update application"
        )

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

@router.get("/user/{user_id}")
async def get_user_applications(
    user_id: str,
    request: Request,
    current_user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """Get applications for a specific user"""
    try:
        logger.info(f"Fetching applications for user: {user_id}")
        logger.info(f"Current user: {current_user}")
        
        # Verify user has permission to access these applications
        if str(current_user["_id"]) != user_id and current_user.get("role", "").upper() != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to view these applications"
            )

        db = get_database()
        if not is_connected():
            raise HTTPException(status_code=503, detail="Database not available")

        # Create filter for user's applications
        filter_query = {"userId": user_id}
        
        logger.info(f"Applying filter: {filter_query}")
        
        # Get applications with pagination
        applications_cursor = db.applications.find(filter_query).skip(skip).limit(limit).sort("appliedDate", -1)
        applications = await applications_cursor.to_list(length=limit)
        total = await db.applications.count_documents(filter_query)

        logger.info(f"Found {total} applications")

        # Convert ObjectIds to strings and format response
        for app in applications:
            convert_objectids_to_strings(app)
            app["id"] = str(app["_id"])
            if "_id" in app:
                del app["_id"]

        response_data = {
            "applications": applications,
            "total": total,
            "page": skip // limit + 1,
            "totalPages": (total + limit - 1) // limit
        }

        return JSONResponse(
            content=json.loads(json.dumps(response_data, cls=JSONEncoder)),
            headers={
                "Access-Control-Allow-Origin": request.headers.get("origin", "http://localhost:3000"),
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Max-Age": "3600",
            }
        )
    except Exception as e:
        logger.error(f"Error in get_user_applications: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users/profile")
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    """Get the current user's profile"""
    try:
        db = get_database()
        user = await db.users.find_one({"_id": ObjectId(current_user["_id"])})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return convert_objectids_to_strings(user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users/settings")
async def get_user_settings(current_user: dict = Depends(get_current_user)):
    """Get the current user's settings"""
    try:
        db = get_database()
        settings = await db.user_settings.find_one({"userId": ObjectId(current_user["_id"])})
        if not settings:
            # Return default settings if none exist
            return {
                "userId": str(current_user["_id"]),
                "emailNotifications": True,
                "applicationUpdates": True,
                "jobAlerts": True
            }
        return convert_objectids_to_strings(settings)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users/application-stats")
async def get_application_stats(current_user: dict = Depends(get_current_user)):
    """Get application statistics for the current user"""
    try:
        db = get_database()
        pipeline = [
            {"$match": {"userId": str(current_user["_id"])}},
            {"$group": {
                "_id": "$status",
                "count": {"$sum": 1}
            }}
        ]
        stats = await db.applications.aggregate(pipeline).to_list(length=None)
        
        # Format stats into a more readable structure
        formatted_stats = {
            "total": 0,
            "byStatus": {}
        }
        
        for stat in stats:
            count = stat["count"]
            formatted_stats["total"] += count
            formatted_stats["byStatus"][stat["_id"]] = count
            
        return formatted_stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users/latest-application")
async def get_latest_application(current_user: dict = Depends(get_current_user)):
    """Get the user's latest application"""
    try:
        db = get_database()
        latest = await db.applications.find_one(
            {"userId": str(current_user["_id"])},
            sort=[("appliedDate", -1)]
        )
        if not latest:
            return None
        
        # Get job details if jobId exists
        if "jobId" in latest and latest["jobId"]:
            try:
                job = await db.jobpostings.find_one({"_id": ObjectId(latest["jobId"])})
                if job:
                    latest["jobDetails"] = {
                        "id": str(job["_id"]),
                        "title": job.get("title", "Unknown Position"),
                        "department": job.get("department", "N/A"),
                        "location": job.get("location", "N/A")
                    }
                    latest["position"] = job.get("title", "Position not specified")
            except Exception as e:
                logger.error(f"Error fetching job details: {str(e)}")
                
        return convert_objectids_to_strings(latest)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/check/{job_id}")
async def check_application(
    job_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Check if user has already applied for a job"""
    try:
        if not is_connected():
            logger.error("Database not connected")
            raise HTTPException(status_code=503, detail="Database not available")
            
        db = get_database()
        
        # Get user ID
        user_id = str(current_user["_id"])
        
        # Check for existing application
        existing_application = await db.applications.find_one({
            "userId": user_id,
            "jobId": job_id
        })
        
        return {"hasApplied": existing_application is not None}
    except Exception as e:
        logger.error(f"Error checking application status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 