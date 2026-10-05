from typing import List, Optional, Literal
from pydantic import BaseModel, Field

class ChatTurn(BaseModel):
    speaker: Literal['other', 'user']
    text: str = Field(..., max_length=500)
    time: Optional[float] = None
    pictogramKeyword: Optional[str] = None

class ChatRepliesRequest(BaseModel):
    language: str = Field(default="en", max_length=16)
    ageGroup: Literal['child', 'student', 'adult'] = "adult"
    tone: Literal['short', 'polite', 'casual'] = "polite"
    wording: Literal['neutral', 'masculine', 'feminine'] = "neutral"
    role: Optional[str] = Field(default="Someone else", max_length=64)
    turns: List[ChatTurn] = Field(default_factory=list, max_length=8)
    hints: Optional[List[str]] = Field(default=None, max_length=10)

class ChatReplyItem(BaseModel):
    id: str = Field(..., max_length=64)
    text: str = Field(..., max_length=300)
    pictogramKeyword: str = Field(..., max_length=64)
    intent: str = Field(..., max_length=64)
    sensitive: bool = False
    source: Literal['pack', 'lexicon', 'ai', 'rule'] = "pack"
    grammarChecked: bool = True

class ChatRepliesResponse(BaseModel):
    questionClass: str
    replies: List[ChatReplyItem]
    provider: str

class ChatStartersRequest(BaseModel):
    language: str = Field(default="en", max_length=16)
    ageGroup: Literal['child', 'student', 'adult'] = "adult"
    role: Optional[str] = Field(default="Someone else", max_length=64)

class ChatStartersResponse(BaseModel):
    starters: List[ChatReplyItem]
