import os
import sys
import asyncio
import json
from bson import json_util

# Add Backend directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import connect_to_database, get_database

async def check_posts():
    """Check blog posts in the database"""
    await connect_to_database()
    db = get_database()
    
    # Get all posts
    posts = await db.blogposts.find().to_list(length=100)
    
    # Convert to JSON-serializable format
    posts_json = json.loads(json_util.dumps(posts))
    
    print("\nBlog posts in database:")
    print(json.dumps(posts_json, indent=2))

if __name__ == "__main__":
    asyncio.run(check_posts()) 