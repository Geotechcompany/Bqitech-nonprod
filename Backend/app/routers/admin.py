from fastapi import APIRouter, Depends, HTTPException, Query, Body, UploadFile, File, Request
from typing import List, Optional, Dict, Any
from app.auth import get_current_admin_user, get_current_user
from app.models import User, Application, Job, BlogPost, Question
from app.database import get_database
from bson import ObjectId
from datetime import datetime, timedelta
import json
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["admin"])

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

@router.get("/test-auth")
async def test_auth_endpoint(request: Request):
    """Test endpoint to check authentication"""
    session_header = request.headers.get("X-User-Session")
    if not session_header:
        return {"error": "No session header found", "headers": dict(request.headers)}
    
    try:
        import json
        user_data = json.loads(session_header)
        return {
            "message": "Authentication working",
            "user": user_data,
            "is_admin": user_data.get("role") in ["ADMIN", "SUPER_ADMIN"]
        }
    except Exception as e:
        return {"error": f"Failed to parse session: {str(e)}", "session_header": session_header}

@router.get("/jobs")
async def get_jobs(
    request: Request,
    current_user: dict = Depends(get_current_admin_user)
):
    """Get all jobs for admin use"""
    db = get_database()
    
    jobs_cursor = db.jobpostings.find({}, {"_id": 1, "title": 1})
    jobs = await jobs_cursor.to_list(length=None)
    
    # Convert ObjectIds to strings
    for job in jobs:
        convert_objectids_to_strings(job)
        job["id"] = str(job["_id"])
    
    return {"jobs": jobs}

# Job Postings endpoints
@router.get("/job-postings")
async def get_job_postings(
    current_user: dict = Depends(get_current_admin_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """Get all job postings"""
    db = get_database()
    
    postings_cursor = db.jobpostings.find({}).skip(skip).limit(limit).sort("createdAt", -1)
    postings = await postings_cursor.to_list(length=limit)
    total = await db.jobpostings.count_documents({})
    
    # Convert all ObjectIds to strings
    for posting in postings:
        convert_objectids_to_strings(posting)
        posting["id"] = str(posting["_id"])
        # Ensure required fields exist with defaults
        if "isActive" not in posting:
            posting["isActive"] = True
        if "department" not in posting:
            posting["department"] = "N/A"
        if "location" not in posting:
            posting["location"] = "N/A"
        if "postedDate" not in posting:
            posting["postedDate"] = posting.get("createdAt", datetime.utcnow()).isoformat()
    
    return {"jobPostings": postings, "total": total}

@router.post("/job-postings")
async def create_job_posting(
    job_data: Dict[str, Any],
    current_user: dict = Depends(get_current_admin_user)
):
    """Create new job posting"""
    db = get_database()
    
    job_data["createdAt"] = datetime.utcnow()
    job_data["updatedAt"] = datetime.utcnow()
    job_data["createdBy"] = str(current_user["_id"])
    
    result = await db.jobpostings.insert_one(job_data)
    job_data["_id"] = str(result.inserted_id)
    job_data["id"] = str(result.inserted_id)
    
    return job_data

@router.get("/job-postings/{job_id}")
async def get_job_posting(
    job_id: str,
    current_user: dict = Depends(get_current_admin_user)
):
    """Get specific job posting"""
    db = get_database()
    
    try:
        posting = await db.jobpostings.find_one({"_id": ObjectId(job_id)})
        if not posting:
            raise HTTPException(status_code=404, detail="Job posting not found")
        
        # Convert all ObjectIds to strings
        convert_objectids_to_strings(posting)
        posting["id"] = str(posting["_id"])
        return posting
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid job ID")

@router.put("/job-postings/{job_id}")
async def update_job_posting(
    job_id: str,
    update_data: Dict[str, Any],
    current_user: dict = Depends(get_current_admin_user)
):
    """Update job posting"""
    db = get_database()
    
    try:
        update_data["updatedAt"] = datetime.utcnow()
        
        result = await db.jobpostings.update_one(
            {"_id": ObjectId(job_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Job posting not found")
        
        return {"message": "Job posting updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/job-postings/{job_id}")
async def delete_job_posting(
    job_id: str,
    current_user: dict = Depends(get_current_admin_user)
):
    """Delete job posting"""
    db = get_database()
    
    try:
        result = await db.jobpostings.delete_one({"_id": ObjectId(job_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Job posting not found")
        
        return {"message": "Job posting deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/job-postings/{job_id}/toggle-status")
async def toggle_job_posting_status(
    job_id: str,
    status_data: Dict[str, Any],
    current_user: dict = Depends(get_current_admin_user)
):
    """Toggle job posting active status"""
    db = get_database()
    
    try:
        is_active = status_data.get("isActive", True)
        update_data = {
            "isActive": is_active,
            "updatedAt": datetime.utcnow()
        }
        
        result = await db.jobpostings.update_one(
            {"_id": ObjectId(job_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Job posting not found")
        
        return {"message": f"Job posting {'activated' if is_active else 'deactivated'} successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# User Management endpoints
@router.get("/users")
async def get_users(
    current_user: dict = Depends(get_current_admin_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """Get all users"""
    db = get_database()
    
    users_cursor = db.users.find({}, {"password": 0}).skip(skip).limit(limit).sort("createdAt", -1)
    users = await users_cursor.to_list(length=limit)
    total = await db.users.count_documents({})
    
    for user in users:
        user["_id"] = str(user["_id"])
        user["id"] = str(user["_id"])
    
    return {"users": users, "total": total}

@router.put("/users/{user_id}")
async def update_user(
    user_id: str,
    update_data: Dict[str, Any],
    current_user: dict = Depends(get_current_admin_user)
):
    """Update user details"""
    db = get_database()
    
    try:
        # Remove sensitive fields that shouldn't be updated this way
        update_data.pop("password", None)
        update_data["updatedAt"] = datetime.utcnow()
        
        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"message": "User updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: dict = Depends(get_current_admin_user)
):
    """Delete user"""
    db = get_database()
    
    try:
        # Don't allow deleting self
        if str(current_user["_id"]) == user_id:
            raise HTTPException(status_code=400, detail="Cannot delete your own account")
        
        result = await db.users.delete_one({"_id": ObjectId(user_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"message": "User deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Blog Posts endpoints
@router.get("/blog-posts")
async def get_blog_posts(
    request: Request,
    current_user: dict = Depends(get_current_admin_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """Get all blog posts"""
    try:
        db = get_database()
        
        posts_cursor = db.blogposts.find({}).skip(skip).limit(limit).sort("createdAt", -1)
        posts = await posts_cursor.to_list(length=limit)
        total = await db.blogposts.count_documents({})
        
        # Convert ObjectIds and datetime objects to strings
        for post in posts:
            post["_id"] = str(post["_id"])
            post["id"] = str(post["_id"])
            if "createdAt" in post and isinstance(post["createdAt"], datetime):
                post["createdAt"] = post["createdAt"].isoformat()
            if "updatedAt" in post and isinstance(post["updatedAt"], datetime):
                post["updatedAt"] = post["updatedAt"].isoformat()
            if "publishedAt" in post and isinstance(post["publishedAt"], datetime):
                post["publishedAt"] = post["publishedAt"].isoformat()
        
        return JSONResponse(
            content={"blogPosts": posts, "total": total},
            headers={
                "Access-Control-Allow-Origin": request.headers.get("origin", "http://localhost:3000"),
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-User-Session",
            }
        )
    except Exception as e:
        logger.error(f"Error in get_blog_posts: {str(e)}")
        logger.exception("Full traceback:")
        return JSONResponse(
            content={"detail": str(e)},
            status_code=500,
            headers={
                "Access-Control-Allow-Origin": request.headers.get("origin", "http://localhost:3000"),
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-User-Session",
            }
        )

@router.options("/blog-posts", include_in_schema=False)
async def options_blog_posts(request: Request):
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

@router.post("/blog-posts")
async def create_blog_post(
    request: Request,
    post_data: Dict[str, Any],
    current_user: dict = Depends(get_current_admin_user)
):
    """Create new blog post"""
    try:
        db = get_database()
        
        post_data["createdAt"] = datetime.utcnow()
        post_data["updatedAt"] = datetime.utcnow()
        post_data["authorId"] = str(current_user["_id"])
        
        result = await db.blogposts.insert_one(post_data)
        post_data["_id"] = str(result.inserted_id)
        post_data["id"] = str(result.inserted_id)
        
        # Convert datetime objects to strings for response
        if "createdAt" in post_data and isinstance(post_data["createdAt"], datetime):
            post_data["createdAt"] = post_data["createdAt"].isoformat()
        if "updatedAt" in post_data and isinstance(post_data["updatedAt"], datetime):
            post_data["updatedAt"] = post_data["updatedAt"].isoformat()
        if "publishedAt" in post_data and isinstance(post_data["publishedAt"], datetime):
            post_data["publishedAt"] = post_data["publishedAt"].isoformat()
        
        return JSONResponse(
            content=post_data,
            headers={
                "Access-Control-Allow-Origin": request.headers.get("origin", "http://localhost:3000"),
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-User-Session",
            }
        )
    except Exception as e:
        logger.error(f"Error in create_blog_post: {str(e)}")
        logger.exception("Full traceback:")
        return JSONResponse(
            content={"detail": str(e)},
            status_code=500,
            headers={
                "Access-Control-Allow-Origin": request.headers.get("origin", "http://localhost:3000"),
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-User-Session",
            }
        )

@router.get("/blog-posts/{post_id}")
async def get_blog_post(
    post_id: str,
    current_user: dict = Depends(get_current_admin_user)
):
    """Get specific blog post"""
    db = get_database()
    
    try:
        post = await db.blogposts.find_one({"_id": ObjectId(post_id)})
        if not post:
            raise HTTPException(status_code=404, detail="Blog post not found")
        
        post["_id"] = str(post["_id"])
        post["id"] = str(post["_id"])
        return post
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid post ID")

@router.put("/blog-posts/{post_id}")
async def update_blog_post(
    post_id: str,
    update_data: Dict[str, Any],
    current_user: dict = Depends(get_current_admin_user)
):
    """Update blog post"""
    db = get_database()
    
    try:
        update_data["updatedAt"] = datetime.utcnow()
        
        result = await db.blogposts.update_one(
            {"_id": ObjectId(post_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Blog post not found")
        
        return {"message": "Blog post updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/blog-posts/{post_id}")
async def delete_blog_post(
    post_id: str,
    current_user: dict = Depends(get_current_admin_user)
):
    """Delete blog post"""
    db = get_database()
    
    try:
        result = await db.blogposts.delete_one({"_id": ObjectId(post_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Blog post not found")
        
        return {"message": "Blog post deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Analytics and Overview endpoints
@router.get("/overview")
async def get_admin_overview(
    request: Request,
    current_user: dict = Depends(get_current_admin_user)
):
    """Get admin dashboard overview"""
    try:
        db = get_database()
        
        # Get applications by status
        pipeline = [
            {
                "$facet": {
                    "total": [{"$count": "count"}],
                    "new": [{"$match": {"status": "Applied"}}, {"$count": "count"}],
                    "shortlisted": [{"$match": {"status": "Shortlisted"}}, {"$count": "count"}],
                    "interviewing": [{"$match": {"status": "Interviewing"}}, {"$count": "count"}],
                    "hired": [{"$match": {"status": "Hired"}}, {"$count": "count"}],
                    "rejected": [{"$match": {"status": "Rejected"}}, {"$count": "count"}],
                    "technical_assessment": [{"$match": {"status": "Technical Assessment"}}, {"$count": "count"}],
                    "disqualified": [{"$match": {"status": "Disqualified"}}, {"$count": "count"}],
                    "recent": [
                        {
                            "$match": {
                                "appliedDate": {
                                    "$gte": datetime.utcnow() - timedelta(days=7)
                                }
                            }
                        },
                        {"$count": "count"}
                    ]
                }
            }
        ]
        
        application_stats = await db.applications.aggregate(pipeline).to_list(length=1)
        stats = application_stats[0] if application_stats else {}
        
        # Get active jobs count
        active_jobs = await db.jobpostings.count_documents({"isActive": True})
        total_jobs = await db.jobpostings.count_documents({})
        
        # Get total users
        total_users = await db.users.count_documents({})
        
        # Get status breakdown for chart
        status_pipeline = [
            {"$group": {"_id": "$status", "count": {"$sum": 1}}}
        ]
        status_breakdown = await db.applications.aggregate(status_pipeline).to_list(length=None)
        
        # Format status breakdown to match frontend expectations
        formatted_status_breakdown = []
        for item in status_breakdown:
            if item["_id"] is not None:  # Skip null statuses
                formatted_status_breakdown.append({
                    "status": item["_id"],
                    "count": item["count"]
                })
        
        # Safely get counts with default values
        def get_count(key):
            result = stats.get(key, [])
            return result[0].get("count", 0) if result else 0
        
        response = {
            "applications": {
                "total": get_count("total"),
                "new": get_count("new"),
                "shortlisted": get_count("shortlisted"),
                "interviewing": get_count("interviewing"),
                "hired": get_count("hired"),
                "rejected": get_count("rejected"),
                "technical_assessment": get_count("technical_assessment"),
                "disqualified": get_count("disqualified"),
                "recent": get_count("recent")
            },
            "jobs": {
                "total": total_jobs,
                "active": active_jobs
            },
            "users": {
                "total": total_users
            },
            "status_breakdown": formatted_status_breakdown
        }
        
        # Add CORS headers to the response
        return JSONResponse(
            content=response,
            headers={
                "Access-Control-Allow-Origin": request.headers.get("origin", "http://localhost:3000"),
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-User-Session",
            }
        )
    except Exception as e:
        logger.error(f"Error in get_admin_overview: {str(e)}")
        logger.exception("Full traceback:")
        return JSONResponse(
            content={"detail": str(e)},
            status_code=500,
            headers={
                "Access-Control-Allow-Origin": request.headers.get("origin", "http://localhost:3000"),
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-User-Session",
            }
        )

@router.options("/overview", include_in_schema=False)
async def options_overview(request: Request):
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

@router.get("/applications")
async def get_admin_applications(
    request: Request,
    current_user: dict = Depends(get_current_admin_user),
    limit: int = Query(10, ge=1, le=100),
    skip: int = Query(0, ge=0),
    status: Optional[str] = None
):
    """Get applications for admin"""
    try:
        db = get_database()
        
        # Build query
        query = {}
        if status:
            query["status"] = status
        
        # Get applications sorted by appliedDate in descending order
        pipeline = [
            {"$match": query},
            {"$sort": {"appliedDate": -1}},  # Sort by appliedDate in descending order
            {"$skip": skip},
            {"$limit": limit}
        ]
        
        # Execute aggregation pipeline
        applications = await db.applications.aggregate(pipeline).to_list(length=None)
        total = await db.applications.count_documents(query)
        
        # Convert ObjectIds and format response
        for app in applications:
            convert_objectids_to_strings(app)
            app["id"] = str(app["_id"])
            
            # Ensure dates are in ISO format
            if "appliedDate" in app:
                app["appliedDate"] = app["appliedDate"].isoformat() if app["appliedDate"] else None
            if "createdAt" in app:
                app["createdAt"] = app["createdAt"].isoformat() if app["createdAt"] else None
            if "updatedAt" in app:
                app["updatedAt"] = app["updatedAt"].isoformat() if app["updatedAt"] else None
            
            # Format answers if they exist
            if "answers" in app:
                for answer in app.get("answers", []):
                    # Ensure questionText is present (for backward compatibility)
                    if "question" in answer and "questionText" not in answer:
                        answer["questionText"] = answer["question"]
        
        # Log the response for debugging
        logger.info(f"Returning {len(applications)} applications")
        logger.debug(f"First application date: {applications[0]['appliedDate'] if applications else 'No applications'}")
        
        return {
            "applications": applications,
            "total": total,
            "page": skip // limit + 1,
            "totalPages": (total + limit - 1) // limit
        }
    except Exception as e:
        logger.error(f"Error in get_admin_applications: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trends")
async def get_application_trends(
    request: Request,
    current_user: dict = Depends(get_current_admin_user),
    days: int = Query(30, ge=1, le=365)
):
    """Get application trends data"""
    try:
        db = get_database()
        
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Aggregate applications by date
        pipeline = [
            {
                "$match": {
                    "appliedDate": {"$gte": start_date, "$lte": end_date}
                }
            },
            {
                "$group": {
                    "_id": {
                        "$dateToString": {
                            "format": "%Y-%m-%d",
                            "date": "$appliedDate"
                        }
                    },
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"_id": 1}}
        ]
        
        trends = await db.applications.aggregate(pipeline).to_list(length=None)
        
        # Format response
        return {
            "trends": [
                {"date": item["_id"], "count": item["count"]}
                for item in trends
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/applications-by-job")
async def get_applications_by_job(
    request: Request,
    current_user: dict = Depends(get_current_admin_user)
):
    """Get applications grouped by job"""
    try:
        db = get_database()
        
        # Aggregate applications by job
        pipeline = [
            {
                "$group": {
                    "_id": "$position",
                    "count": {"$sum": 1},
                    "statuses": {
                        "$push": "$status"
                    }
                }
            }
        ]
        
        results = await db.applications.aggregate(pipeline).to_list(length=None)
        
        # Format response
        formatted_results = []
        for result in results:
            status_counts = {}
            for status in result["statuses"]:
                status_counts[status] = status_counts.get(status, 0) + 1
            
            formatted_results.append({
                "position": result["_id"],
                "totalApplications": result["count"],
                "statusBreakdown": status_counts
            })
        
        return {"applicationsByJob": formatted_results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Questions Management
@router.get("/questions")
async def get_questions(
    request: Request,
    current_user: dict = Depends(get_current_admin_user),
    job_id: Optional[str] = Query(None)
):
    """Get all questions, optionally filtered by job"""
    db = get_database()
    
    filter_query = {}
    if job_id:
        filter_query["jobId"] = job_id
    
    questions_cursor = db.jobquestions.find(filter_query).sort("order", 1)
    questions = await questions_cursor.to_list(length=None)
    
    # Convert ObjectIds to strings and add id field
    questions = convert_objectids_to_strings(questions)
    
    # Get job titles for each question and ensure proper fields
    for i, question in enumerate(questions):
        question["id"] = str(question["_id"])
        
        # Ensure order field exists
        if "order" not in question or question["order"] is None:
            question["order"] = i
        
        # Get associated job titles
        if "jobIds" in question and question["jobIds"]:
            job_titles = []
            for job_id in question["jobIds"]:
                try:
                    job = await db.jobpostings.find_one({"_id": ObjectId(job_id)}, {"title": 1})
                    if job:
                        job_titles.append(job["title"])
                except:
                    continue
            question["jobTitles"] = job_titles
        else:
            question["jobTitles"] = []
    
    return {"questions": questions}

@router.post("/questions")
async def create_question(
    question_data: Dict[str, Any],
    request: Request,
    current_user: dict = Depends(get_current_admin_user)
):
    """Create new question"""
    db = get_database()
    
    question_data["createdAt"] = datetime.utcnow()
    question_data["updatedAt"] = datetime.utcnow()
    
    result = await db.jobquestions.insert_one(question_data)
    question_data["_id"] = str(result.inserted_id)
    question_data["id"] = str(result.inserted_id)
    
    return question_data

@router.put("/questions/{question_id}")
async def update_question(
    question_id: str,
    update_data: Dict[str, Any],
    request: Request,
    current_user: dict = Depends(get_current_admin_user)
):
    """Update question"""
    db = get_database()
    
    try:
        update_data["updatedAt"] = datetime.utcnow()
        
        result = await db.jobquestions.update_one(
            {"_id": ObjectId(question_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Question not found")
        
        return {"message": "Question updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/questions/{question_id}")
async def delete_question(
    question_id: str,
    request: Request,
    current_user: dict = Depends(get_current_admin_user)
):
    """Delete question"""
    db = get_database()
    
    try:
        result = await db.jobquestions.delete_one({"_id": ObjectId(question_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Question not found")
        
        return {"message": "Question deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/questions/reorder")
async def reorder_questions(
    reorder_data: Dict[str, Any],
    request: Request,
    current_user: dict = Depends(get_current_admin_user)
):
    """Reorder questions"""
    db = get_database()
    
    try:
        updates = reorder_data.get("updates", [])
        
        for update in updates:
            question_id = update.get("id")
            new_order = update.get("order")
            
            if question_id and new_order is not None:
                await db.jobquestions.update_one(
                    {"_id": ObjectId(question_id)},
                    {"$set": {"order": new_order, "updatedAt": datetime.utcnow()}}
                )
        
        return {"message": "Questions reordered successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Settings endpoints
@router.get("/settings")
async def get_admin_settings(
    request: Request,
    current_user: dict = Depends(get_current_admin_user)
):
    """Get admin settings"""
    try:
        db = get_database()
        
        settings = await db.settings.find_one({"type": "admin"})
        if not settings:
            # Create default settings if none exist
            default_settings = {
                "type": "admin",
                "emailNotifications": True,
                "autoApproval": False,
                "maintenanceMode": False,
                "maxFileSize": 10485760,  # 10MB
                "allowedFileTypes": ["pdf", "doc", "docx"],
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            }
            await db.settings.insert_one(default_settings)
            settings = default_settings
        
        # Convert ObjectId to string if present
        if "_id" in settings:
            settings["_id"] = str(settings["_id"])
        
        return settings
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch settings: {str(e)}")

@router.get("/settings/test")
async def test_settings_endpoint():
    """Test endpoint to verify admin settings routing"""
    return {
        "message": "Admin settings endpoint is working",
        "timestamp": datetime.utcnow().isoformat(),
        "status": "success"
    }

@router.put("/settings")
async def update_admin_settings(
    settings_data: Dict[str, Any],
    current_user: dict = Depends(get_current_admin_user)
):
    """Update admin settings"""
    db = get_database()
    
    settings_data["updatedAt"] = datetime.utcnow()
    settings_data["type"] = "admin"
    
    result = await db.settings.update_one(
        {"type": "admin"},
        {"$set": settings_data},
        upsert=True
    )
    
    return {"message": "Settings updated successfully"}

@router.get("/notifications")
async def get_admin_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_admin_user)
):
    """Get admin notifications"""
    db = get_database()
    
    # Get notifications for admin
    notifications_cursor = db.notifications.find({
        "$or": [
            {"type": "admin"},
            {"userId": str(current_user["_id"])}
        ]
    }).skip(skip).limit(limit).sort("createdAt", -1)
    
    notifications = await notifications_cursor.to_list(length=limit)
    total = await db.notifications.count_documents({
        "$or": [
            {"type": "admin"},
            {"userId": str(current_user["_id"])}
        ]
    })
    
    for notification in notifications:
        notification["_id"] = str(notification["_id"])
        notification["id"] = str(notification["_id"])
        # Ensure consistent field names
        if "createdAt" in notification:
            notification["date"] = notification["createdAt"]
        notification["isRead"] = notification.get("read", False)
    
    return {
        "notifications": notifications,
        "total": total,
        "unread": await db.notifications.count_documents({
            "$or": [
                {"type": "admin"},
                {"userId": str(current_user["_id"])}
            ],
            "read": {"$ne": True}
        })
    }

@router.post("/notifications")
async def create_admin_notification(
    notification_data: Dict[str, Any],
    current_user: dict = Depends(get_current_admin_user)
):
    """Create a new notification"""
    db = get_database()
    
    notification = {
        "title": notification_data.get("title", ""),
        "message": notification_data.get("message", ""),
        "type": notification_data.get("type", "info"),
        "userId": str(current_user["_id"]),
        "read": False,
        "createdAt": datetime.utcnow(),
        "priority": notification_data.get("priority", "normal")
    }
    
    result = await db.notifications.insert_one(notification)
    notification["_id"] = str(result.inserted_id)
    notification["id"] = str(result.inserted_id)
    
    return notification

@router.put("/notifications/{notification_id}/read")
async def mark_notification_as_read(
    notification_id: str,
    current_user: dict = Depends(get_current_admin_user)
):
    """Mark a notification as read"""
    db = get_database()
    
    try:
        result = await db.notifications.update_one(
            {
                "_id": ObjectId(notification_id),
                "$or": [
                    {"type": "admin"},
                    {"userId": str(current_user["_id"])}
                ]
            },
            {"$set": {"read": True, "readAt": datetime.utcnow()}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        return {"message": "Notification marked as read"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/notifications/mark-all-read")
async def mark_all_notifications_as_read(
    current_user: dict = Depends(get_current_admin_user)
):
    """Mark all notifications as read"""
    db = get_database()
    
    result = await db.notifications.update_many(
        {
            "$or": [
                {"type": "admin"},
                {"userId": str(current_user["_id"])}
            ],
            "read": {"$ne": True}
        },
        {"$set": {"read": True, "readAt": datetime.utcnow()}}
    )
    
    return {"message": f"Marked {result.modified_count} notifications as read"}

@router.delete("/notifications/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user: dict = Depends(get_current_admin_user)
):
    """Delete a notification"""
    db = get_database()
    
    try:
        result = await db.notifications.delete_one(
            {
                "_id": ObjectId(notification_id),
                "$or": [
                    {"type": "admin"},
                    {"userId": str(current_user["_id"])}
                ]
            }
        )
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        return {"message": "Notification deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/notifications/seed")
async def seed_notifications(
    current_user: dict = Depends(get_current_admin_user)
):
    """Seed the database with sample notifications for testing"""
    db = get_database()
    
    sample_notifications = [
        {
            "title": "New Application Received",
            "message": "John Doe has applied for Software Engineer position",
            "type": "info",
            "userId": str(current_user["_id"]),
            "read": False,
            "createdAt": datetime.utcnow() - timedelta(minutes=30),
            "priority": "normal"
        },
        {
            "title": "Interview Scheduled",
            "message": "Interview scheduled for Jane Smith tomorrow at 2 PM",
            "type": "success",
            "userId": str(current_user["_id"]),
            "read": False,
            "createdAt": datetime.utcnow() - timedelta(hours=2),
            "priority": "high"
        },
        {
            "title": "System Maintenance",
            "message": "Scheduled maintenance will occur this weekend",
            "type": "warning",
            "userId": str(current_user["_id"]),
            "read": True,
            "createdAt": datetime.utcnow() - timedelta(days=1),
            "priority": "normal"
        },
        {
            "title": "New Blog Post Published",
            "message": "Your blog post 'Company Culture Update' has been published",
            "type": "success",
            "userId": str(current_user["_id"]),
            "read": False,
            "createdAt": datetime.utcnow() - timedelta(hours=4),
            "priority": "low"
        },
        {
            "title": "Low Disk Space Alert",
            "message": "Server disk space is running low (85% full)",
            "type": "error",
            "userId": str(current_user["_id"]),
            "read": False,
            "createdAt": datetime.utcnow() - timedelta(hours=6),
            "priority": "high"
        }
    ]
    
    result = await db.notifications.insert_many(sample_notifications)
    
    return {
        "message": f"Created {len(result.inserted_ids)} sample notifications",
        "ids": [str(id) for id in result.inserted_ids]
    }

@router.get("/user/application-stats")
async def get_user_application_stats(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Get application statistics for a user"""
    try:
        db = get_database()
        
        # Get user's applications
        pipeline = [
            {
                "$match": {
                    "userId": str(current_user["_id"])
                }
            },
            {
                "$facet": {
                    "total": [{"$count": "count"}],
                    "pending": [{"$match": {"status": "Applied"}}, {"$count": "count"}],
                    "shortlisted": [{"$match": {"status": "Shortlisted"}}, {"$count": "count"}],
                    "interviewing": [{"$match": {"status": "Interviewing"}}, {"$count": "count"}],
                    "hired": [{"$match": {"status": "Hired"}}, {"$count": "count"}],
                    "rejected": [{"$match": {"status": "Rejected"}}, {"$count": "count"}],
                    "recent": [
                        {
                            "$match": {
                                "appliedDate": {
                                    "$gte": datetime.utcnow() - timedelta(days=30)
                                }
                            }
                        },
                        {"$count": "count"}
                    ]
                }
            }
        ]
        
        stats = await db.applications.aggregate(pipeline).to_list(length=1)
        stats = stats[0] if stats else {}
        
        # Helper function to safely get counts
        def get_count(key):
            result = stats.get(key, [])
            return result[0].get("count", 0) if result else 0
        
        response = {
            "total": get_count("total"),
            "pending": get_count("pending"),
            "shortlisted": get_count("shortlisted"),
            "interviewing": get_count("interviewing"),
            "hired": get_count("hired"),
            "rejected": get_count("rejected"),
            "recent": get_count("recent")
        }
        
        return JSONResponse(
            content=response,
            headers={
                "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-User-Session",
            }
        )
    except Exception as e:
        logger.error(f"Error in get_user_application_stats: {str(e)}")
        logger.exception("Full traceback:")
        return JSONResponse(
            content={"detail": str(e)},
            status_code=500,
            headers={
                "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-User-Session",
            }
        )

@router.options("/user/application-stats", include_in_schema=False)
async def options_user_application_stats(request: Request):
    """Handle CORS preflight requests"""
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