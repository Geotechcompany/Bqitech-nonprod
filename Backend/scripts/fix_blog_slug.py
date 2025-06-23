import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import settings
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

async def fix_slug():
    # Get MongoDB URI from settings
    mongodb_uri = settings.MONGODB_URI
    print(f"Connecting to MongoDB...")
    client = AsyncIOMotorClient(mongodb_uri)
    db = client["BQITECH"]
    
    # Update the blog post with the correct slug
    result = await db.blogposts.update_one(
        {"_id": ObjectId("68416f98c88dbc1ab6f6dd56")},
        {"$set": {"slug": "the-future-of-custom-software-development-a-cto-s-perspective"}}
    )
    
    print(f"Modified {result.modified_count} document(s)")
    
    # Verify the update
    post = await db.blogposts.find_one({"_id": ObjectId("68416f98c88dbc1ab6f6dd56")})
    if post:
        print("\nUpdated post details:")
        print(f"Title: {post.get('title')}")
        print(f"Slug: {post.get('slug')}")
    else:
        print("Post not found!")

if __name__ == "__main__":
    asyncio.run(fix_slug()) 