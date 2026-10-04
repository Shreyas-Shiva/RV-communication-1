from fastapi import APIRouter
from app.database.mongodb import db_manager
from app.config.settings import settings

router = APIRouter(tags=["health"])

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.app_version,
        "database_connected": db_manager.is_connected(),
        "offline_first": True
    }
