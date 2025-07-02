import base64
import json
import hashlib
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.backends import default_backend
from typing import Any, Dict, Optional
import os
import secrets
from app.config import settings

class ResponseEncryption:
    """Handles encryption and decryption of API responses"""
    
    def __init__(self):
        self.master_key = self._get_master_key()
        
    def _get_master_key(self) -> bytes:
        """Get or generate master encryption key"""
        # In production, this should be stored securely (environment variable, key vault, etc.)
        key_env = os.getenv("ENCRYPTION_MASTER_KEY")
        if key_env:
            return base64.urlsafe_b64decode(key_env.encode())
        
        # For development, generate a consistent key based on secret
        password = settings.SECRET_KEY.encode()
        salt = b"bqitech_api_salt"  # In production, use a random salt stored securely
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        return kdf.derive(password)
    
    def generate_session_key(self, user_id: str, timestamp: str) -> bytes:
        """Generate a session-specific encryption key"""
        # Create unique key per user session
        session_data = f"{user_id}:{timestamp}:{settings.SECRET_KEY}"
        session_hash = hashlib.sha256(session_data.encode()).digest()
        
        # Return first 32 bytes for AES-256
        return session_hash[:32]
    
    def encrypt_response(self, data: Any, user_id: str = None) -> Dict[str, Any]:
        """Encrypt response data"""
        try:
            # Convert data to JSON string
            json_data = json.dumps(data, default=str)
            
            if user_id:
                # Use session-specific encryption
                timestamp = str(int(os.urandom(4).hex(), 16))  # Random timestamp-like value
                cipher = self.generate_session_key(user_id, timestamp)
                encrypted_data = cipher.encrypt(json_data.encode())
                
                return {
                    "encrypted": True,
                    "payload": base64.urlsafe_b64encode(encrypted_data).decode(),
                    "session_id": user_id,
                    "timestamp": timestamp,
                    "algorithm": "AES-256-CBC"
                }
            else:
                # Use master key encryption
                cipher = Fernet(base64.urlsafe_b64encode(self.master_key))
                encrypted_data = cipher.encrypt(json_data.encode())
                
                return {
                    "encrypted": True,
                    "payload": base64.urlsafe_b64encode(encrypted_data).decode(),
                    "algorithm": "AES-256-CBC"
                }
                
        except Exception as e:
            # If encryption fails, return original data with error flag
            return {
                "encrypted": False,
                "payload": data,
                "error": f"Encryption failed: {str(e)}"
            }
    
    def decrypt_response(self, encrypted_data: Dict[str, Any], user_id: str = None) -> Any:
        """Decrypt response data"""
        try:
            if not encrypted_data.get("encrypted", False):
                return encrypted_data.get("payload", encrypted_data)
            
            payload = encrypted_data["payload"]
            encrypted_bytes = base64.urlsafe_b64decode(payload.encode())
            
            if user_id and "timestamp" in encrypted_data:
                # Use session-specific decryption
                timestamp = encrypted_data["timestamp"]
                cipher = self.generate_session_key(user_id, timestamp)
            else:
                # Use master key decryption
                cipher = Fernet(base64.urlsafe_b64encode(self.master_key))
            
            decrypted_data = cipher.decrypt(encrypted_bytes)
            return json.loads(decrypted_data.decode())
            
        except Exception as e:
            raise ValueError(f"Decryption failed: {str(e)}")

# Singleton instance
_encryptor = None

def get_encryptor() -> ResponseEncryption:
    """Get encryption instance"""
    global _encryptor
    if _encryptor is None:
        _encryptor = ResponseEncryption()
    return _encryptor

def encrypt_user_response(data: Any, user_id: str) -> Dict[str, Any]:
    """Encrypt response for specific user"""
    encryptor = get_encryptor()
    return encryptor.encrypt_response(data, user_id)

def encrypt_public_response(data: Any) -> Dict[str, Any]:
    """Encrypt response using master key"""
    encryptor = get_encryptor()
    return encryptor.encrypt_response(data)

def should_encrypt_response() -> bool:
    """Check if responses should be encrypted based on settings"""
    return (
        settings.is_production or 
        os.getenv("ENCRYPT_RESPONSES", "false").lower() == "true"
    ) 