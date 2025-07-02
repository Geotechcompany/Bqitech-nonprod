import base64
import json
import hashlib
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.backends import default_backend
from typing import Any, Dict, Optional
import os
from app.config import settings

class ResponseEncryption:
    """Handles encryption and decryption of API responses using AES-GCM"""
    
    def __init__(self):
        self.master_key = self._get_master_key()
        
    def _get_master_key(self) -> bytes:
        """Get or generate master encryption key"""
        key_env = os.getenv("ENCRYPTION_MASTER_KEY")
        if key_env:
            return base64.urlsafe_b64decode(key_env.encode())
        
        # For development, generate a consistent key based on secret
        password = settings.SECRET_KEY.encode()
        salt = b"bqitech_api_salt"
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        return kdf.derive(password)
    
    def generate_session_key(self, user_id: str, timestamp: str) -> bytes:
        """Generate a session-specific encryption key"""
        session_data = f"{user_id}:{timestamp}:{settings.SECRET_KEY}"
        session_hash = hashlib.sha256(session_data.encode()).digest()
        return session_hash[:32]
    
    def encrypt_response(self, data: Any, user_id: str = None) -> Dict[str, Any]:
        """Encrypt response data using AES-GCM"""
        try:
            json_data = json.dumps(data, default=str).encode('utf-8')
            
            if user_id:
                timestamp = str(int(os.urandom(4).hex(), 16))
                key = self.generate_session_key(user_id, timestamp)
                iv = os.urandom(12)
                
                cipher = Cipher(algorithms.AES(key), modes.GCM(iv), backend=default_backend())
                encryptor = cipher.encryptor()
                ciphertext = encryptor.update(json_data) + encryptor.finalize()
                encrypted_data = iv + ciphertext + encryptor.tag
                
                return {
                    "encrypted": True,
                    "payload": base64.urlsafe_b64encode(encrypted_data).decode(),
                    "session_id": user_id,
                    "timestamp": timestamp,
                    "algorithm": "AES-256-GCM"
                }
            else:
                key = self.master_key[:32]
                iv = os.urandom(12)
                
                cipher = Cipher(algorithms.AES(key), modes.GCM(iv), backend=default_backend())
                encryptor = cipher.encryptor()
                ciphertext = encryptor.update(json_data) + encryptor.finalize()
                encrypted_data = iv + ciphertext + encryptor.tag
                
                return {
                    "encrypted": True,
                    "payload": base64.urlsafe_b64encode(encrypted_data).decode(),
                    "algorithm": "AES-256-GCM"
                }
                
        except Exception as e:
            return {
                "encrypted": False,
                "payload": data,
                "error": f"Encryption failed: {str(e)}"
            }
    
    def decrypt_response(self, encrypted_data: Dict[str, Any], user_id: str = None) -> Any:
        """Decrypt response data using AES-GCM"""
        try:
            if not encrypted_data.get("encrypted", False):
                return encrypted_data.get("payload", encrypted_data)
            
            payload = encrypted_data["payload"]
            encrypted_bytes = base64.urlsafe_b64decode(payload.encode())
            
            if user_id and "timestamp" in encrypted_data:
                timestamp = encrypted_data["timestamp"]
                key = self.generate_session_key(user_id, timestamp)
            else:
                key = self.master_key[:32]
            
            iv = encrypted_bytes[:12]
            tag = encrypted_bytes[-16:]
            ciphertext = encrypted_bytes[12:-16]
            
            cipher = Cipher(algorithms.AES(key), modes.GCM(iv, tag), backend=default_backend())
            decryptor = cipher.decryptor()
            decrypted_data = decryptor.update(ciphertext) + decryptor.finalize()
            
            return json.loads(decrypted_data.decode('utf-8'))
            
        except Exception as e:
            raise ValueError(f"Decryption failed: {str(e)}")

# Singleton instance
_encryptor = None

def get_encryptor() -> ResponseEncryption:
    global _encryptor
    if _encryptor is None:
        _encryptor = ResponseEncryption()
    return _encryptor

def encrypt_user_response(data: Any, user_id: str) -> Dict[str, Any]:
    encryptor = get_encryptor()
    return encryptor.encrypt_response(data, user_id)

def encrypt_public_response(data: Any) -> Dict[str, Any]:
    encryptor = get_encryptor()
    return encryptor.encrypt_response(data)

def should_encrypt_response() -> bool:
    return (
        settings.encrypt_responses or 
        os.getenv("ENCRYPT_RESPONSES", "false").lower() == "true"
    ) 