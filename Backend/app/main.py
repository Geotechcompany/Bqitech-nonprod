from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import logging
from contextlib import asynccontextmanager
import datetime

from .database import connect_to_database, close_database_connection, get_database, is_connected
from .config import settings

# Import routers directly from modules
from .routers.admin import router as admin_router
from .routers.auth import router as auth_router
from .routers.applications import router as applications_router
from .routers.blog import router as blog_router
from .routers.jobs import router as jobs_router
from .routers.user import router as user_router
from .routers.contact import router as contact_router
from .routers.health import router as health_router
from .routers.notifications import router as notifications_router

# Try to import misc router if it exists
try:
    from .routers import misc
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

# Configure CORS
origins = [
    "https://bqitech.com",
    "https://www.bqitech.com",
    "https://bqitech-nonprod.netlify.app",
    "http://localhost:3000",
    "*"  # Allow all origins for public endpoints
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Include routers with consistent prefixes
logger.info("Registering routers...")
app.include_router(auth_router, prefix="/api")
app.include_router(admin_router, prefix="/api/admin")
app.include_router(applications_router, prefix="/api/applications")
app.include_router(blog_router, prefix="/api/blog")
app.include_router(jobs_router, prefix="/api/jobs")
logger.info("Registering user router at /api/user")  # Debug log
app.include_router(user_router, prefix="/api/user")
app.include_router(contact_router, prefix="/api/contact")
app.include_router(health_router, prefix="/api")
app.include_router(notifications_router, prefix="/api/notifications")

# Include misc router if available
if HAS_MISC_ROUTER:
    app.include_router(misc.router, prefix="/api/misc")

# Root endpoints
@app.get("/")
async def root():
    return {"message": "BQI Tech HR API is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    try:
        # Check database connection
        if not is_connected():
            return {
                "status": "unhealthy",
                "message": "API is running but database is not connected",
                "database": "disconnected",
                "timestamp": datetime.datetime.utcnow().isoformat()
            }
        
        db = get_database()
        await db.command('ping')
        return {
            "status": "healthy",
            "message": "API is running",
            "database": "connected",
            "timestamp": datetime.datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "message": "API is running but database check failed",
            "error": str(e),
            "timestamp": datetime.datetime.utcnow().isoformat()
        }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
        access_log=False,
        timeout_keep_alive=0
    ) 