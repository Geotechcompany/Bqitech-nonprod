import requests
import json

BASE_URL = "http://localhost:8000"

def test_endpoint(method, path, data=None):
    """Test an endpoint with CORS preflight and actual request"""
    url = f"{BASE_URL}{path}"
    
    # Test OPTIONS (CORS preflight)
    options_response = requests.options(url, headers={
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": method.upper(),
        "Access-Control-Request-Headers": "Content-Type, Authorization, Accept, X-User-Session"
    })
    print(f"\nOPTIONS {path}:")
    print(f"Status: {options_response.status_code}")
    print(f"Headers: {options_response.headers}")
    
    # Test actual request
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-User-Session": json.dumps({
            "id": "test_user_id",
            "email": "admin@example.com",
            "role": "ADMIN"
        })
    }
    
    if method.lower() == "get":
        response = requests.get(url, headers=headers)
    elif method.lower() == "post":
        response = requests.post(url, json=data, headers=headers)
    elif method.lower() == "put":
        response = requests.put(url, json=data, headers=headers)
    elif method.lower() == "delete":
        response = requests.delete(url, headers=headers)
    
    print(f"\n{method.upper()} {path}:")
    print(f"Status: {response.status_code}")
    if response.status_code != 200:
        print(f"Response: {response.text}")
    
    return response.status_code == 200

def main():
    # Test basic endpoints
    test_endpoint("GET", "/api/applications")
    test_endpoint("GET", "/api/jobs")
    test_endpoint("GET", "/api/notifications")
    
    # Test admin endpoints
    test_endpoint("GET", "/api/admin/overview")
    test_endpoint("GET", "/api/admin/applications?limit=10")
    test_endpoint("GET", "/api/admin/trends?days=30")
    test_endpoint("GET", "/api/admin/applications-by-job")

if __name__ == "__main__":
    main() 