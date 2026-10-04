"""
COMMUNIQ Sign Language Recognition API Endpoints.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any

from app.services.sign.sign_service import sign_service

router = APIRouter(prefix="/sign", tags=["sign"])

class SignAnalyzeRequest(BaseModel):
    data: str = Field(..., max_length=15000000, description="Base64 encoded image frame or video clip")
    language: str = Field("en", max_length=10, description="Target language code")

class SignAnalyzeResponse(BaseModel):
    sign: str
    label: str
    englishLabel: str
    confidence: float
    provider: str
    message: str

@router.get("/status")
def get_sign_status() -> Dict[str, Any]:
    return sign_service.status()

@router.post("/analyze-image", response_model=SignAnalyzeResponse)
async def analyze_image_endpoint(payload: SignAnalyzeRequest):
    try:
        result = await sign_service.analyze_image(payload.data, payload.language)
        return SignAnalyzeResponse(**result)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Sign analysis error: {str(exc)}")

@router.post("/analyze-video", response_model=SignAnalyzeResponse)
async def analyze_video_endpoint(payload: SignAnalyzeRequest):
    try:
        result = await sign_service.analyze_video(payload.data, payload.language)
        return SignAnalyzeResponse(**result)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Sign video analysis error: {str(exc)}")
