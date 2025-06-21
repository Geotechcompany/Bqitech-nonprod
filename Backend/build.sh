#!/usr/bin/env bash
set -o errexit

# Print Python and environment information
echo "Python version:"
python --version
echo "Virtual environment location:"
echo $VIRTUAL_ENV
echo "Python location:"
which python

# Install Python dependencies
echo "Installing Python dependencies..."
python -m pip install --upgrade pip setuptools wheel

# Install base dependencies
echo "Installing base dependencies..."
python -m pip install cffi typing-extensions click==8.1.7 h11==0.14.0 websockets==11.0.3

# Install cryptography and its dependencies
echo "Installing cryptography..."
python -m pip install cryptography==41.0.7 PyJWT==2.8.0

# Install pydantic and configuration management
echo "Installing pydantic and configuration..."
python -m pip install pydantic==1.10.13 python-decouple==3.8

# Install FastAPI and its dependencies
echo "Installing FastAPI and dependencies..."
python -m pip install fastapi==0.99.1 starlette==0.27.0

# Install uvicorn and its dependencies
echo "Installing uvicorn..."
python -m pip install --no-cache-dir uvicorn==0.24.0 click==8.1.7 h11==0.14.0
python -m pip install --no-cache-dir uvicorn[standard]==0.24.0

# Install database dependencies
echo "Installing database dependencies..."
python -m pip install motor==3.3.2 pymongo==4.6.1

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

# Try importing uvicorn to verify installation
echo "Testing uvicorn import..."
python -c "import uvicorn; print(f'Uvicorn version: {uvicorn.__version__}')"

echo "Build completed successfully!"
