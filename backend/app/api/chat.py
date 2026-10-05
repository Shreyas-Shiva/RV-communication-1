from fastapi import APIRouter
from app.schemas.chat import (
    ChatRepliesRequest,
    ChatRepliesResponse,
    ChatStartersRequest,
    ChatStartersResponse
)
from app.services.chat_engine import chat_engine

router = APIRouter(prefix="/chat", tags=["Chat Engine"])

@router.post("/replies", response_model=ChatRepliesResponse)
async def get_chat_replies(req: ChatRepliesRequest):
    """
    Returns 4 to 5 grammatical, context-aware reply options for a conversation turn.
    Audits for safety, avoids repeating recent replies, and validates against known defects.
    """
    return chat_engine.generate_chat_replies(
        turns=req.turns,
        language=req.language,
        age_group=req.ageGroup,
        tone=req.tone,
        wording=req.wording,
        role=req.role,
        hints=req.hints
    )

@router.post("/starters", response_model=ChatStartersResponse)
async def get_chat_starters(req: ChatStartersRequest):
    """
    Returns natural conversation starters / greetings for the active role and mode.
    """
    return chat_engine.get_starters(
        language=req.language,
        age_group=req.ageGroup,
        role=req.role
    )
