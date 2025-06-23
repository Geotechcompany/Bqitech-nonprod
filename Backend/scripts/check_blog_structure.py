import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import settings
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import json
from datetime import datetime

async def check_blog_structure():
    # Get MongoDB URI from settings
    mongodb_uri = settings.MONGODB_URI
    print(f"Connecting to MongoDB...")
    client = AsyncIOMotorClient(mongodb_uri)
    db = client["BQITECH"]
    
    # Get the specific blog post
    post = await db.blogposts.find_one({"_id": ObjectId("68416f98c88dbc1ab6f6dd56")})
    
    if post:
        print("Blog Post Structure:")
        print("=" * 80)
        
        # Print each field and its type
        for key, value in post.items():
            print(f"{key}: {type(value).__name__} = {repr(value)}")
        
        print("\n" + "=" * 80)
        print("JSON Representation:")
        print(json.dumps(
            {k: str(v) if isinstance(v, (ObjectId, datetime)) else v 
             for k, v in post.items()},
            indent=2
        ))
        
        # Check publication status specifically
        print("\n" + "=" * 80)
        print("Publication Status Check:")
        print(f"isPublished: {post.get('isPublished')} (type: {type(post.get('isPublished'))})")
        print(f"published: {post.get('published')} (type: {type(post.get('published'))})")
        
        # Test the query condition
        query_condition = {
            "$or": [
                {"isPublished": True},
                {"published": True}
            ]
        }
        
        test_post = await db.blogposts.find_one({
            "_id": ObjectId("68416f98c88dbc1ab6f6dd56"),
            **query_condition
        })
        
        print(f"Query with publication filter returns: {'Found' if test_post else 'Not Found'}")
        
    else:
        print("Blog post not found!")

if __name__ == "__main__":
    asyncio.run(check_blog_structure()) 