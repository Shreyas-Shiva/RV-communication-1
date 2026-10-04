from abc import ABC, abstractmethod
from typing import List
from app.schemas.context import ConversationContext, PredictedResponse

class AIProvider(ABC):
    """
    Abstract base class for all COMMUNIQ AI Providers.
    All providers must implement response prediction, sentence naturalization,
    text improvement, and translation without raising unhandled network exceptions.
    """
    
    @property
    @abstractmethod
    def name(self) -> str:
        """Name of the provider, e.g. 'groq', 'gemini', 'local_fallback'."""
        pass

    @abstractmethod
    async def is_available(self) -> bool:
        """Checks if the provider has necessary configuration and API credentials."""
        pass

    @abstractmethod
    async def predict_responses(self, context: ConversationContext) -> List[PredictedResponse]:
        """
        Generates 3 to 6 contextually relevant response options matching
        the user age mode, language, and conversation turn history.
        """
        pass

    @abstractmethod
    async def generate_natural_sentence(self, phrase: str, language: str, age_group: str) -> str:
        """Expands a shorthand or card label into a natural, respectful sentence."""
        pass

    @abstractmethod
    async def improve_text(self, text: str, language: str, age_group: str) -> str:
        """Polishes a user-typed fragment into a complete, clear communicative thought."""
        pass

    @abstractmethod
    async def translate(self, text: str, source_language: str, target_language: str) -> str:
        """Translates text between supported regional languages."""
        pass
