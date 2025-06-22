from fastapi import APIRouter, Depends, HTTPException, status, Request, Query, Body
from fastapi.responses import JSONResponse
from app.auth import get_current_user
from app.database import get_database
from typing import Dict, Any, List
from bson import ObjectId
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter(tags=["user"])

@router.get("/applications", response_model=Dict[str, Any])
async def get_user_applications(
    request: Request,
    current_user: dict = Depends(get_current_user),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=10, ge=1, le=100),
    status: str = Query(default=None)
):
    """Get user applications"""
    try:
        logger.info(f"Getting applications for user: {current_user.get('email')}")
        db = get_database()
        
        # Handle both _id and id fields
        user_id = current_user.get('_id') or current_user.get('id')
        if not user_id:
            logger.error("No user ID found in current_user object")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Invalid user data"
            )
            
        # Convert string ID to ObjectId if necessary
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
            
        # Build query
        query = {"userId": user_id}
        if status:
            query["status"] = status.upper()
            
        # Get applications with pagination
        applications = await db.applications.find(query).skip(skip).limit(limit).to_list(length=limit)
        total = await db.applications.count_documents(query)
        
        # Transform ObjectIds to strings and get job details
        for app in applications:
            app["id"] = str(app["_id"])
            app["_id"] = str(app["_id"])
            app["userId"] = str(app["userId"])
            
            # Get job details if jobId exists
            if "jobId" in app:
                job = await db.jobs.find_one({"_id": ObjectId(app["jobId"])})
                if job:
                    app["jobDetails"] = {
                        "title": job.get("title"),
                        "department": job.get("department"),
                        "location": job.get("location")
                    }
        
        logger.info(f"Successfully retrieved {len(applications)} applications for user: {current_user.get('email')}")
        
        # Get the origin from the request headers
        origin = request.headers.get("origin", "http://localhost:3000")
        
        # Return response with CORS headers
        return JSONResponse(
            content={
                "applications": applications,
                "total": total,
                "skip": skip,
                "limit": limit
            },
            headers={
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-User-Session",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Max-Age": "3600",
            }
        )
    except Exception as e:
        logger.error(f"Error getting user applications: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.options("/applications", include_in_schema=False)
async def options_applications(request: Request):
    """Handle CORS preflight requests for applications endpoint"""
    origin = request.headers.get("origin", "http://localhost:3000")
    return JSONResponse(
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-User-Session",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": "3600",
        }
    )

@router.get("/profile")
async def get_user_profile():
    return {"message": "User profile endpoint"}

@router.get("/application-stats")  # Removed response_model temporarily for testing
async def get_application_stats(current_user: dict = Depends(get_current_user)):
    """Get application statistics for the current user"""
    logger.info("Accessing application-stats endpoint")  # Debug log
    try:
        db = get_database()
        logger.info("Got database connection")  # Debug log
        
        # Get all applications for the user
        applications = await db.applications.find({
            "userId": ObjectId(current_user["_id"])
        }).to_list(length=None)
        
        logger.info(f"Found {len(applications)} applications")  # Debug log
        
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
        
        logger.info(f"Returning stats: {stats}")  # Debug log
        return {"stats": stats}
    except Exception as e:
        logger.error(f"Error in application-stats: {str(e)}")  # Debug log
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.options("/application-stats", include_in_schema=False)
async def options_application_stats(request: Request):
    """Handle CORS preflight requests"""
    logger.info("Handling OPTIONS request for application-stats")  # Debug log
    origin = request.headers.get("origin", "http://localhost:3000")
    return JSONResponse(
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-User-Session",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": "3600",
        }
    )

@router.get("/settings", response_model=Dict[str, Any])
async def get_user_settings(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Get user settings"""
    try:
        logger.info(f"Getting settings for user: {current_user.get('email')}")
        db = get_database()
        
        # Handle both _id and id fields
        user_id = current_user.get('_id') or current_user.get('id')
        if not user_id:
            logger.error("No user ID found in current_user object")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Invalid user data"
            )
            
        # Convert string ID to ObjectId if necessary
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
            
        user = await db.users.find_one({"_id": user_id})
        
        if not user:
            logger.error(f"User not found: {current_user.get('email')}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Transform ObjectId to string and ensure both id and _id are set
        str_id = str(user["_id"])
        user["id"] = str_id
        user["_id"] = str_id
        
        # Get user settings or return defaults
        settings = {
            "emailNotifications": user.get("emailNotifications", True),
            "pushNotifications": user.get("pushNotifications", True),
            "theme": user.get("theme", "light"),
            "language": user.get("language", "en"),
            "name": user.get("name", ""),
            "email": user.get("email", ""),
            "phoneNumber": user.get("phoneNumber", ""),
            "avatar": user.get("avatar", None),
            "jobAlerts": user.get("jobAlerts", True),
            "applicationUpdates": user.get("applicationUpdates", True)
        }
        
        logger.info(f"Successfully retrieved settings for user: {current_user.get('email')}")
        return {"settings": settings}
    except Exception as e:
        logger.error(f"Error getting user settings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.put("/settings", response_model=Dict[str, Any])
async def update_user_settings(
    request: Request,
    settings: Dict[str, Any] = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """Update user settings"""
    try:
        logger.info(f"Updating settings for user: {current_user.get('email')}")
        db = get_database()
        
        # Handle both _id and id fields
        user_id = current_user.get('_id') or current_user.get('id')
        if not user_id:
            logger.error("No user ID found in current_user object")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Invalid user data"
            )
            
        # Convert string ID to ObjectId if necessary
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Remove any sensitive or immutable fields
        settings.pop("password", None)
        settings.pop("role", None)
        settings.pop("_id", None)
        settings.pop("id", None)
        
        # Update user settings
        result = await db.users.update_one(
            {"_id": user_id},
            {"$set": settings}
        )
        
        if result.modified_count == 0:
            logger.warning(f"No changes made for user: {current_user.get('email')}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No changes made"
            )
        
        # Get updated user
        updated_user = await db.users.find_one({"_id": user_id})
        
        if not updated_user:
            logger.error(f"Updated user not found: {current_user.get('email')}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found after update"
            )
        
        # Transform ObjectId to string and ensure both id and _id are set
        str_id = str(updated_user["_id"])
        updated_user["id"] = str_id
        updated_user["_id"] = str_id
        
        # Return updated settings
        updated_settings = {
            "emailNotifications": updated_user.get("emailNotifications", True),
            "pushNotifications": updated_user.get("pushNotifications", True),
            "theme": updated_user.get("theme", "light"),
            "language": updated_user.get("language", "en"),
            "name": updated_user.get("name", ""),
            "email": updated_user.get("email", ""),
            "phoneNumber": updated_user.get("phoneNumber", ""),
            "avatar": updated_user.get("avatar", None),
            "jobAlerts": updated_user.get("jobAlerts", True),
            "applicationUpdates": updated_user.get("applicationUpdates", True)
        }
        
        logger.info(f"Successfully updated settings for user: {current_user.get('email')}")
        return {"settings": updated_settings}
    except Exception as e:
        logger.error(f"Error updating user settings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.options("/settings", include_in_schema=False)
async def options_settings(request: Request):
    """Handle CORS preflight requests"""
    origin = request.headers.get("origin", "http://localhost:3000")
    return JSONResponse(
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-User-Session",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": "3600",
        }
    )

@router.get("/latest-application", response_model=Dict[str, Any])
async def get_latest_application(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Get the user's latest application"""
    try:
        logger.info(f"Getting latest application for user: {current_user.get('email')}")
        db = get_database()
        
        # Handle both _id and id fields
        user_id = current_user.get('_id') or current_user.get('id')
        if not user_id:
            logger.error("No user ID found in current_user object")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Invalid user data"
            )
            
        # Convert string ID to ObjectId if necessary
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
            
        # Get latest application
        latest_app = await db.applications.find_one(
            {"userId": user_id},
            sort=[("appliedDate", -1)]
        )
        
        if not latest_app:
            return {"application": None}
            
        # Transform ObjectIds to strings and get job details
        latest_app["id"] = str(latest_app["_id"])
        latest_app["_id"] = str(latest_app["_id"])
        latest_app["userId"] = str(latest_app["userId"])
        
        # Get job details if jobId exists
        if "jobId" in latest_app:
            job = await db.jobs.find_one({"_id": ObjectId(latest_app["jobId"])})
            if job:
                latest_app["jobDetails"] = {
                    "title": job.get("title"),
                    "department": job.get("department"),
                    "location": job.get("location")
                }
        
        logger.info(f"Successfully retrieved latest application for user: {current_user.get('email')}")
        
        # Get the origin from the request headers
        origin = request.headers.get("origin", "http://localhost:3000")
        
        # Return response with CORS headers
        return JSONResponse(
            content={"application": latest_app},
            headers={
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-User-Session",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Max-Age": "3600",
            }
        )
    except Exception as e:
        logger.error(f"Error getting latest application: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.options("/latest-application", include_in_schema=False)
async def options_latest_application(request: Request):
    """Handle CORS preflight requests for latest application endpoint"""
    origin = request.headers.get("origin", "http://localhost:3000")
    return JSONResponse(
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-User-Session",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": "3600",
        }
    )

@router.get("/hiring-progress", response_model=Dict[str, Any])
async def get_hiring_progress(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Get the hiring progress for the user's latest application"""
    try:
        logger.info(f"Getting hiring progress for user: {current_user.get('email')}")
        db = get_database()
        
        # Handle both _id and id fields
        user_id = current_user.get('_id') or current_user.get('id')
        if not user_id:
            logger.error("No user ID found in current_user object")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Invalid user data"
            )
            
        # Convert string ID to ObjectId if necessary
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
            
        # Get latest application
        latest_app = await db.applications.find_one(
            {"userId": user_id},
            sort=[("appliedDate", -1)]
        )
        
        if not latest_app:
            return {
                "progress": 0,
                "stage": 0,
                "totalStages": 5,
                "status": "No Application"
            }
            
        # Define stages and their order
        stages = {
            "APPLIED": 1,
            "SHORTLISTED": 2,
            "TECHNICAL_ASSESSMENT": 3,
            "INTERVIEWING": 4,
            "HIRED": 5
        }
        
        # Get current stage
        current_status = latest_app.get("status", "APPLIED").upper()
        current_stage = stages.get(current_status, 1)
        
        # Calculate progress percentage
        progress = (current_stage / 5) * 100
        
        response_data = {
            "progress": progress,
            "stage": current_stage,
            "totalStages": 5,
            "status": current_status,
            "applicationId": str(latest_app["_id"])
        }
        
        logger.info(f"Successfully retrieved hiring progress for user: {current_user.get('email')}")
        
        # Get the origin from the request headers
        origin = request.headers.get("origin", "http://localhost:3000")
        
        # Return response with CORS headers
        return JSONResponse(
            content=response_data,
            headers={
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-User-Session",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Max-Age": "3600",
            }
        )
    except Exception as e:
        logger.error(f"Error getting hiring progress: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.options("/hiring-progress", include_in_schema=False)
async def options_hiring_progress(request: Request):
    """Handle CORS preflight requests for hiring progress endpoint"""
    origin = request.headers.get("origin", "http://localhost:3000")
    return JSONResponse(
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-User-Session",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": "3600",
        }
    ) 