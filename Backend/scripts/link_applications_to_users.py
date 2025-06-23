import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import logging
import sys
import os
import json
from datetime import datetime

# Add the parent directory to sys.path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import settings
from app.database import connect_to_database, get_database, close_database_connection, is_connected

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MongoJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (datetime, ObjectId)):
            return str(obj)
        return super().default(obj)

def format_document(doc):
    """Format a MongoDB document for logging"""
    if isinstance(doc, dict):
        formatted = {}
        for k, v in doc.items():
            if isinstance(v, (ObjectId, datetime)):
                formatted[k] = str(v)
            elif isinstance(v, (list, dict)):
                formatted[k] = format_document(v)
            else:
                formatted[k] = v
        return formatted
    elif isinstance(doc, list):
        return [format_document(item) for item in doc]
    return doc

async def analyze_application_structure():
    """Analyze the structure of applications in the database"""
    try:
        db = get_database()
        if not is_connected():
            raise Exception("Database connection not established")
            
        # Get one application of each format
        old_format = await db.applications.find_one({"email": {"$exists": True}})
        new_format = await db.applications.find_one({"answers": {"$exists": True}})
        
        if old_format:
            logger.info("Example of old format application:")
            logger.info(json.dumps(format_document(old_format), indent=2, cls=MongoJSONEncoder))
            
        if new_format:
            logger.info("\nExample of new format application:")
            logger.info(json.dumps(format_document(new_format), indent=2, cls=MongoJSONEncoder))
            
        # Count applications of each format
        old_format_count = await db.applications.count_documents({"email": {"$exists": True}})
        new_format_count = await db.applications.count_documents({"answers": {"$exists": True}})
        
        logger.info(f"\nApplication format distribution:")
        logger.info(f"- Old format (with email): {old_format_count}")
        logger.info(f"- New format (with answers): {new_format_count}")
            
    except Exception as e:
        logger.error(f"Error analyzing application structure: {str(e)}")
        raise

async def link_applications_to_users():
    """
    Links existing applications to users based on email matching.
    For applications where no matching user is found, it will log the application ID.
    """
    try:
        db = get_database()
        if not is_connected():
            raise Exception("Database connection not established")
            
        # Get all applications that don't have a userId
        unlinked_applications = await db.applications.find(
            {"userId": {"$exists": False}}
        ).to_list(length=None)
        
        logger.info(f"Found {len(unlinked_applications)} unlinked applications")
        
        linked_count = 0
        unmatched_count = 0
        
        for application in unlinked_applications:
            email = None
            
            # Try to get email from different possible locations
            if "email" in application:
                # Old format
                email = application["email"]
            elif "answers" in application and isinstance(application["answers"], list):
                # New format - try to find email in answers
                for answer in application["answers"]:
                    if isinstance(answer, dict):
                        # Check both old and new answer formats
                        if "questionText" in answer and answer["questionText"].lower() == "email":
                            email = answer.get("answer")
                            break
                        elif "value" in answer and isinstance(answer["value"], str) and "@" in answer["value"] and "." in answer["value"]:
                            email = answer["value"]
                            break
            
            if email:
                # Clean up the email
                email = email.strip().lower()
                user = await db.users.find_one({"email": email})
                
                if user:
                    # Update the application with the user's ID
                    await db.applications.update_one(
                        {"_id": application["_id"]},
                        {"$set": {"userId": str(user["_id"])}}
                    )
                    linked_count += 1
                    logger.info(f"Linked application {application['_id']} to user {user['_id']} (email: {email})")
                else:
                    unmatched_count += 1
                    logger.warning(f"No user found for application {application['_id']} with email {email}")
            else:
                unmatched_count += 1
                logger.warning(f"Could not find email in application {application['_id']}")
                # Log the application structure for debugging
                logger.debug(f"Application structure: {json.dumps(format_document(application), indent=2, cls=MongoJSONEncoder)}")
        
        logger.info(f"Migration completed:")
        logger.info(f"- Successfully linked: {linked_count} applications")
        logger.info(f"- Unmatched applications: {unmatched_count}")
        
    except Exception as e:
        logger.error(f"Error during migration: {str(e)}")
        raise

async def verify_links():
    """
    Verifies that all applications have a userId field.
    """
    try:
        db = get_database()
        if not is_connected():
            raise Exception("Database connection not established")
            
        total_applications = await db.applications.count_documents({})
        unlinked_applications = await db.applications.count_documents({"userId": {"$exists": False}})
        
        if total_applications == 0:
            logger.info("No applications found in the database")
            return
            
        logger.info(f"Verification results:")
        logger.info(f"- Total applications: {total_applications}")
        logger.info(f"- Applications without userId: {unlinked_applications}")
        logger.info(f"- Linking coverage: {((total_applications - unlinked_applications) / total_applications) * 100:.2f}%")
        
    except Exception as e:
        logger.error(f"Error during verification: {str(e)}")
        raise

async def main():
    try:
        logger.info("Starting application-user linking migration...")
        logger.info(f"Using database URL: {settings.DATABASE_URL}")
        
        # Connect to database
        logger.info("Connecting to database...")
        await connect_to_database()
        
        if not is_connected():
            raise Exception("Failed to establish database connection")
        
        # First analyze the application structure
        await analyze_application_structure()
        
        await link_applications_to_users()
        logger.info("Running verification...")
        await verify_links()
        
    finally:
        # Always close the database connection
        await close_database_connection()
        
    logger.info("Migration completed!")

if __name__ == "__main__":
    asyncio.run(main()) 