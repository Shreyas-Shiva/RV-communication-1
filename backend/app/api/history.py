from typing import List, Dict, Any
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/history", tags=["History and Spoken Log"])

class ActivityLogEntry(BaseModel):
    timestamp: float
    dateKey: str
    phrase: str = Field(..., max_length=500)
    language: str
    category: str
    speaker: str = "user"
    userMode: str = "adult"
    isFavorite: bool = False

_HISTORY_ENTRIES: List[ActivityLogEntry] = []

@router.get("", response_model=List[ActivityLogEntry])
async def list_history():
    return _HISTORY_ENTRIES

@router.post("", response_model=ActivityLogEntry)
async def append_history(entry: ActivityLogEntry):
    _HISTORY_ENTRIES.append(entry)
    return entry
