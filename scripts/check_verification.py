from pymongo import MongoClient
import os
from datetime import datetime

# MongoDB connection string
MONGODB_URI = "mongodb+srv://Geotechcompany:Locamade12182@cluster0.r8itkxl.mongodb.net/BQITECH?retryWrites=true&w=majority"

def check_and_update_verification():
    try:
        # Connect to MongoDB
        client = MongoClient(MONGODB_URI)
        db = client.BQITECH
        
        # Get user
        user = db.users.find_one({"email": "gaudia@bqitech.com"})
        if not user:
            print("User not found")
            return
        
        # Check verification status
        print("Current verification status:")
        print(f"isEmailVerified: {user.get('isEmailVerified', False)}")
        print(f"is_verified: {user.get('is_verified', False)}")
        print(f"email_verified: {user.get('email_verified', False)}")
        
        # Update to verified if any field is True
        is_verified = any([
            user.get('isEmailVerified', False),
            user.get('is_verified', False),
            user.get('email_verified', False)
        ])
        
        if is_verified:
            # Update all verification fields to True
            result = db.users.update_one(
                {"email": "gaudia@bqitech.com"},
                {
                    "$set": {
                        "isEmailVerified": True,
                        "is_verified": True,
                        "email_verified": True,
                        "verifiedAt": datetime.utcnow()
                    }
                }
            )
            print("\nUpdated verification status:")
            print(f"Modified {result.modified_count} document(s)")
        else:
            print("\nNo verification fields are True")
        
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    check_and_update_verification() 