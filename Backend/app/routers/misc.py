from fastapi import APIRouter, HTTPException, Body, Query
from typing import Dict, Any, Optional
from app.database import get_database
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
router = APIRouter(tags=["misc"])

@router.get("/cookie-consent")
async def get_cookie_consent():
    """Get cookie consent preferences"""
    try:
        return {
            "message": "Cookie consent endpoint",
            "required": True,
            "analytics": False,
            "marketing": False
        }
    except Exception as e:
        logger.error(f"Cookie consent error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cookie-consent")
async def update_cookie_consent(consent_data: Dict[str, Any] = Body(...)):
    """Update cookie consent preferences"""
    try:
        # Store consent preferences (you can implement storage logic here)
        logger.info(f"Cookie consent updated: {consent_data}")
        return {
            "message": "Cookie consent updated successfully",
            "consent": consent_data
        }
    except Exception as e:
        logger.error(f"Cookie consent update error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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