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
logging.basicConfig(level=logging.INFO)
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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-domain.com"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    return {"message": "BQI Tech HR API is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 