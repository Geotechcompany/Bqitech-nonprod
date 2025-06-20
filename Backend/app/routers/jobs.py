from fastapi import APIRouter, HTTPException, Depends, Request, Query
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
from ..auth import get_current_user
from ..database import get_database, is_connected
import logging
import json

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

logger = logging.getLogger(__name__)
router = APIRouter(
    tags=["jobs"],
    responses={404: {"description": "Not found"}},
)

@router.get("/")
async def get_jobs(
    request: Request,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get jobs with pagination and filtering"""
    try:
        logger.info("Received GET /jobs request")
        logger.info(f"Headers: {dict(request.headers)}")
        logger.info(f"Current user: {current_user}")
        
        if not is_connected():
            raise HTTPException(status_code=503, detail="Database not available")
            
        db = get_database()
        
        filter_query = {}
        if status:
            filter_query["status"] = status
        
        jobs_cursor = db.jobs.find(filter_query).skip(skip).limit(limit).sort("createdAt", -1)
        jobs = await jobs_cursor.to_list(length=limit)
        total = await db.jobs.count_documents(filter_query)
        
        # Convert ObjectIds to strings
        for job in jobs:
            job["id"] = str(job["_id"])
            del job["_id"]  # Remove the original _id
        
        response_data = {
            "jobs": jobs,
            "total": total,
            "page": skip // limit + 1,
            "totalPages": (total + limit - 1) // limit
        }

        return response_data
    except Exception as e:
        logger.error(f"Error in get_jobs: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=str(e))

@router.options("/", include_in_schema=False)
async def options_jobs(request: Request):
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