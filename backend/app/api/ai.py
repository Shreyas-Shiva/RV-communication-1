import json
import asyncio
from fastapi import APIRouter, Request, Header
from fastapi.responses import StreamingResponse
from app.schemas.context import (
    ConversationContext,
    PredictionResult,
    SentenceGenerationRequest,
    SentenceGenerationResponse,
    TextImprovementRequest,
    TextImprovementResponse,
    TranslationRequest,
    TranslationResponse,
    SentenceOptionsRequest,
    SentenceOptionsResponse,
    ContinueConversationRequest,
    ContinueConversationResponse
)
from app.services.ai.manager import ai_manager

router = APIRouter(prefix="/ai", tags=["AI Engine"])

@router.post("/predict-responses", response_model=PredictionResult)
async def predict_responses(
    context: ConversationContext,
    request: Request,
    x_session_id: str = Header(default="anonymous")
):
    """
    Predicts 3 to 6 contextually relevant AAC responses based on conversation history.
    Order: Safety check -> Cache -> Groq -> Gemini -> Local Fallback.
    """
    client_ip = request.client.host if request.client else "unknown"
    session_id = f"{client_ip}:{x_session_id}"
    return await ai_manager.generate_responses(context, session_id=session_id)

@router.post("/generate-sentence", response_model=SentenceGenerationResponse)
async def generate_sentence(req: SentenceGenerationRequest):
    """
    Expands an AAC phrase into a natural, respectful sentence.
    """
    sentence = await ai_manager.generate_natural_sentence(req.phrase, req.language, req.ageGroup)
    return SentenceGenerationResponse(naturalSentence=sentence, providerUsed="ai_service")

@router.post("/improve-text", response_model=TextImprovementResponse)
async def improve_text(req: TextImprovementRequest):
    """
    Improves a shorthand user typed fragment into a complete communicative thought.
    """
    improved = await ai_manager.improve_text(req.text, req.language, req.ageGroup)
    return TextImprovementResponse(original=req.text, improved=improved, providerUsed="ai_service")

@router.post("/translate", response_model=TranslationResponse)
async def translate_text(req: TranslationRequest):
    """
    Translates text between supported regional languages.
    """
    translated = await ai_manager.translate(req.text, req.sourceLanguage, req.targetLanguage)
    return TranslationResponse(original=req.text, translatedText=translated, providerUsed="ai_service")

@router.post("/conversation")
async def conversation_stream(
    context: ConversationContext,
    request: Request,
    x_session_id: str = Header(default="anonymous")
):
    """
    SSE streaming endpoint for progressive option delivery.
    """
    client_ip = request.client.host if request.client else "unknown"
    session_id = f"{client_ip}:{x_session_id}"

    async def event_generator():
        # First send acknowledge
        yield f"event: ping\ndata: {json.dumps({'status': 'processing'})}\n\n"
        await asyncio.sleep(0.05)
        
        result = await ai_manager.generate_responses(context, session_id=session_id)
        
        # Stream response items
        yield f"event: predictions\ndata: {result.model_dump_json()}\n\n"
        yield f"event: done\ndata: {json.dumps({'complete': True})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.post("/sentence-options", response_model=SentenceOptionsResponse)
async def sentence_options(req: SentenceOptionsRequest):
    """
    Returns validated complete grammatical sentence choices for an item or tray.
    """
    res = await ai_manager.get_sentence_options(
        item=req.item,
        tray=req.tray,
        language=req.language,
        age_group=req.ageGroup,
        tone=req.tone,
        wording=req.wording
    )
    return SentenceOptionsResponse(**res)

@router.post("/continue", response_model=ContinueConversationResponse)
async def continue_conversation(req: ContinueConversationRequest):
    """
    Returns contextual conversation continuation options: details, polite closings, and 1-tap repair lines.
    """
    res = await ai_manager.get_continue_options(
        last_sentence=req.lastSentence,
        language=req.language,
        age_group=req.ageGroup,
        tone=req.tone,
        wording=req.wording,
        scenario=req.scenario
    )
    return ContinueConversationResponse(**res)
