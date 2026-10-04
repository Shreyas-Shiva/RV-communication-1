from fastapi import APIRouter
from app.schemas.context import ServiceStatusResponse
from app.services.ai.manager import ai_manager

router = APIRouter(prefix="/status", tags=["System Status"])

@router.get("", response_model=ServiceStatusResponse)
async def get_system_status():
    """
    Returns live health and configuration status for each AI and speech service.
    """
    status_data = await ai_manager.get_service_status()
    return ServiceStatusResponse(**status_data)
