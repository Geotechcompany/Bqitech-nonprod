import smtplib
import ssl
import random
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from typing import Optional
from app.config import settings
from app.database import get_database
import logging

logger = logging.getLogger(__name__)

def generate_verification_code(length: int = 6) -> str:
    """Generate a random verification code"""
    return ''.join(random.choices(string.digits, k=length))

async def store_verification_code(email: str, code: str, expires_in_minutes: int = 15) -> bool:
    """Store verification code in database with expiration"""
    try:
        db = get_database()
        
        # Calculate expiration time
        expires_at = datetime.utcnow() + timedelta(minutes=expires_in_minutes)
        
        # Store or update verification code
        result = await db.email_verifications.update_one(
            {"email": email},
            {
                "$set": {
                    "code": code,
                    "expires_at": expires_at,
                    "created_at": datetime.utcnow(),
                    "used": False
                }
            },
            upsert=True
        )
        
        return result.acknowledged
    except Exception as e:
        logger.error(f"Error storing verification code: {str(e)}")
        return False

async def verify_code(email: str, code: str) -> bool:
    """Verify the email verification code"""
    try:
        db = get_database()
        
        # Find the verification record
        verification = await db.email_verifications.find_one({
            "email": email,
            "code": code,
            "used": False,
            "expires_at": {"$gt": datetime.utcnow()}
        })
        
        if not verification:
            return False
        
        # Mark as used
        await db.email_verifications.update_one(
            {"_id": verification["_id"]},
            {"$set": {"used": True, "used_at": datetime.utcnow()}}
        )
        
        return True
    except Exception as e:
        logger.error(f"Error verifying code: {str(e)}")
        return False

def send_verification_email(email: str, verification_code: str) -> bool:
    """Send email verification code to user"""
    try:
        # Create message
        message = MIMEMultipart()
        message["From"] = settings.from_email
        message["To"] = email
        message["Subject"] = "Email Verification Code - BQI Tech"
        
        # Email body
        body = f"""
        <html>
        <body>
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <img src="{settings.frontend_url}/bqilogo.png" alt="BQI Tech Logo" style="width: 150px; height: auto; margin: 0;">
                </div>
                
                <h2 style="color: #1f2937;">Email Verification</h2>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
                    Thank you for signing up with BQI Tech! To complete your registration, please use the verification code below:
                </p>
                
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #1f2937; font-size: 32px; letter-spacing: 8px; margin: 0; font-family: monospace;">
                        {verification_code}
                    </h1>
                </div>
                
                <p style="color: #4b5563; font-size: 14px;">
                    This code will expire in 15 minutes. If you didn't request this verification, please ignore this email.
                </p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                        This email was sent by BQI Tech. If you have any questions, please contact us at {settings.hr_email}
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        message.attach(MIMEText(body, "html"))
        
        # Create secure connection and send email
        context = ssl.create_default_context()
        
        with smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port, context=context) as server:
            server.login(settings.smtp_user, settings.smtp_pass)
            text = message.as_string()
            server.sendmail(settings.from_email, email, text)
        
        logger.info(f"Verification email sent successfully to {email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send verification email to {email}: {str(e)}")
        return False

async def send_verification_code(email: str) -> Optional[str]:
    """Generate and send verification code to email"""
    try:
        # Generate verification code
        code = generate_verification_code()
        
        # Store in database
        stored = await store_verification_code(email, code)
        if not stored:
            logger.error("Failed to store verification code")
            return None
        
        # Send email
        sent = send_verification_email(email, code)
        if not sent:
            logger.error("Failed to send verification email")
            return None
        
        return code
        
    except Exception as e:
        logger.error(f"Error in send_verification_code: {str(e)}")
        return None 