#!/usr/bin/env python3

import asyncio
import sys
import os

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.lib.email import send_verification_email, generate_verification_code
from app.config import settings

async def test_email():
    """Test email sending functionality"""
    print("Testing email configuration...")
    print(f"SMTP Host: {settings.smtp_host}")
    print(f"SMTP Port: {settings.smtp_port}")
    print(f"From Email: {settings.from_email}")
    print(f"SMTP User: {settings.smtp_user}")
    print(f"SMTP Password: {'*' * len(settings.smtp_pass) if settings.smtp_pass else '(empty)'}")
    print()
    
    if not all([settings.smtp_host, settings.smtp_port, settings.smtp_user, settings.smtp_pass, settings.from_email]):
        print("❌ Email configuration is incomplete!")
        print("Please check your .env file for SMTP settings.")
        return False
    
    # Generate test verification code
    test_code = generate_verification_code()
    test_email = "gaudia@bqitech.com"  # Use your email for testing
    
    print(f"Sending test verification email to {test_email}...")
    print(f"Test verification code: {test_code}")
    
    try:
        result = send_verification_email(test_email, test_code)
        if result:
            print("✅ Email sent successfully!")
            return True
        else:
            print("❌ Failed to send email")
            return False
    except Exception as e:
        print(f"❌ Error sending email: {str(e)}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_email())
    if success:
        print("\n🎉 Email functionality is working!")
    else:
        print("\n💔 Email functionality needs fixing.") 