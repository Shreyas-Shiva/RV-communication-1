"""
Speech service scaffold.
Note: Speech is performed directly on the client device using Web Speech API for offline reliability.
This server service provides supplemental phonetic and voice metadata when connected.
"""
from typing import Dict, Any

class TTSService:
    def get_supported_locales(self) -> Dict[str, str]:
        return {
            "en": "en-IN",
            "kn": "kn-IN",
            "hi": "hi-IN",
            "ta": "ta-IN",
            "te": "te-IN",
            "ml": "ml-IN"
        }

    def status(self) -> Dict[str, Any]:
        return {
            "service": "tts",
            "client_engine": "Web Speech API (en-IN, kn-IN, hi-IN)",
            "server_fallback": "Scaffold ready for offline TTS sync"
        }

tts_service = TTSService()
