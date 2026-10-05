from fastapi import APIRouter
from app.api.health import router as health_router
from app.api.sync import router as sync_router
from app.api.phrases import router as phrases_router
from app.api.ai import router as ai_router
from app.api.speech import router as speech_router
from app.api.conversations import router as conversations_router
from app.api.user import router as user_router
from app.api.history import router as history_router
from app.api.status import router as status_router
from app.api.drawing import router as drawing_router
from app.api.sign import router as sign_router
from app.api.chat import router as chat_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(sync_router)
api_router.include_router(phrases_router)
api_router.include_router(ai_router)
api_router.include_router(chat_router)
api_router.include_router(speech_router)
api_router.include_router(conversations_router)
api_router.include_router(user_router)
api_router.include_router(history_router)
api_router.include_router(status_router)
api_router.include_router(drawing_router)
api_router.include_router(sign_router)
