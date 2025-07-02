from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Request
from fastapi.responses import JSONResponse
from app.auth import get_current_user
from app.database import get_database
import logging
import os
from datetime import datetime
import uuid
from typing import Optional
import dropbox
from dropbox.exceptions import ApiError, AuthError
from dropbox.files import WriteMode
from ..lib.dropbox import get_dropbox_access_token
import io
from bson import ObjectId

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)  # Set to DEBUG for more detailed logs

router = APIRouter(tags=["upload"])

# Configure upload settings
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", 10485760))  # 10MB default
# Hardcode allowed extensions to include images
ALLOWED_EXTENSIONS = {"pdf", "doc", "docx", "jpg", "jpeg", "png", "gif", "webp"}
ALLOWED_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp"}

# Debug logging
logger.info(f"Hardcoded ALLOWED_EXTENSIONS: {ALLOWED_EXTENSIONS}")
logger.info(f"Hardcoded ALLOWED_IMAGE_EXTENSIONS: {ALLOWED_IMAGE_EXTENSIONS}")
logger.info(f"MAX_FILE_SIZE: {MAX_FILE_SIZE} bytes ({MAX_FILE_SIZE/1024/1024}MB)")

def get_file_extension(filename: str) -> str:
    return os.path.splitext(filename)[1].lower().lstrip(".")

async def get_dropbox_client():
    try:
        access_token = await get_dropbox_access_token()
        logger.debug(f"Got Dropbox access token: {access_token[:10]}...")
        return dropbox.Dropbox(access_token)
    except Exception as e:
        logger.error(f"Failed to get Dropbox client: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to initialize storage client")

@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload user avatar image"""
    try:
        # Validate file extension
        file_ext = get_file_extension(file.filename)
        if file_ext not in ALLOWED_IMAGE_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"
            )

        # Read file content
        contents = await file.read()
        file_size = len(contents)

        # Validate file size (limit to 5MB for avatars)
        if file_size > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="Avatar file size must be less than 5MB"
            )

        # Generate unique filename
        unique_filename = f"avatar_{current_user['_id']}_{uuid.uuid4()}.{file_ext}"
        dropbox_path = f"/avatars/{unique_filename}"

        # Upload to Dropbox
        dbx = await get_dropbox_client()
        try:
            # Upload file
            logger.debug(f"Uploading avatar to Dropbox: {dropbox_path}")
            upload_result = dbx.files_upload(
                contents,
                dropbox_path,
                mode=WriteMode('overwrite')
            )
            logger.debug(f"Avatar uploaded successfully: {upload_result.path_display}")

            # Create a shared link
            shared_link = dbx.sharing_create_shared_link_with_settings(
                dropbox_path,
                settings=dropbox.sharing.SharedLinkSettings(
                    requested_visibility=dropbox.sharing.RequestedVisibility.public
                )
            )
            
            # Convert to direct download URL
            avatar_url = shared_link.url.replace('www.dropbox.com', 'dl.dropboxusercontent.com')
            
            # Update user's avatar URL in database
            db = get_database()
            await db.users.update_one(
                {"_id": ObjectId(current_user["_id"])},
                {
                    "$set": {
                        "avatar": avatar_url,
                        "updatedAt": datetime.utcnow()
                    }
                }
            )

            return {
                "url": avatar_url,
                "message": "Avatar updated successfully"
            }

        except ApiError as e:
            logger.error(f"Dropbox API error: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to upload avatar")
        except Exception as e:
            logger.error(f"Dropbox upload error: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to upload avatar")

    except HTTPException as e:
        raise
    except Exception as e:
        logger.error(f"Avatar upload error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process avatar upload")

@router.post("/")
async def upload_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    try:
        # Validate file extension
        file_ext = get_file_extension(file.filename)
        if file_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
            )

        # Read file content
        contents = await file.read()
        file_size = len(contents)

        # Validate file size
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds maximum allowed size of {MAX_FILE_SIZE/1024/1024}MB"
            )

        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}.{file_ext}"
        dropbox_path = f"/uploads/{unique_filename}"

        # Upload to Dropbox
        dbx = await get_dropbox_client()
        try:
            # Upload file
            logger.debug(f"Uploading file to Dropbox: {dropbox_path}")
            upload_result = dbx.files_upload(
                contents,
                dropbox_path,
                mode=WriteMode('overwrite')
            )
            logger.debug(f"File uploaded successfully: {upload_result.path_display}")

            try:
                # Create a shared link with direct download
                logger.debug("Creating shared link...")
                shared_link = dbx.sharing_create_shared_link_with_settings(
                    dropbox_path,
                    settings=dropbox.sharing.SharedLinkSettings(
                        requested_visibility=dropbox.sharing.RequestedVisibility.public
                    )
                )
                # Convert to direct download URL
                download_url = shared_link.url.replace('www.dropbox.com', 'dl.dropboxusercontent.com')
                logger.debug(f"Created shared link: {download_url}")

                return {
                    "url": download_url,
                    "fileName": file.filename,
                    "fileSize": file_size
                }
            except ApiError as e:
                if e.error.is_shared_link_already_exists():
                    # If link already exists, get existing link
                    shared_links = dbx.sharing_list_shared_links(dropbox_path).links
                    if shared_links:
                        download_url = shared_links[0].url.replace('www.dropbox.com', 'dl.dropboxusercontent.com')
                        return {
                            "url": download_url,
                            "fileName": file.filename,
                            "fileSize": file_size
                        }
                raise

        except ApiError as e:
            logger.error(f"Dropbox API error: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to upload file to storage")
        except Exception as e:
            logger.error(f"Dropbox upload error: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to upload file to storage")

    except HTTPException as e:
        raise
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process file upload")

@router.options("/", include_in_schema=False)
async def options_upload(request: Request):
    """Handle CORS preflight requests"""
    return JSONResponse(
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Max-Age": "3600",
        }
    ) 