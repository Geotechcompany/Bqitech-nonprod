import asyncio
from datetime import datetime
import os
import sys
import dns.resolver
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# Load environment variables
load_dotenv()

async def create_test_post():
    # Configure DNS resolver
    dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
    dns.resolver.default_resolver.nameservers = ['8.8.8.8', '8.8.4.4']  # Google DNS
    
    # Get database URL from environment
    database_url = os.getenv("MONGODB_URI")
    if not database_url:
        print("Error: MONGODB_URI environment variable not set")
        return
        
    print(f"Connecting to database: {database_url[:30]}...")
    
    try:
        # Connect with proper timeout settings
        client = AsyncIOMotorClient(
            database_url,
            serverSelectionTimeoutMS=30000,
            connectTimeoutMS=30000,
            socketTimeoutMS=30000,
            waitQueueTimeoutMS=30000,
            retryWrites=True,
            w="majority"
        )
        
        db = client.BQITECH
        
        # Test connection
        await client.admin.command('ping')
        print("Connected to database successfully")
        
        test_post = {
            "title": "Test Blog Post",
            "content": "This is a test blog post content.",
            "excerpt": "This is a test blog post.",
            "status": "published",
            "author": {"name": "Test Author"},
            "category": "Test",
            "tags": ["test"],
            "imageUrl": "",
            "readTime": "1 min",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
            "publishedAt": datetime.utcnow()
        }
        
        result = await db.blogposts.insert_one(test_post)
        print(f"Test post created with ID: {result.inserted_id}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    asyncio.run(create_test_post()) 