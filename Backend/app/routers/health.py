from fastapi import APIRouter, HTTPException
from app.database import get_database, is_connected
from pymongo.errors import ConnectionFailure

router = APIRouter(tags=["health"])

@router.get("/")
async def health_check():
    """Check API and database health"""
    try:
        # Check database connection
        db = get_database()
        if not is_connected():
            raise HTTPException(status_code=503, detail="Database not connected")
            
        # Try to ping the database
        await db.command("ping")
        
        return {
            "status": "healthy",
            "database": "connected",
            "message": "API and database are running"
        }
    except ConnectionFailure as e:
        raise HTTPException(
            status_code=503,
            detail=f"Database connection failed: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Health check failed: {str(e)}"
        ) 