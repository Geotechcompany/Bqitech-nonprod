from pymongo import MongoClient
import json
from bson import ObjectId
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return super().default(obj)

def main():
    # Get MongoDB URI from environment
    mongodb_uri = os.getenv("MONGODB_URI")
    if not mongodb_uri:
        print("Error: MONGODB_URI not found in environment variables")
        return
    
    print(f"Connecting to MongoDB...")
    
    try:
        # Connect to MongoDB
        client = MongoClient(mongodb_uri)
        db = client.get_default_database()
        
        # Get all applications
        applications = list(db.applications.find({}))
        print(f"\nTotal applications found: {len(applications)}")
        
        # Check user ID formats
        user_id_formats = {}
        for app in applications:
            user_id = app.get('userId')
            if user_id:
                format_type = type(user_id).__name__
                if format_type not in user_id_formats:
                    user_id_formats[format_type] = []
                user_id_formats[format_type].append(user_id)
        
        print("\nUser ID formats found:")
        for format_type, examples in user_id_formats.items():
            print(f"\n{format_type}:")
            print(f"Example values: {examples[:3]}")
            print(f"Count: {len(examples)}")
        
        # Check applications without user IDs
        no_user_id = [app for app in applications if 'userId' not in app]
        print(f"\nApplications without userId: {len(no_user_id)}")
        if no_user_id:
            print("Sample application without userId:")
            print(json.dumps(no_user_id[0], cls=JSONEncoder, indent=2))
            
        # Check applications for specific user
        user_id = "685336dd512600b88db41afa"  # Admin user ID from login response
        user_apps = list(db.applications.find({"userId": user_id}))
        print(f"\nApplications for user {user_id}: {len(user_apps)}")
        if user_apps:
            print("Sample user application:")
            print(json.dumps(user_apps[0], cls=JSONEncoder, indent=2))
            
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    main() 