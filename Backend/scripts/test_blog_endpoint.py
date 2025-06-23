import os
import sys
import asyncio
import aiohttp
import json

# Add Backend directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import connect_to_database, get_database
from app.config import settings

async def test_blog_endpoint():
    """Test the blog endpoint"""
    # First ensure database connection
    await connect_to_database()
    db = get_database()
    
    # Print collections in database
    collections = await db.list_collection_names()
    print("\nCollections in database:", collections)
    
    # Test endpoint
    base_url = "http://127.0.0.1:10000/api"
    endpoint = "/blog/posts"
    params = {
        "limit": 9,
        "skip": 0
    }
    
    print(f"\nTesting blog endpoint: {base_url}{endpoint}")
    print(f"Parameters: {params}")
    print("-" * 80)
    
    async with aiohttp.ClientSession() as session:
        async with session.get(f"{base_url}{endpoint}", params=params) as response:
            print(f"Status Code: {response.status}")
            print(f"Headers: {dict(response.headers)}\n")
            
            if response.status == 200:
                data = await response.json()
                print("Response Data Structure:")
                print(f"Available keys: {list(data.keys())}\n")
                print(f"Total posts: {data.get('total', 0)}")
                print(f"Posts returned: {len(data.get('posts', []))}\n")
                
                if data.get('posts'):
                    print("First post details:")
                    first_post = data['posts'][0]
                    print(json.dumps(first_post, indent=2))
            else:
                print(f"Error: {await response.text()}")

if __name__ == "__main__":
    asyncio.run(test_blog_endpoint()) 