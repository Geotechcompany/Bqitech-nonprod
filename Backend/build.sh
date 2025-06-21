#!/usr/bin/env bash
set -o errexit

# Create and activate virtual environment
echo "Setting up virtual environment..."
python -m venv .venv
source .venv/bin/activate

# Verify we're in the virtual environment
echo "Python location: $(which python)"
echo "Pip location: $(which pip)"

# Install Python dependencies
echo "Installing Python dependencies..."
python -m pip install --upgrade pip
python -m pip install wheel setuptools

# Install base dependencies that other packages depend on
echo "Installing base dependencies..."
python -m pip install cffi typing-extensions click h11 websockets

# Install cryptography and its dependencies
echo "Installing cryptography..."
python -m pip install cryptography PyJWT

# Install pydantic and configuration management
echo "Installing pydantic and configuration..."
python -m pip install "pydantic>=1.10.0,<2.0.0" python-decouple==3.8

# Install FastAPI and its dependencies
echo "Installing FastAPI and dependencies..."
python -m pip install "fastapi>=0.95.0,<0.100.0" "starlette>=0.26.0,<0.28.0"

# Install uvicorn separately to ensure it's properly installed
echo "Installing uvicorn..."
python -m pip install uvicorn[standard]

# Install database dependencies
echo "Installing database dependencies..."
python -m pip install motor==3.3.2 "pymongo>=4.3.3,<5.0.0"

# Install remaining dependencies
echo "Installing remaining dependencies..."
python -m pip install \
    python-jose[cryptography]==3.3.0 \
    passlib[bcrypt]==1.7.4 \
    python-multipart==0.0.6 \
    bcrypt==4.1.2 \
    python-dotenv==1.0.0 \
    email-validator==2.1.0 \
    httpx==0.25.2 \
    python-dateutil==2.8.2

# List all installed packages
echo "Installed packages:"
python -m pip list

# Verify uvicorn installation
echo "Verifying uvicorn installation..."
python -m pip show uvicorn

echo "Build completed successfully!"
