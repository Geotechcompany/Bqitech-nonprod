import base64
import json
import gzip
from typing import Any, Dict
from app.config import settings

class ResponseObfuscator:
    """Utility class for obfuscating API responses"""
    
    @staticmethod
    def encode_data(data: Any) -> Dict[str, Any]:
        """Encode data based on configuration"""
        if not settings.obfuscate_responses:
            return data
            
        if settings.response_encoding == "base64":
            return ResponseObfuscator._base64_encode(data)
        elif settings.response_encoding == "gzip":
            return ResponseObfuscator._gzip_encode(data)
        else:
            return data
    
    @staticmethod
    def _base64_encode(data: Any) -> Dict[str, Any]:
        """Encode data using base64"""
        try:
            json_str = json.dumps(data)
            encoded = base64.b64encode(json_str.encode()).decode()
            return {
                "payload": encoded,
                "encoding": "base64",
                "type": "json"
            }
        except Exception:
            return data
    
    @staticmethod
    def _gzip_encode(data: Any) -> Dict[str, Any]:
        """Encode data using gzip compression + base64"""
        try:
            json_str = json.dumps(data)
            compressed = gzip.compress(json_str.encode())
            encoded = base64.b64encode(compressed).decode()
            return {
                "payload": encoded,
                "encoding": "gzip+base64",
                "type": "json"
            }
        except Exception:
            return data
    
    @staticmethod
    def filter_sensitive_fields(data: Dict[str, Any], sensitive_fields: list = None) -> Dict[str, Any]:
        """Remove or mask sensitive fields from response data"""
        if sensitive_fields is None:
            sensitive_fields = [
                'password', 'token', 'secret', 'key', 'private',
                'ssn', 'social_security', 'credit_card', 'bank_account',
                'phone', 'address', 'location'  # Add more as needed
            ]
        
        filtered_data = data.copy()
        
        for field in sensitive_fields:
            if field in filtered_data:
                if field in ['phone', 'address', 'location']:
                    # Mask instead of removing
                    filtered_data[field] = "*" * len(str(filtered_data[field]))
                else:
                    # Remove completely
                    filtered_data.pop(field, None)
        
        return filtered_data
    
    @staticmethod
    def create_minimal_response(data: Dict[str, Any], allowed_fields: list) -> Dict[str, Any]:
        """Return only allowed fields from response data"""
        return {field: data.get(field) for field in allowed_fields if field in data}


# Convenience functions
def obfuscate_user_profile(profile_data: Dict[str, Any]) -> Dict[str, Any]:
    """Obfuscate user profile data"""
    # Only return essential fields
    essential_fields = [
        'id', 'email', 'name', 'firstName', 'lastName', 
        'role', 'avatar', 'isEmailVerified', 'createdAt'
    ]
    
    minimal_data = ResponseObfuscator.create_minimal_response(profile_data, essential_fields)
    return ResponseObfuscator.encode_data(minimal_data)

def obfuscate_admin_data(admin_data: Dict[str, Any]) -> Dict[str, Any]:
    """Obfuscate admin-specific data"""
    # Filter sensitive fields for admin responses
    filtered_data = ResponseObfuscator.filter_sensitive_fields(admin_data)
    return ResponseObfuscator.encode_data(filtered_data) 