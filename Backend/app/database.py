import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure
import logging
from .config import settings

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
        logger.warning("Running without database - some features will be limited")
        # Don't raise error, allow server to start without database
        _client = None
        _database = None

async def close_database_connection():
    """Close database connection"""
    global _client
    if _client:
        _client.close()
        logger.info("Disconnected from MongoDB")

async def disconnect_from_database():
    """Alias for close_database_connection for compatibility"""
    await close_database_connection()

def get_database():
    """Get database instance"""
    global _database
    if _database is None:
        logger.warning("Database not connected - returning None")
        return None
    return _database

def is_connected():
    """Check if database is connected"""
    global _database
    return _database is not None 