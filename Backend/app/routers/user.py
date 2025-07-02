from fastapi import APIRouter, Depends, HTTPException, status, Body, Request
from fastapi.responses import JSONResponse
from app.auth import get_current_user, verify_password, get_password_hash
from app.database import get_database
from app.models.user import UserProfile, PasswordChange
from app.lib.response_obfuscator import obfuscate_user_profile, ResponseObfuscator
from app.lib.encryption import encrypt_user_response, should_encrypt_response
from typing import Dict, Any, Optional
from bson import ObjectId
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
router = APIRouter(
    tags=["user"],
    responses={404: {"description": "Not found"}},
)

@router.get("/profile")
@router.get("/me")
async def get_user_profile(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Get user profile information"""
    try:
        db = get_database()
        
        # Get user from database (excluding password)
        user = await db.users.find_one(
            {"_id": ObjectId(current_user["_id"])},
            {"password": 0}
        )
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Format user profile data
        name = user.get("name", "")
        
        # Try to parse firstName and lastName from name
        firstName = user.get("firstName", "")
        lastName = user.get("lastName", "")
        
        # If firstName/lastName not stored separately, try to parse from name
        if not firstName and not lastName and name:
            name_parts = name.strip().split()
            if len(name_parts) >= 1:
                firstName = name_parts[0]
            if len(name_parts) >= 2:
                lastName = " ".join(name_parts[1:])
        
        profile = {
            "id": str(user["_id"]),
            "email": user.get("email", ""),
            "name": name,
            "firstName": firstName,
            "lastName": lastName,
            "role": user.get("role", "USER"),
            "avatar": user.get("avatar", ""),
            "phone": user.get("phone", ""),
            "location": user.get("location", ""),
            "bio": user.get("bio", ""),
            "skills": user.get("skills", []),
            "experience": user.get("experience", []),
            "education": user.get("education", []),
            "socialLinks": user.get("socialLinks", {}),
            "createdAt": user.get("createdAt", "").isoformat() if user.get("createdAt") else None,
            "updatedAt": user.get("updatedAt", "").isoformat() if user.get("updatedAt") else None,
            "isEmailVerified": user.get("isEmailVerified", False)
        }
        
        # Apply encryption if enabled, otherwise obfuscation
        if should_encrypt_response():
            processed_profile = encrypt_user_response(profile, str(current_user["_id"]))
        else:
            processed_profile = obfuscate_user_profile(profile)
        
        return JSONResponse(
            content=processed_profile,
            headers={
                "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-User-Session"
            }
        )
    except Exception as e:
        logger.error(f"Error in get_user_profile: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/profile")
async def update_user_profile(
    request: Request,
    profile_data: Dict[str, Any] = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """Update user profile"""
    try:
        db = get_database()
        
        # Remove fields that shouldn't be updated
        profile_data.pop("_id", None)
        profile_data.pop("id", None)
        profile_data.pop("email", None)  # Email updates should be handled separately
        profile_data.pop("password", None)  # Password updates should be handled separately
        profile_data.pop("role", None)  # Role updates should be handled by admin
        
        # Handle firstName and lastName updates
        firstName = profile_data.get("firstName", "")
        lastName = profile_data.get("lastName", "")
        
        # If firstName or lastName is provided, construct the full name
        if firstName or lastName:
            profile_data["name"] = f"{firstName} {lastName}".strip()
        
        # Add update timestamp
        profile_data["updatedAt"] = datetime.utcnow()
        
        # Update user profile
        result = await db.users.update_one(
            {"_id": ObjectId(current_user["_id"])},
            {"$set": profile_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        return JSONResponse(
            content={"message": "Profile updated successfully"},
            headers={
                "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "PUT, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-User-Session"
            }
        )
    except Exception as e:
        logger.error(f"Error in update_user_profile: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: dict = Depends(get_current_user)
):
    """Change the current user's password"""
    try:
        db = get_database()
        user = await db.users.find_one({"_id": ObjectId(current_user["_id"])})
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        # Verify current password
        if not verify_password(password_data.currentPassword, user["password"]):
            raise HTTPException(
                status_code=400,
                detail="Current password is incorrect"
            )
        
        # Hash new password
        hashed_password = get_password_hash(password_data.newPassword)
        
        # Update password
        result = await db.users.update_one(
            {"_id": ObjectId(current_user["_id"])},
            {
                "$set": {
                    "password": hashed_password,
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
            
        return {"message": "Password changed successfully"}
    except Exception as e:
        logger.error(f"Error changing password: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.options("/resend-verification", include_in_schema=False)
async def options_resend_verification(request: Request):
    """Handle CORS preflight requests for resend verification"""
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

@router.post("/resend-verification")
async def resend_verification_email(
    request: Request,
    email: str = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """Resend email verification code"""
    try:
        from app.lib.email import send_verification_code
        
        db = get_database()
        user = await db.users.find_one({"_id": ObjectId(current_user["_id"])})
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        if user.get("isEmailVerified", False):
            raise HTTPException(
                status_code=400,
                detail="Email is already verified"
            )
        
        # Verify that the email matches the current user's email
        if user.get("email") != email:
            raise HTTPException(
                status_code=400,
                detail="Email does not match current user"
            )
        
        # Send verification code
        code = await send_verification_code(email)
        if not code:
            raise HTTPException(
                status_code=500,
                detail="Failed to send verification email"
            )
        
        origin = request.headers.get("origin", "http://localhost:3000")
        return JSONResponse(
            content={"message": "Verification email sent successfully"},
            headers={
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-User-Session"
            }
        )
    except Exception as e:
        logger.error(f"Error resending verification email: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/settings")
async def get_user_settings(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Get user settings"""
    try:
        db = get_database()
        
        # Get user settings
        user = await db.users.find_one(
            {"_id": ObjectId(current_user["_id"])},
            {"settings": 1}
        )
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Default settings if none exist
        settings = user.get("settings", {
            "notifications": {
                "email": True,
                "push": True,
                "jobAlerts": True,
                "applicationUpdates": True,
                "marketingEmails": False
            },
            "privacy": {
                "profileVisibility": "public",
                "showActivity": True,
                "showApplicationHistory": True
            },
            "preferences": {
                "theme": "light",
                "language": "en",
                "timezone": "UTC"
            }
        })
        
        return JSONResponse(
            content={"settings": settings},
            headers={
                "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-User-Session"
            }
        )
    except Exception as e:
        logger.error(f"Error in get_user_settings: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/settings")
async def update_user_settings(
    request: Request,
    settings_data: Dict[str, Any] = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """Update user settings"""
    try:
        db = get_database()
        
        # Validate settings structure
        valid_settings = {
            "notifications": {
                k: v for k, v in settings_data.get("notifications", {}).items()
                if k in ["email", "push", "jobAlerts", "applicationUpdates", "marketingEmails"]
            },
            "privacy": {
                k: v for k, v in settings_data.get("privacy", {}).items()
                if k in ["profileVisibility", "showActivity", "showApplicationHistory"]
            },
            "preferences": {
                k: v for k, v in settings_data.get("preferences", {}).items()
                if k in ["theme", "language", "timezone"]
            }
        }
        
        # Update settings
        result = await db.users.update_one(
            {"_id": ObjectId(current_user["_id"])},
            {
                "$set": {
                    "settings": valid_settings,
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        return JSONResponse(
            content={"message": "Settings updated successfully"},
            headers={
                "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "PUT, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-User-Session"
            }
        )
    except Exception as e:
        logger.error(f"Error in update_user_settings: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=str(e))

@router.options("/profile", include_in_schema=False)
@router.options("/me", include_in_schema=False)
async def options_profile(request: Request):
    """Handle CORS preflight requests for profile endpoints"""
    return JSONResponse(
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
            "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-User-Session",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": "3600"
        }
    )

@router.options("/settings", include_in_schema=False)
async def options_settings(request: Request):
    """Handle CORS preflight requests for settings endpoints"""
    return JSONResponse(
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
            "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-User-Session",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": "3600"
        }
    )

@router.get("/application-stats")
async def get_application_stats(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Get user's application statistics"""
    try:
        db = get_database()
        
        # Get user's applications
        pipeline = [
            {"$match": {"userId": ObjectId(current_user["_id"])}},
            {"$group": {
                "_id": None,
                "total": {"$sum": 1},
                "pending": {"$sum": {"$cond": [{"$eq": ["$status", "PENDING"]}, 1, 0]}},
                "shortlisted": {"$sum": {"$cond": [{"$eq": ["$status", "SHORTLISTED"]}, 1, 0]}},
                "interviewing": {"$sum": {"$cond": [{"$eq": ["$status", "INTERVIEWING"]}, 1, 0]}},
                "hired": {"$sum": {"$cond": [{"$eq": ["$status", "HIRED"]}, 1, 0]}},
                "rejected": {"$sum": {"$cond": [{"$eq": ["$status", "REJECTED"]}, 1, 0]}}
            }}
        ]
        
        stats = await db.applications.aggregate(pipeline).to_list(1)
        
        if not stats:
            return {
                "total": 0,
                "pending": 0,
                "shortlisted": 0,
                "interviewing": 0,
                "hired": 0,
                "rejected": 0
            }
            
        stats = stats[0]
        stats.pop("_id", None)
        
        return JSONResponse(
            content=stats,
            headers={
                "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-User-Session"
            }
        )
    except Exception as e:
        logger.error(f"Error in get_application_stats: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/latest-application")
async def get_latest_application(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Get user's latest application"""
    try:
        db = get_database()
        
        # Get latest application
        latest = await db.applications.find_one(
            {"userId": str(current_user["_id"])},
            sort=[("createdAt", -1)]
        )
        
        if not latest:
            return JSONResponse(
                content={"application": None},
                headers={
                    "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Allow-Methods": "GET, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-User-Session"
                }
            )
        
        # Get job details if jobId exists
        job_details = None
        position = latest.get("position", "Position not specified")
        
        if "jobId" in latest and latest["jobId"]:
            try:
                job = await db.jobpostings.find_one({"_id": ObjectId(latest["jobId"])})
                if job:
                    job_details = {
                        "id": str(job["_id"]),
                        "title": job.get("title", "Unknown Position"),
                        "department": job.get("department", "N/A"),
                        "location": job.get("location", "N/A")
                    }
                    position = job.get("title", "Position not specified")
            except Exception as e:
                logger.error(f"Error fetching job details for jobId {latest['jobId']}: {str(e)}")
            
        # Format application data
        application = {
            "id": str(latest["_id"]),
            "position": position,
            "jobDetails": job_details,
            "company": latest.get("company", ""),
            "status": latest.get("status", "New"),
            "appliedDate": latest.get("appliedDate", latest.get("createdAt", "")).isoformat() if latest.get("appliedDate") or latest.get("createdAt") else None,
            "updatedAt": latest.get("updatedAt", "").isoformat() if latest.get("updatedAt") else None,
            "jobId": str(latest["jobId"]) if latest.get("jobId") else None
        }
        
        return JSONResponse(
            content={"application": application},
            headers={
                "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-User-Session"
            }
        )
    except Exception as e:
        logger.error(f"Error in get_latest_application: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/hiring-progress")
async def get_hiring_progress(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Get the user's hiring progress across all applications"""
    try:
        db = get_database()
        
        # Define the hiring stages in order
        stages = ["New", "Shortlisted", "Technical Assessment", "Interviewing", "Hired", "Rejected"]
        
        # Get all applications for the user
        pipeline = [
            {"$match": {"userId": str(current_user["_id"])}},
            {"$group": {
                "_id": "$status",
                "count": {"$sum": 1},
                "applications": {"$push": {
                    "id": {"$toString": "$_id"},
                    "jobId": "$jobId",
                    "status": "$status",
                    "appliedDate": {"$dateToString": {"format": "%Y-%m-%dT%H:%M:%S.%LZ", "date": "$appliedDate"}}
                }}
            }},
            {"$sort": {"_id": 1}}
        ]
        
        progress = await db.applications.aggregate(pipeline).to_list(length=None)
        
        # Format progress into a more readable structure
        formatted_progress = {
            "stages": stages,
            "currentStage": None,
            "stageData": {}
        }
        
        # Initialize all stages with zero counts
        for stage in stages:
            formatted_progress["stageData"][stage] = {
                "count": 0,
                "applications": []
            }
        
        # Fill in actual data
        for stage in progress:
            stage_name = stage["_id"]
            formatted_progress["stageData"][stage_name] = {
                "count": stage["count"],
                "applications": stage["applications"]
            }
            
        # Find current stage (most recent non-rejected application)
        latest = await db.applications.find_one(
            {
                "userId": str(current_user["_id"]),
                "status": {"$ne": "Rejected"}
            },
            sort=[("appliedDate", -1)]
        )
        
        if latest:
            formatted_progress["currentStage"] = latest["status"]
            
        # Get origin from request headers with fallback
        origin = request.headers.get("origin", "*")
            
        return JSONResponse(
            content=formatted_progress,
            headers={
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-User-Session",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Max-Age": "3600",
            }
        )
    except Exception as e:
        logger.error(f"Error in get_hiring_progress: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=str(e))

@router.options("/hiring-progress", include_in_schema=False)
async def options_hiring_progress(request: Request):
    """Handle CORS preflight requests for hiring progress endpoint"""
    origin = request.headers.get("origin", "*")
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