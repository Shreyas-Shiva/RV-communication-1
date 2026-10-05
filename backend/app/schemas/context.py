from typing import List, Optional, Union, Dict, Any, Literal
from pydantic import BaseModel, Field

class MessageTurn(BaseModel):
    speaker: Literal['other', 'user']
    text: str = Field(..., max_length=1000)
    time: Union[str, float, int]

class ConversationContext(BaseModel):
    language: str = Field(default="en-IN", max_length=16)
    ageGroup: Literal['class_1_7', 'class_8_12', 'adult'] = "adult"
    conversationId: str = Field(default="default", max_length=128)
    messages: List[MessageTurn] = Field(default_factory=list, max_length=100)
    currentTopic: Optional[str] = Field(default=None, max_length=128)
    userPreferences: Optional[Dict[str, Any]] = None
    selectedResponses: Optional[List[str]] = Field(default=None, max_length=50)
    favorites: Optional[List[str]] = Field(default=None, max_length=50)
    recentPhrases: Optional[List[str]] = Field(default=None, max_length=50)
    todaysActivity: Optional[List[Dict[str, Any]]] = Field(default=None, max_length=100)

class PredictedResponse(BaseModel):
    pictogramKeyword: str = Field(..., max_length=64)
    label: str = Field(..., max_length=128)
    spokenText: str = Field(..., max_length=256)
    intent: str = Field(..., max_length=64)
    sensitive: bool = False

class PredictionResult(BaseModel):
    responses: List[PredictedResponse]
    providerUsed: str
    cached: bool = False
    safetyTriggered: bool = False
    debug: Optional[Dict[str, Any]] = None

class SentenceGenerationRequest(BaseModel):
    phrase: str = Field(..., min_length=1, max_length=300)
    language: str = Field(default="en-IN", max_length=16)
    ageGroup: Literal['class_1_7', 'class_8_12', 'adult'] = "adult"

class SentenceGenerationResponse(BaseModel):
    naturalSentence: str
    providerUsed: str

class TextImprovementRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=500)
    language: str = Field(default="en-IN", max_length=16)
    ageGroup: Literal['class_1_7', 'class_8_12', 'adult'] = "adult"

class TextImprovementResponse(BaseModel):
    original: str
    improved: str
    providerUsed: str

class TranslationRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=1000)
    sourceLanguage: str = Field(default="en", max_length=16)
    targetLanguage: str = Field(..., max_length=16)

class TranslationResponse(BaseModel):
    original: str
    translatedText: str
    providerUsed: str

class ServiceStatusResponse(BaseModel):
    groq: Literal['working', 'not_configured', 'rate_limited']
    gemini: Literal['working', 'not_configured', 'rate_limited']
    localFallback: Literal['working'] = "working"
    speechRecognition: Literal['working'] = "working"
    whisper: Literal['working', 'not_configured'] = "not_configured"
    activeProvider: str

class SentenceOptionItem(BaseModel):
    text: str = Field(..., max_length=300)
    intent: Optional[str] = None
    tone: Optional[str] = None
    grammarChecked: bool = True
    providerUsed: str = "local"

class SentenceOptionsRequest(BaseModel):
    item: Optional[str] = None
    tray: Optional[List[str]] = None
    language: str = Field(default="en-IN", max_length=16)
    ageGroup: str = Field(default="adult", max_length=32)
    tone: str = Field(default="polite", max_length=32)
    wording: str = Field(default="neutral", max_length=32)
    conversationContext: Optional[ConversationContext] = None

class SentenceOptionsResponse(BaseModel):
    options: List[SentenceOptionItem]
    providerUsed: str
    cached: bool = False

class ContinueOptionItem(BaseModel):
    text: str = Field(..., max_length=300)
    kind: Literal['detail', 'follow_up', 'close', 'repair']
    grammarChecked: bool = True
    providerUsed: str = "local"

class ContinueConversationRequest(BaseModel):
    lastSentence: str = Field(..., max_length=500)
    language: str = Field(default="en-IN", max_length=16)
    ageGroup: str = Field(default="adult", max_length=32)
    tone: str = Field(default="polite", max_length=32)
    wording: str = Field(default="neutral", max_length=32)
    scenario: Optional[str] = None
    conversationContext: Optional[ConversationContext] = None

class ContinueConversationResponse(BaseModel):
    options: List[ContinueOptionItem]
    repairOptions: List[ContinueOptionItem]
    providerUsed: str
    cached: bool = False
