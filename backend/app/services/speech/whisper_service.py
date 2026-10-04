import httpx
import logging
from typing import Optional
from app.config.settings import settings

logger = logging.getLogger("communiq.speech.whisper")

class WhisperService:
    def __init__(self):
        self.api_key = settings.groq_api_key
        self.endpoint = "https://api.groq.com/openai/v1/audio/transcriptions"
        self.model = "whisper-large-v3-turbo"

    async def transcribe_audio(self, audio_bytes: bytes, filename: str = "audio.webm", language: Optional[str] = None) -> str:
        if not self.api_key:
            logger.warning("Whisper service requested but GROQ_API_KEY is not configured.")
            return ""

        headers = {
            "Authorization": f"Bearer {self.api_key}"
        }

        data = {
            "model": self.model
        }
        if language:
            # Map 'en-IN' to 'en', 'kn-IN' to 'kn', 'hi-IN' to 'hi'
            short_lang = language.split("-")[0].lower()
            data["language"] = short_lang

        files = {
            "file": (filename, audio_bytes, "audio/webm")
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(self.endpoint, headers=headers, data=data, files=files)
                if res.status_code == 200:
                    result = res.json()
                    return result.get("text", "").strip()
                else:
                    logger.warning(f"Whisper transcription failed with HTTP {res.status_code}.")
                    return ""
        except Exception as e:
            logger.warning(f"Whisper service network error ({type(e).__name__}).")
            return ""

whisper_service = WhisperService()
