"""
AI Assistant Service Scaffold.
Rule: The person is the center, AI is only an assistant.
Communication must never depend on AI or internet.
Picture cards, speech, and the daily log work offline.
"""
from typing import Dict, Any, List

class AssistantService:
    def __init__(self) -> None:
        self.is_configured = False

    def suggest_next_intents(self, item_label: str, language: str) -> List[str]:
        # Rule: Fallbacks must remain deterministic and never speak on their own.
        return ["want", "like", "need", "more", "done"]

    def status(self) -> Dict[str, Any]:
        return {
            "service": "ai_assistant",
            "active": False,
            "offline_mode_ready": True,
            "note": "Offline rule active: core communication runs independently on device without cloud AI."
        }

ai_assistant_service = AssistantService()
