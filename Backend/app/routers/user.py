from fastapi import APIRouter

router = APIRouter(prefix="/user", tags=["user"])

@router.get("/profile")
async def get_user_profile():
    return {"message": "User profile endpoint"} 