from fastapi import APIRouter
from app.services.speech.tts_service import tts_service
from app.services.sign.sign_service import sign_service
from app.services.drawing.canvas_service import drawing_service
from app.services.ai.assistant import ai_assistant_service

router = APIRouter(tags=["services"])

@router.get("/services/status")
async def get_services_status():
    return {
        "speech": tts_service.status(),
        "sign": sign_service.status(),
        "drawing": drawing_service.status(),
        "ai": ai_assistant_service.status()
    }
