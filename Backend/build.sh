#!/usr/bin/env bash
set -o errexit

# Install Python dependencies
echo "Installing Python dependencies..."
python -m pip install --upgrade pip
pip install wheel setuptools

# Install base dependencies that other packages depend on
echo "Installing base dependencies..."
pip install --only-binary=:all: cffi typing-extensions click h11 websockets

# Install cryptography and its dependencies
echo "Installing cryptography..."
pip install --only-binary=:all: cryptography PyJWT

# Install pydantic and configuration management
echo "Installing pydantic and configuration..."
pip install --only-binary=:all: pydantic==2.5.3 python-decouple==3.8 pydantic-core==2.14.6

# Install FastAPI and its dependencies
echo "Installing FastAPI and dependencies..."
pip install --only-binary=:all: fastapi==0.109.0 starlette==0.27.0 uvicorn[standard]==0.24.0

# Install database dependencies
echo "Installing database dependencies..."
pip install --only-binary=:all: motor==3.3.2 pymongo==4.6.1

# Install remaining dependencies
echo "Installing remaining dependencies..."
pip install --only-binary=:all: \
    python-jose[cryptography]==3.3.0 \
    passlib[bcrypt]==1.7.4 \
    python-multipart==0.0.6 \
    bcrypt==4.1.2 \
    python-dotenv==1.0.0 \
    email-validator==2.1.0 \
    httpx==0.25.2 \
    python-dateutil==2.8.2

echo "Build completed successfully!"
