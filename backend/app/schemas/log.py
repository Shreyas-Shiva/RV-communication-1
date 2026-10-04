from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class LogEntryBase(BaseModel):
    client_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    language: str = "en"
    category: str = "general"
    speaker: str = "user"
    phrase: str
    picture_id: Optional[str] = None
    intent: Optional[str] = None
    user_mode: str = "adult"
    is_favorite: bool = False

class LogEntryCreate(LogEntryBase):
    pass

class LogEntryResponse(LogEntryBase):
    id: Optional[str] = None
