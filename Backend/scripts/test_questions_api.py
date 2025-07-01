import requests
import json
from datetime import datetime, timedelta
import jwt
from bson import ObjectId
from typing import Any
import logging
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os
import sys

# Add the parent directory to sys.path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.config import settings

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

BASE_URL = "http://localhost:10000/api"
SECRET_KEY = "your-secret-key-change-in-production"  # This matches the default in config.py
ALGORITHM = "HS256"

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema: Any, handler: Any) -> dict[str, Any]:
        json_schema = handler(core_schema)
        json_schema.update(type="string")
        return json_schema

def get_admin_token():
    # Login with admin credentials
    login_data = {
        "username": "admin@bqitech.com",
        "password": "admin123"
    }
    
    response = requests.post(
        f"{BASE_URL}/auth/login",
        data=login_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    if response.status_code != 200:
        logger.error(f"Login failed: {response.status_code}")
        logger.error(response.json())
        return None
        
    return response.json().get("access_token")

def get_test_headers():
    # Get admin token
    token = get_admin_token()
    if not token:
        raise Exception("Failed to get admin token")
    
    # Create admin user session
    admin_user = {
        "email": "admin@bqitech.com",
        "name": "Admin User",
        "role": "ADMIN",
        "isAdmin": True
    }
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
        "X-User-Session": json.dumps(admin_user)
    }
    
    return headers

def is_valid_object_id(id_str: str) -> bool:
    """Validate if a string is a valid MongoDB ObjectId"""
    if not isinstance(id_str, str):
        return False
    try:
        ObjectId(id_str)
        return True
    except:
        return False

async def verify_question_in_db(question_id: str):
    """Verify if a question exists directly in MongoDB"""
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(settings.MONGODB_URI)
        db = client.get_default_database()
        
        # Try to find the question
        question = await db.jobquestions.find_one({"_id": ObjectId(question_id)})
        
        if question:
            logger.info(f"Found question in DB: {question}")
            return True
        else:
            logger.error(f"Question {question_id} not found in database")
            return False
    except Exception as e:
        logger.error(f"Error checking question in database: {str(e)}")
        return False
    finally:
        client.close()

async def test_questions_api():
    # Get headers with admin session
    headers = get_test_headers()

    # Get all questions first
    logger.info("\nGetting all questions...")
    response = requests.get(
        f"{BASE_URL}/admin/questions",
        headers=headers
    )
    logger.info(f"Get Response: {response.status_code}")
    
    if response.status_code != 200:
        logger.error("Failed to get questions")
        logger.error(response.text)
        return
        
    questions = response.json().get("questions", [])
    logger.debug("Questions: %s", json.dumps(questions, indent=2))
    
    if len(questions) >= 2:
        # Get the first two question IDs and validate them
        question_ids = [q["id"] for q in questions[:2]]
        
        logger.info("\nValidating question IDs:")
        for idx, qid in enumerate(question_ids):
            logger.info(f"Question {idx + 1} ID: {qid}")
            logger.info(f"Is valid ObjectId: {is_valid_object_id(qid)}")
            
            # Verify question exists in database
            exists = await verify_question_in_db(qid)
            logger.info(f"Question exists in DB: {exists}")
            
            if not is_valid_object_id(qid):
                logger.error(f"Invalid ObjectId format for question {idx + 1}: {qid}")
                return
        
        # Test reordering questions
        logger.info("\nReordering questions...")
        reorder_data = {
            "updates": [
                {"id": question_ids[0], "order": 1},
                {"id": question_ids[1], "order": 0}
            ]
        }
        logger.info(f"Reorder payload: {json.dumps(reorder_data, indent=2)}")
        
        # Log the full request details
        logger.debug("Request URL: %s", f"{BASE_URL}/admin/questions/reorder-questions")
        logger.debug("Request Headers: %s", json.dumps(headers, indent=2))
        logger.debug("Request Body: %s", json.dumps(reorder_data, indent=2))
        
        response = requests.put(
            f"{BASE_URL}/admin/questions/reorder-questions",
            headers=headers,
            json=reorder_data
        )
        
        logger.info(f"Reorder Response Status: {response.status_code}")
        logger.info(f"Reorder Response Headers: {dict(response.headers)}")
        logger.info(f"Reorder Response Body: {response.text}")
        
        # If reorder failed, try to get the question details to verify they exist
        if response.status_code != 200:
            logger.info("\nVerifying questions exist:")
            for qid in question_ids:
                verify_response = requests.get(
                    f"{BASE_URL}/admin/questions/{qid}",
                    headers=headers
                )
                logger.info(f"Question {qid} exists: {verify_response.status_code == 200}")
                if verify_response.status_code != 200:
                    logger.error(f"Failed to get question {qid}: {verify_response.text}")
                    
                # Also verify in database
                exists = await verify_question_in_db(qid)
                logger.info(f"Question {qid} exists in DB: {exists}")

if __name__ == "__main__":
    asyncio.run(test_questions_api()) 