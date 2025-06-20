#!/bin/bash
set -e

echo "Upgrading pip..."
pip install --upgrade pip

echo "Installing dependencies with binary-only flag..."
pip install --only-binary=all --no-deps fastapi uvicorn[standard] motor pymongo python-multipart python-dotenv

echo "Installing remaining dependencies..."
pip install python-jose[cryptography] passlib[bcrypt] pydantic pydantic-settings bcrypt

echo "Build completed successfully!" 