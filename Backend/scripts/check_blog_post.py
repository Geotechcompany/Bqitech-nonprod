import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import settings
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import json
from datetime import datetime

async def check_posts():
    # Get MongoDB URI from settings
    mongodb_uri = settings.MONGODB_URI
    print(f"Connecting to MongoDB...")
    client = AsyncIOMotorClient(mongodb_uri)
    db = client["BQITECH"]
    
    # Get all blog posts
    cursor = db.blogposts.find({})
    posts = await cursor.to_list(length=100)
    
    print(f"\nFound {len(posts)} blog posts:")
    for post in posts:
        print("\nPost Details:")
        print(f"Title: {post.get('title', 'No title')}")
        print(f"Slug: {post.get('slug', 'No slug')}")
        print(f"ID: {post.get('_id')}")
        print(f"Author: {post.get('author', {}).get('name', 'Unknown')}")
        print(f"Category: {post.get('category', 'Uncategorized')}")
        print(f"Created At: {post.get('createdAt', 'Unknown')}")
        print(f"Updated At: {post.get('updatedAt', 'Unknown')}")
        print(f"Published: isPublished={post.get('isPublished')} or published={post.get('published')}")
        print(f"Excerpt: {post.get('excerpt', 'No excerpt')[:100]}...")
        print(f"Content Length: {len(post.get('content', ''))}")
        print(f"Tags: {', '.join(post.get('tags', []))}")
        print(f"Image URL: {post.get('imageUrl', 'No image')}")
        print(f"Read Time: {post.get('readTime', 'Unknown')}")
        print("-" * 80)
        
        # Also print raw document for debugging
        print("\nRaw document:")
        print(json.dumps(
            {k: str(v) if isinstance(v, (ObjectId, datetime)) else v 
             for k, v in post.items()},
            indent=2
        ))
        print("-" * 80)

if __name__ == "__main__":
    asyncio.run(check_posts()) 