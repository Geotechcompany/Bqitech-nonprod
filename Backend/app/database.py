import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure
import logging
from .config import settings
from fastapi import HTTPException

logger = logging.getLogger(__name__)

# Global variable to store the database connection
_client = None
_database = None

async def connect_to_database():
    """Connect to MongoDB database"""
    global _client, _database
    
    try:
        # Try MONGODB_URI first, then DATABASE_URL from settings, then fallback
        database_url = settings.MONGODB_URI or os.getenv("MONGODB_URI") or settings.DATABASE_URL or "mongodb://localhost:27017"
        database_name = os.getenv("DATABASE_NAME", "BQITECH")
        
        logger.info(f"Connecting to MongoDB: {database_url[:30]}...")
        
        _client = AsyncIOMotorClient(database_url)
        _database = _client[database_name]
        
        # Test the connection
        await _client.admin.command('ping')
        logger.info(f"Connected to MongoDB: {database_name}")
        
    except ConnectionFailure as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        _client = None
        _database = None
        raise HTTPException(status_code=503, detail="Database connection failed")
    except Exception as e:
        logger.error(f"Unexpected error connecting to MongoDB: {e}")
        _client = None
        _database = None
        raise HTTPException(status_code=503, detail="Database connection failed")

async def close_database_connection():
    """Close database connection"""
    global _client, _database
    if _client:
        _client.close()
        _client = None
        _database = None
        logger.info("Disconnected from MongoDB")

async def disconnect_from_database():
    """Alias for close_database_connection for compatibility"""
    await close_database_connection()

def get_database():
    """Get database instance"""
    global _database
    return _database

def is_connected():
    """Check if database is connected"""
    global _database
    return _database is not None 