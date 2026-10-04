"""
COMMUNIQ Drawing API Endpoints.
Allows the non-speaking user to sketch what they need and obtain immediate AAC symbol matches.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any

from app.services.drawing.canvas_service import drawing_service

router = APIRouter(prefix="/drawing", tags=["drawing"])

class DrawingAnalyzeRequest(BaseModel):
    imageData: str = Field(..., max_length=12000000, description="Base64 encoded sketch image")
    language: str = Field("en", max_length=10, description="Target language code")

class DrawingAnalyzeResponse(BaseModel):
    symbol: str
    label: str
    englishLabel: str
    confidence: float
    provider: str
    message: str

@router.get("/status")
def get_drawing_status() -> Dict[str, Any]:
    return drawing_service.status()

@router.post("/analyze", response_model=DrawingAnalyzeResponse)
async def analyze_drawing_endpoint(payload: DrawingAnalyzeRequest):
    try:
        result = await drawing_service.analyze_drawing(payload.imageData, payload.language)
        return DrawingAnalyzeResponse(**result)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Drawing analysis failed: {str(exc)}")
