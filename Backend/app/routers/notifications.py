from fastapi import APIRouter

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("/")
async def get_notifications():
    return {"message": "Notifications endpoint"} 