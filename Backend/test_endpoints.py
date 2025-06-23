import requests
import json

BASE_URL = "http://localhost:10000/api"

def test_login():
    print("\nTesting login endpoint...")
    response = requests.post(
        f"{BASE_URL}/auth/login",
        data={
            "username": "admin@bqitech.com",
            "password": "admin123"
        },
        headers={
            "Content-Type": "application/x-www-form-urlencoded"
        }
    )
    print(f"Status code: {response.status_code}")
    print("Response:", json.dumps(response.json(), indent=2))
    return response.json()

def test_refresh(refresh_token):
    print("\nTesting refresh token endpoint...")
    response = requests.post(
        f"{BASE_URL}/auth/refresh",
        json={
            "refresh_token": refresh_token
        }
    )
    print(f"Status code: {response.status_code}")
    print("Response:", json.dumps(response.json(), indent=2))
    return response.json()

if __name__ == "__main__":
    # Test login
    login_data = test_login()
    
    if "refresh_token" in login_data:
        # Test refresh token
        test_refresh(login_data["refresh_token"]) 