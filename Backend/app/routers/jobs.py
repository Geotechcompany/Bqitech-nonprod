from fastapi import APIRouter

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.get("/")
async def get_jobs():
    return {"message": "Jobs endpoint"} 