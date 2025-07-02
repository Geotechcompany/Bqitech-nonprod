from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import logging
from contextlib import asynccontextmanager
import datetime
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

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
from .routers.user_notifications import router as user_notifications_router
from .routers.upload import router as upload_router

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

# Create rate limiter
limiter = Limiter(key_func=get_remote_address)

# Create FastAPI app with lifespan
app = FastAPI(
    title="BQI Tech HR API",
    description="HR Management System API",
    version="1.0.0",
    lifespan=lifespan
)

# Add rate limiting middleware
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Add security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    
    if settings.enable_security_headers:
        # Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"
        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        # Enable XSS protection
        response.headers["X-XSS-Protection"] = "1; mode=block"
        # Referrer policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Content Security Policy (adjust as needed)
        if settings.is_production:
            response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
    
    return response

# Response obfuscation middleware
@app.middleware("http")
async def obfuscate_responses(request: Request, call_next):
    response = await call_next(request)
    
    # Only obfuscate API responses in production
    if settings.is_production and request.url.path.startswith("/api/"):
        # Add random headers to make responses look like regular web traffic
        response.headers["X-Cache-Status"] = "MISS" if hash(str(request.url)) % 2 else "HIT"
        response.headers["X-Response-Time"] = f"{hash(str(request.url)) % 100 + 50}ms"
        response.headers["X-Server-ID"] = f"srv-{hash(str(request.url)) % 10 + 1:02d}"
        
        # Remove server identification
        response.headers.pop("server", None)
        
        # Add generic content type variations
        if "application/json" in response.headers.get("content-type", ""):
            response.headers["content-type"] = "application/json; charset=utf-8"
    
    return response

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:3000",
        "http://localhost:9000",
        "https://bqitech.com",
        "https://bqitech-nonprod.netlify.app",
        "https://www.bqitech-nonprod.netlify.app"
       
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Include routers with consistent prefixes
logger.info("Registering routers...")
logger.info("Registering auth router at /api")
app.include_router(auth_router, prefix="/api")
logger.info("Registering admin router at /api/admin")
app.include_router(admin_router, prefix="/api/admin")
logger.info("Registering applications router at /api/applications")
app.include_router(applications_router, prefix="/api/applications")
logger.info("Registering blog router at /api/blog")
app.include_router(blog_router, prefix="/api/blog")
logger.info("Registering jobs router at /api/jobs")
app.include_router(jobs_router, prefix="/api/jobs")
logger.info("Registering user router at /api/users")  # Updated prefix
app.include_router(user_router, prefix="/api/users")  # Changed from /api/user to /api/users
logger.info("Registering contact router at /api/contact")
app.include_router(contact_router, prefix="/api/contact")
logger.info("Registering health router at /api")
app.include_router(health_router, prefix="/api")
logger.info("Registering notifications router at /api/notifications")
app.include_router(notifications_router, prefix="/api/notifications")
logger.info("Registering user notifications router at /api/user-notifications")
app.include_router(user_notifications_router, prefix="/api/user-notifications")
logger.info("Registering upload router at /api/upload")
app.include_router(upload_router, prefix="/api/upload")

# Include misc router if available
if HAS_MISC_ROUTER:
    logger.info("Registering misc router at /api")
    app.include_router(misc.router, prefix="/api")

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
        port=9000,  # Match NEXT_PUBLIC_PYTHON_API_URL
        reload=True,
        log_level="info",
        access_log=False,
        timeout_keep_alive=0
    ) 