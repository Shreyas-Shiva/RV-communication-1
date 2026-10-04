from typing import Dict, Any
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/user", tags=["User Preferences"])

class UserPreferencesPayload(BaseModel):
    id: str = "current"
    language: str = "en"
    userMode: str = "adult"
    speechRate: float = 1.0
    speechPitch: float = 1.0
    voiceURI: str = ""
    textSize: str = "normal"
    buttonSize: str = "normal"
    highContrast: bool = False
    darkMode: bool = False
    reducedMotion: bool = False
    soundEffects: bool = True
    largeAndSimple: bool = False
    parentConsentGiven: bool = True
    enableAI: bool = False
    enableGemini: bool = False

_CURRENT_PREFERENCES = UserPreferencesPayload()

@router.get("/preferences", response_model=UserPreferencesPayload)
async def get_preferences():
    return _CURRENT_PREFERENCES

@router.post("/preferences", response_model=UserPreferencesPayload)
async def update_preferences(prefs: UserPreferencesPayload):
    global _CURRENT_PREFERENCES
    _CURRENT_PREFERENCES = prefs
    return _CURRENT_PREFERENCES
