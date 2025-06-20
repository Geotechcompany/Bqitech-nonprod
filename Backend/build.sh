#!/usr/bin/env bash
set -o errexit

# Install Python dependencies
echo "Installing Python dependencies..."
python -m pip install --upgrade pip
pip install wheel setuptools

# Install core dependencies first
echo "Installing core dependencies..."
pip install click h11 websockets

# Install dependencies with binary wheels
echo "Installing dependencies with binary wheels..."
pip install --only-binary=:all: fastapi uvicorn[standard] motor pymongo python-multipart python-dotenv starlette typing-extensions

# Install the rest of the requirements
echo "Installing remaining dependencies..."
pip install -r requirements.txt

echo "Build completed successfully!"
