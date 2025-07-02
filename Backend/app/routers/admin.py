from fastapi import APIRouter, Depends, HTTPException, Query, Body, UploadFile, File, Request
from typing import List, Optional, Dict, Any
from app.auth import get_current_admin_user, get_current_user
from app.models import User, Application, Job, BlogPost, Question
from app.database import get_database
from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime, timedelta
import json
from fastapi.responses import JSONResponse
from ..logger import logger
from fastapi import status

router = APIRouter(tags=["admin"])

def convert_objectids_to_strings(doc):
    """Convert ObjectIds to strings in a document"""
    if isinstance(doc, list):
        for item in doc:
            convert_objectids_to_strings(item)
        return doc
    elif isinstance(doc, dict):
        for key, value in doc.items():
            if isinstance(value, ObjectId):
                doc[key] = str(value)
            elif isinstance(value, (dict, list)):
                convert_objectids_to_strings(value)
        return doc
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
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search in title and description"),
    status: Optional[bool] = Query(None, description="Filter by isActive status"),
    department: Optional[str] = Query(None, description="Filter by department"),
    location: Optional[str] = Query(None, description="Filter by location"),
    sort_by: Optional[str] = Query("createdAt", description="Field to sort by (createdAt, title, department, location)"),
    sort_order: Optional[str] = Query("desc", description="Sort order (asc, desc)")
):
    """Get all job postings"""
    try:
        db = get_database()
        
        # Validate sort parameters
        valid_sort_fields = ["createdAt", "title", "department", "location"]
        if sort_by not in valid_sort_fields:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid sort_by field. Must be one of: {', '.join(valid_sort_fields)}"
            )
        
        if sort_order not in ["asc", "desc"]:
            raise HTTPException(
                status_code=400,
                detail="Invalid sort_order. Must be 'asc' or 'desc'"
            )
        
        # Build query
        query = {}
        
        # Add search
        if search:
            query["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}}
            ]
        
        # Add filters
        if status is not None:
            query["isActive"] = status
        if department:
            query["department"] = department
        if location:
            query["location"] = location
        
        # Build sort
        sort_direction = -1 if sort_order == "desc" else 1
        sort_options = [(sort_by, sort_direction)]
        
        # Get job postings
        postings_cursor = db.jobpostings.find(query).skip(skip).limit(limit).sort(sort_options)
        postings = await postings_cursor.to_list(length=limit)
        total = await db.jobpostings.count_documents(query)
        
        # Convert ObjectIds to strings and add required fields
        for posting in postings:
            try:
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
                
                # Get application count for each job
                try:
                    posting["applicationCount"] = await db.applications.count_documents({"jobId": str(posting["_id"])})
                except Exception as e:
                    logger.error(f"Error getting application count for job {posting['_id']}: {str(e)}")
                    posting["applicationCount"] = 0
                
                # Get creator details
                if "createdBy" in posting:
                    try:
                        creator = await db.users.find_one({"_id": ObjectId(posting["createdBy"])}, {"password": 0})
                        if creator:
                            convert_objectids_to_strings(creator)
                            posting["creatorDetails"] = creator
                        else:
                            posting["creatorDetails"] = None
                    except Exception as e:
                        logger.error(f"Error getting creator details for job {posting['_id']}: {str(e)}")
                        posting["creatorDetails"] = None
                
                # Get questions count
                try:
                    posting["questionsCount"] = await db.jobquestions.count_documents({"jobId": str(posting["_id"])})
                except Exception as e:
                    logger.error(f"Error getting questions count for job {posting['_id']}: {str(e)}")
                    posting["questionsCount"] = 0
            except Exception as e:
                logger.error(f"Error processing job posting {posting.get('_id', 'unknown')}: {str(e)}")
                continue
        
        # Get unique departments and locations for filters
        try:
            departments = await db.jobpostings.distinct("department")
            locations = await db.jobpostings.distinct("location")
        except Exception as e:
            logger.error(f"Error getting distinct values: {str(e)}")
            departments = []
            locations = []
        
        response_data = {
            "jobPostings": postings,
            "total": total,
            "filters": {
                "departments": departments,
                "locations": locations
            },
            "sort": {
                "field": sort_by,
                "order": sort_order
            }
        }
        
        # Return with proper JSON serialization
        return JSONResponse(
            content=json.loads(json.dumps(response_data, cls=CustomJSONEncoder)),
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        )
    except Exception as e:
        logger.error(f"Error in get_job_postings: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(
            status_code=500,
            detail="Failed to get job postings"
        )

@router.post("/job-postings")
async def create_job_posting(
    job_data: Dict[str, Any],
    current_user: dict = Depends(get_current_admin_user)
):
    """Create new job posting"""
    db = get_database()
    
    # Clean up HTML entities in description
    if "description" in job_data:
        job_data["description"] = (
            job_data["description"]
            .replace("&nbsp;", " ")  # Replace &nbsp; with regular space
            .replace("\\s+", " ")    # Normalize multiple spaces using proper regex escape
            .strip()                 # Trim extra spaces
        )
    
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
        # Clean up HTML entities in description
        if "description" in update_data:
            update_data["description"] = (
                update_data["description"]
                .replace("&nbsp;", " ")  # Replace &nbsp; with regular space
                .replace("\\s+", " ")    # Normalize multiple spaces using proper regex escape
                .strip()                 # Trim extra spaces
            )
        
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
    current_user: dict = Depends(get_current_admin_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """Get all blog posts"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        posts_cursor = db.blogposts.find({}).skip(skip).limit(limit).sort("createdAt", -1)
        posts = await posts_cursor.to_list(length=limit)
        total = await db.blogposts.count_documents({})
        
        # Convert ObjectIds to strings and format dates
        for post in posts:
            convert_objectids_to_strings(post)
            post["id"] = str(post["_id"])
            
            # Format dates
            if "createdAt" in post and hasattr(post["createdAt"], "isoformat"):
                post["createdAt"] = post["createdAt"].isoformat()
            if "updatedAt" in post and hasattr(post["updatedAt"], "isoformat"):
                post["updatedAt"] = post["updatedAt"].isoformat()
            if "publishedAt" in post and hasattr(post["publishedAt"], "isoformat"):
                post["publishedAt"] = post["publishedAt"].isoformat()
                
            # Ensure required fields are present
            post.setdefault("title", "")
            post.setdefault("content", "")
            post.setdefault("excerpt", "")
            post.setdefault("category", "Uncategorized")
            post.setdefault("tags", [])
            post.setdefault("imageUrl", "")
            post.setdefault("readTime", "")
            post.setdefault("published", False)
            post.setdefault("isPublished", False)
        
        # Return with the expected structure
        return JSONResponse(
            content={"blogPosts": posts, "total": total},
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept"
            }
        )
    except Exception as e:
        logger.error(f"Error in get_blog_posts: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.options("/blog-posts", include_in_schema=False)
async def options_blog_posts(request: Request):
    """Handle CORS preflight requests"""
    origin = request.headers.get("origin", "http://localhost:3000")
    return JSONResponse(
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-User-Session",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": "3600",
        }
    )

@router.post("/blog-posts")
async def create_blog_post(
    post_data: Dict[str, Any],
    current_user: dict = Depends(get_current_admin_user)
):
    """Create new blog post"""
    db = get_database()
    
    # Handle author profile data
    author_profile = None
    if all(key in post_data for key in ['authorName', 'authorBio', 'authorTitle', 'authorProfileImage']):
        social_links = {}
        if post_data.get('authorTwitter'):
            social_links['twitter'] = post_data.pop('authorTwitter')
        if post_data.get('authorLinkedin'):
            social_links['linkedin'] = post_data.pop('authorLinkedin')
        if post_data.get('authorGithub'):
            social_links['github'] = post_data.pop('authorGithub')
        if post_data.get('authorWebsite'):
            social_links['website'] = post_data.pop('authorWebsite')
        
        author_profile = {
            "name": post_data.pop('authorName'),
            "bio": post_data.pop('authorBio'),
            "title": post_data.pop('authorTitle'),
            "profile_image": post_data.pop('authorProfileImage'),
            "social_links": social_links if social_links else None
        }
        post_data["authorProfile"] = author_profile
    
    post_data["createdAt"] = datetime.utcnow()
    post_data["updatedAt"] = datetime.utcnow()
    post_data["authorId"] = str(current_user["_id"])
    
    # Set default author name if no profile provided
    if not author_profile:
        post_data["author"] = current_user.get("name", "Admin")
    else:
        post_data["author"] = author_profile["name"]
    
    result = await db.blogposts.insert_one(post_data)
    post_data["_id"] = str(result.inserted_id)
    post_data["id"] = str(result.inserted_id)
    
    return post_data

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
        
        # Ensure authorProfile is properly formatted for the frontend form
        if "authorProfile" in post and post["authorProfile"]:
            # Convert profile_image to profileImage for frontend compatibility
            if "profile_image" in post["authorProfile"]:
                post["authorProfile"]["profileImage"] = post["authorProfile"].pop("profile_image")
            
            # Ensure social_links is properly formatted
            if "social_links" in post["authorProfile"] and post["authorProfile"]["social_links"]:
                post["authorProfile"]["socialLinks"] = post["authorProfile"].pop("social_links")
            else:
                post["authorProfile"]["socialLinks"] = {}
        
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
        # Handle author profile data
        if all(key in update_data for key in ['authorName', 'authorBio', 'authorTitle', 'authorProfileImage']):
            social_links = {}
            if update_data.get('authorTwitter'):
                social_links['twitter'] = update_data.pop('authorTwitter')
            if update_data.get('authorLinkedin'):
                social_links['linkedin'] = update_data.pop('authorLinkedin')
            if update_data.get('authorGithub'):
                social_links['github'] = update_data.pop('authorGithub')
            if update_data.get('authorWebsite'):
                social_links['website'] = update_data.pop('authorWebsite')
            
            author_profile = {
                "name": update_data.pop('authorName'),
                "bio": update_data.pop('authorBio'),
                "title": update_data.pop('authorTitle'),
                "profile_image": update_data.pop('authorProfileImage'),
                "social_links": social_links if social_links else None
            }
            update_data["authorProfile"] = author_profile
            update_data["author"] = author_profile["name"]
        
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

@router.patch("/blog-posts/{post_id}")
async def patch_blog_post(
    post_id: str,
    update_data: Dict[str, Any],
    current_user: dict = Depends(get_current_admin_user)
):
    """Patch blog post (for partial updates like status changes)"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        # Handle author profile data if present
        if all(key in update_data for key in ['authorName', 'authorBio', 'authorTitle', 'authorProfileImage']):
            social_links = {}
            if update_data.get('authorTwitter'):
                social_links['twitter'] = update_data.pop('authorTwitter')
            if update_data.get('authorLinkedin'):
                social_links['linkedin'] = update_data.pop('authorLinkedin')
            if update_data.get('authorGithub'):
                social_links['github'] = update_data.pop('authorGithub')
            if update_data.get('authorWebsite'):
                social_links['website'] = update_data.pop('authorWebsite')
            
            author_profile = {
                "name": update_data.pop('authorName'),
                "bio": update_data.pop('authorBio'),
                "title": update_data.pop('authorTitle'),
                "profile_image": update_data.pop('authorProfileImage'),
                "social_links": social_links if social_links else {}
            }
            update_data["authorProfile"] = author_profile
            update_data["author"] = author_profile["name"]
        
        update_data["updatedAt"] = datetime.utcnow()
        
        result = await db.blogposts.update_one(
            {"_id": ObjectId(post_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Blog post not found")
        
        return JSONResponse(
            content={"message": "Blog post updated successfully"},
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "PATCH, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept"
            }
        )
    except Exception as e:
        logger.error(f"Error in patch_blog_post: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

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

@router.options("/blog-posts/{post_id}", include_in_schema=False)
async def options_blog_post_by_id(request: Request, post_id: str):
    """Handle CORS preflight requests for specific blog post"""
    origin = request.headers.get("origin", "http://localhost:3000")
    return JSONResponse(
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, PUT, PATCH, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-User-Session",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": "3600",
        }
    )

# Analytics and Overview endpoints
@router.get("/overview")
async def get_admin_overview(
    current_user: dict = Depends(get_current_admin_user)
):
    """Get admin overview"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection failed")
        
        # Get base counts
        total_users = await db.users.count_documents({})
        total_jobs = await db.jobpostings.count_documents({})
        active_jobs = await db.jobpostings.count_documents({"isActive": True})
        total_applications = await db.applications.count_documents({})
        
        # Get application counts by status
        new_applications = await db.applications.count_documents({"status": "New"})
        shortlisted = await db.applications.count_documents({"status": "Shortlisted"})
        interviewing = await db.applications.count_documents({"status": "Interviewing"})
        hired = await db.applications.count_documents({"status": "Hired"})
        rejected = await db.applications.count_documents({"status": "Rejected"})
        technical_assessment = await db.applications.count_documents({"status": "Technical Assessment"})
        disqualified = await db.applications.count_documents({"status": "Disqualified"})
        
        # Get recent applications (last 7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        recent_count = await db.applications.count_documents({
            "createdAt": {"$gte": seven_days_ago}
        })
        
        # Get status breakdown for chart
        status_breakdown = []
        statuses = ["New", "Shortlisted", "Interviewing", "Technical Assessment", "Hired", "Rejected", "Disqualified"]
        for status in statuses:
            count = await db.applications.count_documents({"status": status})
            status_breakdown.append({"status": status, "count": count})
        
        response_data = {
            "applications": {
                "total": total_applications,
                "new": new_applications,
                "shortlisted": shortlisted,
                "interviewing": interviewing,
                "hired": hired,
                "rejected": rejected,
                "technical_assessment": technical_assessment,
                "disqualified": disqualified,
                "recent": recent_count
            },
            "jobs": {
                "total": total_jobs,
                "active": active_jobs
            },
            "users": {
                "total": total_users
            },
            "status_breakdown": status_breakdown
        }
        
        return JSONResponse(
            content=json.loads(json.dumps(response_data, cls=CustomJSONEncoder)),
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        )
        
    except Exception as e:
        logger.error(f"Error in get_admin_overview: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.options("/overview")
async def options_overview(request: Request):
    """Handle CORS preflight requests for overview endpoint"""
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

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (ObjectId, datetime)):
            return str(obj)
        return super().default(obj)

@router.get("/applications")
async def get_admin_applications(
    current_user: dict = Depends(get_current_admin_user),
    limit: int = Query(10, ge=1, le=100),
    skip: int = Query(0, ge=0),
    status: Optional[str] = None,
    sort_by: Optional[str] = Query("createdAt", description="Field to sort by (createdAt, status, updatedAt)"),
    sort_order: Optional[str] = Query("desc", description="Sort order (asc, desc)")
):
    """Get applications for admin"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        # Build query
        query = {}
        if status:
            query["status"] = status
            
        # Get applications with pagination
        sort_direction = -1 if sort_order == "desc" else 1
        sort_field = sort_by if sort_by in ["createdAt", "status", "updatedAt"] else "createdAt"
        
        applications_cursor = db.applications.find(query).skip(skip).limit(limit).sort(sort_field, sort_direction)
        applications = await applications_cursor.to_list(length=limit)
        total = await db.applications.count_documents(query)
        
        # Convert ObjectIds to strings and add job details
        for app in applications:
            app["id"] = str(app.pop("_id"))
            
            # Convert datetime fields
            for field in ["createdAt", "updatedAt", "appliedDate"]:
                if field in app and isinstance(app[field], datetime):
                    app[field] = app[field].isoformat()
            
            # Get job details
            if "jobId" in app:
                try:
                    job = await db.jobpostings.find_one({"_id": ObjectId(app["jobId"])})
                    if job:
                        job["id"] = str(job.pop("_id"))
                        # Convert datetime fields in job
                        for field in ["createdAt", "updatedAt", "postedDate"]:
                            if field in job and isinstance(job[field], datetime):
                                job[field] = job[field].isoformat()
                        app["jobDetails"] = job
                        app["position"] = job.get("title", "Unknown Position")
                    else:
                        app["jobDetails"] = None
                        app["position"] = "Unknown Position"
                except Exception as e:
                    logger.error(f"Error getting job details for application {app['id']}: {str(e)}")
                    app["jobDetails"] = None
                    app["position"] = "Unknown Position"
            
            # Get user details
            if "userId" in app:
                try:
                    user = await db.users.find_one({"_id": ObjectId(app["userId"])}, {"password": 0})
                    if user:
                        user["id"] = str(user.pop("_id"))
                        # Convert datetime fields in user
                        for field in ["createdAt", "updatedAt", "lastLoginAt"]:
                            if field in user and isinstance(user[field], datetime):
                                user[field] = user[field].isoformat()
                        app["userDetails"] = user
                    else:
                        app["userDetails"] = None
                except Exception as e:
                    logger.error(f"Error getting user details for application {app['id']}: {str(e)}")
                    app["userDetails"] = None
        
        response_data = {
            "applications": applications,
            "total": total,
            "sort": {
                "field": sort_by,
                "order": sort_order
            }
        }
        
        # Use custom JSON encoder to handle any remaining datetime objects
        return JSONResponse(
            content=json.loads(json.dumps(response_data, cls=CustomJSONEncoder)),
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        )
        
    except Exception as e:
        logger.error(f"Error in get_admin_applications: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trends")
async def get_application_trends(
    current_user: dict = Depends(get_current_admin_user),
    days: int = Query(30, ge=1, le=365)
):
    """Get application trends"""
    db = get_database()
    
    # Calculate date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get daily application counts
    pipeline = [
        {
            "$match": {
                "createdAt": {
                    "$gte": start_date,
                    "$lte": end_date
                }
            }
        },
        {
            "$group": {
                "_id": {
                    "$dateToString": {
                        "format": "%Y-%m-%d",
                        "date": "$createdAt"
                    }
                },
                "count": {"$sum": 1}
            }
        },
        {
            "$sort": {"_id": 1}
        }
    ]
    
    daily_counts = await db.applications.aggregate(pipeline).to_list(length=None)
    
    # Format response
    trends = []
    current_date = start_date
    while current_date <= end_date:
        date_str = current_date.strftime("%Y-%m-%d")
        count = next((item["count"] for item in daily_counts if item["_id"] == date_str), 0)
        trends.append({
            "date": date_str,
            "count": count
        })
        current_date += timedelta(days=1)
    
    return {"trends": trends}

@router.get("/applications-by-job")
async def get_applications_by_job(
    current_user: dict = Depends(get_current_admin_user)
):
    """Get applications grouped by job"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        # Get applications grouped by job
        pipeline = [
            {
                "$addFields": {
                    "jobIdStr": { "$toString": "$jobId" }
                }
            },
            {
                "$group": {
                    "_id": "$jobIdStr",
                    "count": { "$sum": 1 },
                    "statuses": {
                        "$push": "$status"
                    }
                }
            }
        ]
        
        job_stats = await db.applications.aggregate(pipeline).to_list(length=None)
        
        # Get job details and format response
        result = []
        for stat in job_stats:
            try:
                job = await db.jobpostings.find_one({"_id": ObjectId(stat["_id"])})
                if job:
                    # Count status breakdown
                    status_breakdown = {}
                    for status in stat["statuses"]:
                        status_breakdown[status] = status_breakdown.get(status, 0) + 1
                    
                    job_data = {
                        "jobId": str(stat["_id"]),
                        "position": job.get("title", "Unknown Job"),  # Frontend expects 'position' not 'title'
                        "title": job.get("title", "Unknown Job"),
                        "department": job.get("department", "N/A"),
                        "totalApplications": stat["count"],  # Frontend expects 'totalApplications' not 'count'
                        "count": stat["count"],
                        "statuses": stat["statuses"],
                        "statusBreakdown": status_breakdown
                    }
                    # Convert any datetime fields
                    for field in ["createdAt", "updatedAt", "postedDate"]:
                        if field in job and isinstance(job[field], datetime):
                            job_data[field] = job[field].isoformat()
                    result.append(job_data)
            except Exception as e:
                logger.error(f"Error processing job stats: {str(e)}")
                continue
        
        response_data = {"applicationsByJob": result}  # Frontend expects 'applicationsByJob' not 'jobs'
        return JSONResponse(
            content=json.loads(json.dumps(response_data, cls=CustomJSONEncoder)),
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        )
        
    except Exception as e:
        logger.error(f"Error in get_applications_by_job: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Questions Management
@router.get("/questions")
async def get_questions(
    current_user: dict = Depends(get_current_admin_user),
    job_id: Optional[str] = Query(None)
):
    """Get all questions, optionally filtered by job"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        filter_query = {}
        if job_id:
            filter_query["jobId"] = job_id
        
        questions_cursor = db.jobquestions.find(filter_query).sort("order", 1)
        questions = await questions_cursor.to_list(length=None)
        
        # Convert ObjectIds to strings and add id field
        for question in questions:
            convert_objectids_to_strings(question)
            question["id"] = str(question.pop("_id"))
            
            # Ensure order field exists
            if "order" not in question or question["order"] is None:
                question["order"] = 0
            
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
        
        # Return with proper JSON serialization and CORS headers
        return JSONResponse(
            content=json.loads(json.dumps({"questions": questions}, cls=CustomJSONEncoder)),
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        )
    except Exception as e:
        logger.error(f"Error in get_questions: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/questions")
async def create_question(
    question_data: Dict[str, Any],
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

@router.get("/questions/{question_id}")
async def get_question(
    question_id: str,
    current_user: dict = Depends(get_current_admin_user)
):
    """Get specific question"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        try:
            question = await db.jobquestions.find_one({"_id": ObjectId(question_id)})
            if not question:
                raise HTTPException(status_code=404, detail="Question not found")
            
            # Convert ObjectIds to strings
            convert_objectids_to_strings(question)
            question["id"] = str(question.pop("_id"))
            
            # Return with proper JSON serialization
            return JSONResponse(
                content=json.loads(json.dumps(question, cls=CustomJSONEncoder)),
                headers={
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization"
                }
            )
        except InvalidId:
            logger.error(f"Invalid question ID format: {question_id}")
            raise HTTPException(status_code=400, detail="Invalid question ID")
    except Exception as e:
        logger.error(f"Error in get_question: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/questions/{question_id}")
async def update_question(
    question_id: str,
    update_data: Dict[str, Any],
    current_user: dict = Depends(get_current_admin_user)
):
    """Update question"""
    db = get_database()
    
    try:
        result = await db.jobquestions.update_one(
            {"_id": ObjectId(question_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Question not found")
        
        return {"message": "Question updated successfully"}
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid question ID")

@router.delete("/questions/{question_id}")
async def delete_question(
    question_id: str,
    current_user: dict = Depends(get_current_admin_user)
):
    """Delete question"""
    db = get_database()
    
    try:
        result = await db.jobquestions.delete_one({"_id": ObjectId(question_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Question not found")
        
        return {"message": "Question deleted successfully"}
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid question ID")

@router.put("/questions/reorder-questions")
async def reorder_questions(
    reorder_data: Dict[str, Any] = Body(...),
    current_user: dict = Depends(get_current_admin_user)
):
    """Reorder questions"""
    try:
        db = get_database()
        if db is None:
            logger.error("Database connection not available")
            raise HTTPException(status_code=503, detail="Database not available")
        
        updates = reorder_data.get("updates", [])
        if not updates:
            logger.error("No updates provided in request")
            raise HTTPException(status_code=400, detail="No updates provided")
        
        logger.info(f"Processing {len(updates)} updates")
        
        # First validate all IDs before making any changes
        for update in updates:
            if not update.get("id") or not isinstance(update.get("order"), int):
                logger.error(f"Invalid update format: {update}")
                raise HTTPException(
                    status_code=400,
                    detail="Each update must have an 'id' and 'order' field"
                )
            
            try:
                # Validate ObjectId format
                ObjectId(update["id"])
            except InvalidId:
                logger.error(f"Invalid ObjectId format: {update['id']}")
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid question ID format: {update['id']}"
                )
        
        # Then verify all questions exist
        question_ids = [ObjectId(update["id"]) for update in updates]
        questions = await db.jobquestions.find({"_id": {"$in": question_ids}}).to_list(None)
        found_ids = {str(q["_id"]) for q in questions}
        
        # Check for missing questions
        missing_ids = [update["id"] for update in updates if update["id"] not in found_ids]
        if missing_ids:
            logger.error(f"Questions not found: {missing_ids}")
            raise HTTPException(
                status_code=404,
                detail=f"Questions not found: {', '.join(missing_ids)}"
            )
        
        # Finally, update all questions
        updated_questions = []
        for update in updates:
            try:
                result = await db.jobquestions.find_one_and_update(
                    {"_id": ObjectId(update["id"])},
                    {"$set": {
                        "order": update["order"],
                        "updatedAt": datetime.utcnow()
                    }},
                    return_document=True,
                    projection={"_id": 1, "question": 1, "type": 1, "required": 1, "options": 1, "order": 1, "jobIds": 1, "createdAt": 1, "updatedAt": 1}
                )
                
                if not result:
                    logger.error(f"Failed to update question {update['id']}")
                    raise HTTPException(
                        status_code=500,
                        detail=f"Failed to update question: {update['id']}"
                    )
                
                # Convert ObjectIds to strings
                result_dict = dict(result)  # Convert SON to dict
                convert_objectids_to_strings(result_dict)
                result_dict["id"] = str(result_dict.pop("_id"))
                updated_questions.append(result_dict)
                
                logger.info(f"Successfully updated question {update['id']} order to {update['order']}")
            except Exception as e:
                logger.error(f"Error updating question {update['id']}: {str(e)}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to update question {update['id']}: {str(e)}"
                )
        
        # Return with proper JSON serialization
        response_data = {
            "message": "Questions reordered successfully",
            "questions": updated_questions
        }
        
        # Convert any remaining ObjectIds to strings
        convert_objectids_to_strings(response_data)
        
        return JSONResponse(
            content=response_data,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "PUT, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in reorder_questions: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail="Internal server error")

# Settings endpoints
@router.get("/settings")
async def get_admin_settings(
    current_user: dict = Depends(get_current_admin_user)
):
    """Get admin settings"""
    try:
        db = get_database()
        
        settings = await db.settings.find_one({"type": "admin"})
        
        if not settings:
            # Create default settings
            settings = {
                "type": "admin",
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow(),
                "jobSettings": {
                    "autoClose": True,
                    "autoCloseAfterDays": 30,
                    "requireApproval": True,
                    "notifyOnNewApplications": True
                },
                "emailSettings": {
                    "sendWelcomeEmail": True,
                    "sendApplicationConfirmation": True,
                    "sendStatusUpdates": True
                },
                "applicationSettings": {
                    "allowReapply": True,
                    "reapplyWaitDays": 90,
                    "maxActiveApplications": 5
                }
            }
            try:
                result = await db.settings.insert_one(settings)
                settings["_id"] = str(result.inserted_id)
            except Exception as e:
                logger.error(f"Error creating default settings: {str(e)}")
                logger.exception("Full traceback:")
                raise HTTPException(status_code=500, detail="Failed to create default settings")
        else:
            # Convert ObjectIds to strings
            convert_objectids_to_strings(settings)
            settings["id"] = str(settings["_id"])
        
        return {"settings": settings}
    except Exception as e:
        logger.error(f"Error in get_admin_settings: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=str(e))

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
    try:
        db = get_database()
        
        settings_data["updatedAt"] = datetime.utcnow()
        settings_data["type"] = "admin"
        
        result = await db.settings.update_one(
            {"type": "admin"},
            {"$set": settings_data},
            upsert=True
        )
        
        # Get updated settings
        updated_settings = await db.settings.find_one({"type": "admin"})
        if not updated_settings:
            raise HTTPException(status_code=500, detail="Failed to retrieve updated settings")
        
        # Convert ObjectIds to strings
        convert_objectids_to_strings(updated_settings)
        updated_settings["id"] = str(updated_settings["_id"])
        
        return {"settings": updated_settings, "message": "Settings updated successfully"}
    except Exception as e:
        logger.error(f"Error in update_admin_settings: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/notifications")
async def get_admin_notifications(
    current_user: dict = Depends(get_current_admin_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100)
):
    """Get admin notifications"""
    db = get_database()
    
    # Get notifications for this admin user OR system-wide admin notifications (userId is null)
    notifications_cursor = db.notifications.find({
        "$or": [
            {"userId": str(current_user["_id"])},  # User-specific notifications
            {"userId": {"$in": [None, ""]}},       # System-wide admin notifications
            {"userId": {"$exists": False}}         # Notifications without userId field
        ]
    }).skip(skip).limit(limit).sort("createdAt", -1)
    
    notifications = await notifications_cursor.to_list(length=limit)
    total = await db.notifications.count_documents({
        "$or": [
            {"userId": str(current_user["_id"])},
            {"userId": {"$in": [None, ""]}},
            {"userId": {"$exists": False}}
        ]
    })
    
    # Convert ObjectIds to strings
    for notification in notifications:
        convert_objectids_to_strings(notification)
        notification["id"] = str(notification["_id"])
    
    return {"notifications": notifications, "total": total}

@router.post("/notifications")
async def create_admin_notification(
    notification_data: Dict[str, Any],
    current_user: dict = Depends(get_current_admin_user)
):
    """Create admin notification"""
    db = get_database()
    
    notification_data["createdAt"] = datetime.utcnow()
    notification_data["userId"] = str(current_user["_id"])
    notification_data["isRead"] = False
    
    result = await db.notifications.insert_one(notification_data)
    notification_data["_id"] = str(result.inserted_id)
    notification_data["id"] = str(result.inserted_id)
    
    return notification_data

@router.put("/notifications/{notification_id}/read")
async def mark_notification_as_read(
    notification_id: str,
    current_user: dict = Depends(get_current_admin_user)
):
    """Mark notification as read"""
    db = get_database()
    
    # Allow marking as read for user-specific notifications OR system-wide notifications
    result = await db.notifications.update_one(
        {
            "_id": ObjectId(notification_id),
            "$or": [
                {"userId": str(current_user["_id"])},  # User-specific notifications
                {"userId": {"$in": [None, ""]}},       # System-wide admin notifications
                {"userId": {"$exists": False}}         # Notifications without userId field
            ]
        },
        {"$set": {"isRead": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"message": "Notification marked as read"}

@router.put("/notifications/mark-all-read")
async def mark_all_notifications_as_read(
    current_user: dict = Depends(get_current_admin_user)
):
    """Mark all notifications as read"""
    db = get_database()
    
    # Mark all notifications as read for this admin (user-specific + system-wide)
    result = await db.notifications.update_many(
        {
            "$or": [
                {"userId": str(current_user["_id"])},  # User-specific notifications
                {"userId": {"$in": [None, ""]}},       # System-wide admin notifications
                {"userId": {"$exists": False}}         # Notifications without userId field
            ]
        },
        {"$set": {"isRead": True}}
    )
    
    return {"message": f"Marked {result.modified_count} notifications as read"}

@router.delete("/notifications/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user: dict = Depends(get_current_admin_user)
):
    """Delete notification"""
    db = get_database()
    
    # Allow deleting user-specific notifications OR system-wide notifications
    result = await db.notifications.delete_one({
        "_id": ObjectId(notification_id),
        "$or": [
            {"userId": str(current_user["_id"])},  # User-specific notifications
            {"userId": {"$in": [None, ""]}},       # System-wide admin notifications
            {"userId": {"$exists": False}}         # Notifications without userId field
        ]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"message": "Notification deleted successfully"}

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
            "isRead": False,
            "createdAt": datetime.utcnow() - timedelta(minutes=30),
            "priority": "normal"
        },
        {
            "title": "Interview Scheduled",
            "message": "Interview scheduled for Jane Smith tomorrow at 2 PM",
            "type": "success",
            "userId": str(current_user["_id"]),
            "isRead": False,
            "createdAt": datetime.utcnow() - timedelta(hours=2),
            "priority": "high"
        },
        {
            "title": "System Maintenance",
            "message": "Scheduled maintenance will occur this weekend",
            "type": "warning",
            "userId": str(current_user["_id"]),
            "isRead": True,
            "createdAt": datetime.utcnow() - timedelta(days=1),
            "priority": "normal"
        },
        {
            "title": "New Blog Post Published",
            "message": "Your blog post 'Company Culture Update' has been published",
            "type": "success",
            "userId": str(current_user["_id"]),
            "isRead": False,
            "createdAt": datetime.utcnow() - timedelta(hours=4),
            "priority": "low"
        },
        {
            "title": "Low Disk Space Alert",
            "message": "Server disk space is running low (85% full)",
            "type": "error",
            "userId": str(current_user["_id"]),
            "isRead": False,
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
    current_user: dict = Depends(get_current_user)
):
    """Get application statistics for a user"""
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
    
    return {
        "total": get_count("total"),
        "pending": get_count("pending"),
        "shortlisted": get_count("shortlisted"),
        "interviewing": get_count("interviewing"),
        "hired": get_count("hired"),
        "rejected": get_count("rejected"),
        "recent": get_count("recent")
    }

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

@router.delete("/applications/bulk")
async def bulk_delete_applications(
    request: Request,
    data: dict = Body(...),
    current_user: dict = Depends(get_current_admin_user)
):
    """Bulk delete applications"""
    try:
        if not data.get("ids"):
            raise HTTPException(status_code=400, detail="No application IDs provided")
            
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
            
        # Convert string IDs to ObjectIds
        object_ids = [ObjectId(id) for id in data["ids"]]
        
        # Delete applications
        result = await db.applications.delete_many({"_id": {"$in": object_ids}})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="No applications found to delete")
            
        return {
            "message": f"Successfully deleted {result.deleted_count} applications",
            "deleted_count": result.deleted_count
        }
        
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid application ID format")
    except Exception as e:
        logger.error(f"Error in bulk delete applications: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 