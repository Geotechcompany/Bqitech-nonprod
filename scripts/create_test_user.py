from pymongo import MongoClient
from datetime import datetime
import bcrypt

# MongoDB connection string
MONGODB_URI = "mongodb+srv://Geotechcompany:Locamade12182@cluster0.r8itkxl.mongodb.net/BQITECH?retryWrites=true&w=majority"

def create_test_user():
    try:
        # Connect to MongoDB
        client = MongoClient(MONGODB_URI)
        db = client.BQITECH
        
        # Check if user already exists
        existing_user = db.users.find_one({"email": "test@bqitech.com"})
        if existing_user:
            print("Test user already exists")
            return
        
        # Hash password
        password = "test@bqitech.com"
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
        
        # Create user document
        user_data = {
            "email": "test@bqitech.com",
            "name": "Test User",
            "password": hashed_password,
            "role": "USER",
            "is_active": True,
            "isEmailVerified": True,
            "is_verified": True,
            "email_verified": True,
            "verifiedAt": datetime.utcnow(),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        # Insert user into database
        result = db.users.insert_one(user_data)
        
        print("Test user created successfully")
        print(f"User ID: {result.inserted_id}")
        
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    create_test_user() 