from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import logging
from contextlib import asynccontextmanager

from app.database import connect_to_database, close_database_connection
from app.config import settings

# Import available routers
from app.routers import admin, auth, applications, blog, jobs, user, contact, health, notifications

# Try to import misc router if it exists
try:
    from app.routers import misc
    HAS_MISC_ROUTER = True
except ImportError:
    HAS_MISC_ROUTER = False

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up...")
    await connect_to_database()
    yield
    # Shutdown
    logger.info("Shutting down...")
    await close_database_connection()

# Create FastAPI app with lifespan
app = FastAPI(
    title="BQI Tech HR API",
    description="HR Management System API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://bqitech.com",
        "https://www.bqitech.com"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
    expose_headers=["Content-Type", "Authorization"],
    max_age=3600,
)

# Middleware to ensure CORS headers are always present
@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    response = await call_next(request)
    origin = request.headers.get("origin")
    if origin in [
        "http://localhost:3000",
        "https://bqitech.com",
        "https://www.bqitech.com"
    ]:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Accept"
        response.headers["Access-Control-Expose-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Max-Age"] = "3600"
    return response

# Error handler for CORS preflight requests
@app.options("/{full_path:path}")
async def options_handler(request: Request):
    origin = request.headers.get("origin")
    if origin in [
        "http://localhost:3000",
        "https://bqitech.com",
        "https://www.bqitech.com"
    ]:
        return JSONResponse(
            status_code=200,
            content={"message": "OK"},
            headers={
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
                "Access-Control-Expose-Headers": "Content-Type, Authorization",
                "Access-Control-Max-Age": "3600",
            }
        )
    return JSONResponse(status_code=403, content={"message": "Origin not allowed"})

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(applications.router, prefix="/api")
app.include_router(blog.router, prefix="/api")
app.include_router(jobs.router, prefix="/api")
app.include_router(user.router, prefix="/api")
app.include_router(contact.router, prefix="/api")
app.include_router(health.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")

# Include misc router if available
if HAS_MISC_ROUTER:
    app.include_router(misc.router, prefix="/api")

@app.get("/")
async def root():
    return JSONResponse(content={"message": "BQI Tech HR API is running", "version": "1.0.0"})

@app.get("/health")
async def health_check():
    return JSONResponse(content={"status": "healthy", "message": "API is running"})

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
        access_log=False,  # Disable access logging
        timeout_keep_alive=0  # Disable keep-alive to prevent streaming
    ) 