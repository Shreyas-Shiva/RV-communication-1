from typing import List, Dict, Any
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/conversations", tags=["Conversations"])

class ConversationRecord(BaseModel):
    id: str = Field(..., max_length=128)
    title: str = Field(default="Conversation", max_length=256)
    timestamp: float
    language: str = Field(default="en-IN", max_length=16)
    messagesCount: int = 0
    turns: List[Dict[str, Any]] = Field(default_factory=list)

# In-memory storage for local offline-first backend sessions
_CONVERSATIONS: Dict[str, ConversationRecord] = {}

@router.get("", response_model=List[ConversationRecord])
async def list_conversations():
    """
    Lists saved conversation threads.
    """
    return list(_CONVERSATIONS.values())

@router.post("", response_model=ConversationRecord)
async def save_conversation(record: ConversationRecord):
    """
    Saves or updates a conversation thread.
    """
    _CONVERSATIONS[record.id] = record
    return record
