from fastapi import APIRouter, HTTPException, Body, Query, Request
from fastapi.responses import JSONResponse
from typing import Dict, Any, Optional
from app.database import get_database
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
router = APIRouter(tags=["misc"])

@router.get("/cookie-consent")
async def get_cookie_consent(request: Request):
    """Get cookie consent preferences"""
    try:
        db = get_database()
        
        # Get user IP or session identifier
        client_id = request.headers.get("x-forwarded-for") or request.client.host
        
        # Try to find existing consent for this client
        consent = await db.cookie_consents.find_one({"client_id": client_id})
        
        # Default cookie policy information
        cookie_policy = {
            "essential": {
                "required": True,
                "description": "Required for the website to function properly, including authentication and security features",
                "duration": "Session"
            },
            "functional": {
                "required": False,
                "description": "Remember your preferences and settings to enhance your experience",
                "duration": "1 year"
            },
            "analytics": {
                "required": False,
                "description": "Help us understand how visitors use our website",
                "duration": "2 years"
            },
            "application": {
                "required": False,
                "description": "Maintain your application status and progress",
                "duration": "30 days"
            }
        }
        
        # Determine consent status
        has_consent = None
        if consent:
            if consent.get("status") == "accepted":
                has_consent = True
            elif consent.get("status") == "rejected":
                has_consent = False
        
        response = {
            "hasConsent": has_consent,
            "preferences": consent.get("preferences", {}) if consent else {},
            "cookiePolicy": cookie_policy,
            "lastUpdated": consent.get("updatedAt", "").isoformat() if consent and consent.get("updatedAt") else None
        }
        
        # Return with CORS headers
        return JSONResponse(
            content=response,
            headers={
                "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept"
            }
        )
    except Exception as e:
        logger.error(f"Cookie consent error: {e}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cookie-consent")
async def set_cookie_consent(request: Request, preferences: Dict[str, Any]):
    """Set cookie consent preferences"""
    try:
        db = get_database()
        
        # Get user IP or session identifier
        client_id = request.headers.get("x-forwarded-for") or request.client.host
        
        # Get the origin from the request headers
        origin = request.headers.get("origin", "http://localhost:3000")
        
        # Prepare consent data
        consent_data = {
            "client_id": client_id,
            "status": "accepted" if preferences.get("consent", True) else "rejected",
            "preferences": {
                "essential": preferences.get("essential", True),
                "functional": preferences.get("functional", False),
                "analytics": preferences.get("analytics", False),
                "application": preferences.get("application", False)
            },
            "updatedAt": datetime.utcnow(),
            "userAgent": request.headers.get("user-agent", ""),
            "ipAddress": client_id
        }
        
        # Save to database (upsert)
        await db.cookie_consents.update_one(
            {"client_id": client_id},
            {"$set": consent_data},
            upsert=True
        )
        
        # Create a response with the cookie consent preferences
        response_data = {
            "message": "Cookie preferences saved successfully",
            "consent": {
                "hasConsent": consent_data["status"] == "accepted",
                "preferences": consent_data["preferences"]
            }
        }
        
        response = JSONResponse(
            content=response_data,
            headers={
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Max-Age": "3600",
            }
        )
        
        # Set a cookie with the preferences
        response.set_cookie(
            key="cookie_consent",
            value="accepted" if preferences.get("consent", True) else "rejected",
            max_age=365 * 24 * 60 * 60,  # 1 year
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="lax"
        )
        
        # Set individual preference cookies
        for key, value in consent_data["preferences"].items():
            response.set_cookie(
                key=f"cookie_pref_{key}",
                value=str(value).lower(),
                max_age=365 * 24 * 60 * 60,  # 1 year
                httponly=True,
                secure=False,  # Set to True in production with HTTPS
                samesite="lax"
            )
        
        return response
    except Exception as e:
        logger.error(f"Error setting cookie consent: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(
            status_code=500,
            detail="Failed to save cookie preferences"
        )

@router.options("/cookie-consent", include_in_schema=False)
async def options_cookie_consent(request: Request):
    """Handle CORS preflight requests for cookie consent endpoint"""
    origin = request.headers.get("origin", "http://localhost:3000")
    return JSONResponse(
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": "3600",
        }
    )

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        db = get_database()
        if db is None:
            return {
                "status": "unhealthy",
                "timestamp": datetime.utcnow().isoformat(),
                "error": "Database not connected"
            }
        
        # Simple database connectivity test - list collections
        collections = await db.list_collection_names()
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "services": {
                "database": "connected",
                "api": "running"
            },
            "collections_count": len(collections)
        }
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return {
            "status": "unhealthy",
            "timestamp": datetime.utcnow().isoformat(),
            "error": str(e)
        } 