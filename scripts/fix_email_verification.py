from pymongo import MongoClient
from datetime import datetime
import os

# MongoDB connection string
MONGODB_URI = "mongodb+srv://Geotechcompany:Locamade12182@cluster0.r8itkxl.mongodb.net/BQITECH?retryWrites=true&w=majority"

def fix_email_verification():
    try:
        # Connect to MongoDB
        client = MongoClient(MONGODB_URI)
        db = client.BQITECH
        
        # Update user's email verification status
        result = db.users.update_one(
            {"email": "gaudia@bqitech.com"},
            {
                "$set": {
                    "isEmailVerified": True,
                    "verifiedAt": datetime.utcnow()
                }
            }
        )
        
        print(f"Modified {result.modified_count} documents")
        
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        client.close()

if __name__ == "__main__":
    fix_email_verification() 