#!/usr/bin/env bash
set -o errexit

# Install Python dependencies
echo "Installing Python dependencies..."
python -m pip install --upgrade pip
pip install wheel setuptools

# Install dependencies with binary wheels first
echo "Installing dependencies with binary wheels..."
pip install --only-binary=:all: --no-deps fastapi uvicorn[standard] motor pymongo python-multipart python-dotenv starlette typing-extensions

# Install the rest of the requirements
echo "Installing remaining dependencies..."
pip install -r requirements.txt --no-deps

echo "Installing additional dependencies..."
pip install python-jose[cryptography] passlib[bcrypt] email-validator httpx

echo "Build completed successfully!" 