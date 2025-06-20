from fastapi import APIRouter

router = APIRouter(prefix="/blog", tags=["blog"])

@router.get("/")
async def get_blog_posts():
    return {"message": "Blog posts endpoint"} 