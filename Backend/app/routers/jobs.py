from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
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
    tags=["public", "jobs"],
    responses={404: {"description": "Not found"}},
)

@router.get("/{job_id}", include_in_schema=True)
async def get_job_by_id(
    request: Request,
    job_id: str
):
    """Get a specific job posting by ID"""
    try:
        logger.info(f"Received GET /jobs/{job_id} request")
        logger.info(f"Headers: {dict(request.headers)}")
        
        if not is_connected():
            raise HTTPException(status_code=503, detail="Database not available")
            
        db = get_database()
        
        try:
            job = await db.jobpostings.find_one({"_id": ObjectId(job_id)})
        except Exception as e:
            logger.error(f"Invalid job ID format: {str(e)}")
            raise HTTPException(status_code=400, detail="Invalid job ID format")
            
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
            
        # Convert ObjectId to string and format dates
        job["id"] = str(job.pop("_id"))
        
        # Clean up HTML entities in description
        if "description" in job:
            job["description"] = (
                job["description"]
                .replace("&nbsp;", " ")  # Replace &nbsp; with regular space
                .replace("\\s+", " ")    # Normalize multiple spaces
                .strip()                 # Trim extra spaces
            )
        
        if "createdAt" in job:
            job["createdAt"] = job["createdAt"].isoformat()
        if "updatedAt" in job:
            job["updatedAt"] = job["updatedAt"].isoformat()
        if "postedDate" in job:
            job["postedDate"] = job["postedDate"].isoformat() if isinstance(job["postedDate"], datetime) else job["postedDate"]
            
        # Return with CORS headers
        return JSONResponse(
            content=json.loads(json.dumps(job, cls=CustomJSONEncoder)),
            headers={
                "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
            }
        )
    except Exception as e:
        logger.error(f"Error in get_job_by_id: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{job_id}/questions", include_in_schema=True)
async def get_job_questions(
    request: Request,
    job_id: str
):
    """Get questions for a specific job"""
    try:
        logger.info(f"Received GET /jobs/{job_id}/questions request")
        logger.info(f"Headers: {dict(request.headers)}")
        
        if not is_connected():
            raise HTTPException(status_code=503, detail="Database not available")
            
        db = get_database()
        
        # First check if the job exists
        try:
            job = await db.jobpostings.find_one({"_id": ObjectId(job_id)})
        except Exception as e:
            logger.error(f"Invalid job ID format: {str(e)}")
            raise HTTPException(status_code=400, detail="Invalid job ID format")
            
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
            
        # Get questions for this job
        questions = []
        if "questions" in job:
            # Convert question IDs to ObjectIds
            question_ids = [ObjectId(qid) for qid in job["questions"]]
            questions = await db.jobquestions.find({"_id": {"$in": question_ids}}).to_list(None)
            
        # Convert ObjectIds to strings
        for question in questions:
            question["id"] = str(question.pop("_id"))
            
        # Return with CORS headers
        return JSONResponse(
            content=json.loads(json.dumps(questions, cls=CustomJSONEncoder)),
            headers={
                "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
            }
        )
    except Exception as e:
        logger.error(f"Error in get_job_questions: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", include_in_schema=True)
async def get_jobs(
    request: Request,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = Query(None)
):
    """Get public jobs with pagination and filtering"""
    try:
        logger.info("Received GET /jobs request")
        logger.info(f"Headers: {dict(request.headers)}")
        
        if not is_connected():
            raise HTTPException(status_code=503, detail="Database not available")
            
        db = get_database()
        
        filter_query = {"isActive": True}  # Only return active jobs
        if status:
            filter_query["status"] = status
        
        jobs_cursor = db.jobpostings.find(filter_query).skip(skip).limit(limit).sort("createdAt", -1)
        jobs = await jobs_cursor.to_list(length=limit)
        total = await db.jobpostings.count_documents(filter_query)
        
        # Convert ObjectIds to strings and format dates
        for job in jobs:
            job["id"] = str(job.pop("_id"))  # Replace _id with id
            
            # Clean up HTML entities in description
            if "description" in job:
                job["description"] = (
                    job["description"]
                    .replace("&nbsp;", " ")  # Replace &nbsp; with regular space
                    .replace("\\s+", " ")    # Normalize multiple spaces
                    .strip()                 # Trim extra spaces
                )
            
            # Format dates if they exist
            if "createdAt" in job:
                job["createdAt"] = job["createdAt"].isoformat()
            if "updatedAt" in job:
                job["updatedAt"] = job["updatedAt"].isoformat()
            if "postedDate" in job:
                job["postedDate"] = job["postedDate"].isoformat() if isinstance(job["postedDate"], datetime) else job["postedDate"]
        
        response_data = {
            "jobs": jobs,
            "total": total,
            "page": skip // limit + 1,
            "totalPages": (total + limit - 1) // limit
        }

        # Return with CORS headers and use custom JSON encoder
        return JSONResponse(
            content=json.loads(json.dumps(response_data, cls=CustomJSONEncoder)),
            headers={
                "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
            }
        )
    except Exception as e:
        logger.error(f"Error in get_jobs: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=str(e))

@router.options("/", include_in_schema=False)
async def options_jobs(request: Request):
    """Handle CORS preflight requests"""
    origin = request.headers.get("origin", "*")
    return JSONResponse(
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": "3600",
        }
    )

@router.options("/{job_id}", include_in_schema=False)
async def options_job_by_id(request: Request):
    """Handle CORS preflight requests for job details"""
    origin = request.headers.get("origin", "*")
    return JSONResponse(
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": "3600",
        }
    )

@router.options("/{job_id}/questions", include_in_schema=False)
async def options_job_questions(request: Request):
    """Handle CORS preflight requests for job questions"""
    origin = request.headers.get("origin", "*")
    return JSONResponse(
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": "3600",
        }
    ) 