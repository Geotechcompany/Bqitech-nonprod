from fastapi import APIRouter

router = APIRouter(prefix="/contact", tags=["contact"])

@router.post("/")
async def submit_contact():
    return {"message": "Contact form endpoint"} 