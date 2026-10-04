from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form
from app.services.speech.whisper_service import whisper_service

router = APIRouter(prefix="/speech", tags=["Speech Services"])

@router.post("/transcribe")
async def transcribe_speech(
    file: UploadFile = File(...),
    language: Optional[str] = Form(default=None)
):
    """
    Optional server-side speech transcription using Whisper.
    Falls back gracefully if Whisper credentials are not active.
    """
    audio_content = await file.read()
    transcription = await whisper_service.transcribe_audio(
        audio_bytes=audio_content,
        filename=file.filename or "audio.webm",
        language=language
    )
    return {
        "text": transcription,
        "success": bool(transcription)
    }
