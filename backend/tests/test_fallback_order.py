import pytest
from unittest.mock import AsyncMock, patch
from app.schemas.context import ConversationContext, MessageTurn, PredictedResponse
from app.services.ai.manager import AIManager
from app.services.ai.cache import prediction_cache
from app.services.ai.rate_limiter import session_rate_limiter

@pytest.fixture(autouse=True)
def clean_state():
    prediction_cache.clear()
    session_rate_limiter.reset()

@pytest.mark.asyncio
async def test_safety_override_order():
    manager = AIManager()
    ctx = ConversationContext(
        language="en",
        ageGroup="adult",
        messages=[MessageTurn(speaker="other", text="Call an ambulance, fire emergency!", time=1)]
    )
    result = await manager.generate_responses(ctx, session_id="test_safety")
    assert result.safetyTriggered is True
    assert result.providerUsed == "safety_override"
    assert any(r.sensitive is True for r in result.responses)

@pytest.mark.asyncio
async def test_cache_order():
    manager = AIManager()
    ctx = ConversationContext(
        language="en",
        ageGroup="adult",
        messages=[MessageTurn(speaker="other", text="Good morning, friend.", time=1)]
    )
    
    # Pre-populate cache
    cached_list = [
        PredictedResponse(pictogramKeyword="hello", label="Cached Hello", spokenText="Cached Hello!", intent="greeting")
    ]
    prediction_cache.set(ctx.language, ctx.ageGroup, ctx.messages, cached_list)

    result = await manager.generate_responses(ctx, session_id="test_cache")
    assert result.cached is True
    assert result.providerUsed == "cache"
    assert result.responses[0].label == "Cached Hello"

@pytest.mark.asyncio
async def test_groq_to_gemini_fallback():
    manager = AIManager()
    ctx = ConversationContext(
        language="en",
        ageGroup="adult",
        messages=[MessageTurn(speaker="other", text="What is your favorite color?", time=1)]
    )

    # Mock Groq to fail/return empty
    manager.groq_provider.is_available = AsyncMock(return_value=True)
    manager.groq_provider.predict_responses = AsyncMock(return_value=[])

    # Mock Gemini to succeed
    gemini_responses = [
        PredictedResponse(pictogramKeyword="happy", label="Blue", spokenText="My favorite color is blue.", intent="choose")
    ]
    manager.gemini_provider.is_available = AsyncMock(return_value=True)
    manager.gemini_provider.predict_responses = AsyncMock(return_value=gemini_responses)

    result = await manager.generate_responses(ctx, session_id="test_fallback")
    assert result.providerUsed == "gemini"
    assert result.responses[0].label == "Blue"

@pytest.mark.asyncio
async def test_gemini_to_local_fallback():
    manager = AIManager()
    ctx = ConversationContext(
        language="en",
        ageGroup="adult",
        messages=[MessageTurn(speaker="other", text="Are you hungry?", time=1)]
    )

    # Mock Groq to be unavailable
    manager.groq_provider.is_available = AsyncMock(return_value=False)

    # Mock Gemini to fail/timeout
    manager.gemini_provider.is_available = AsyncMock(return_value=True)
    manager.gemini_provider.predict_responses = AsyncMock(return_value=[])

    result = await manager.generate_responses(ctx, session_id="test_local")
    assert result.providerUsed == "local_fallback"
    assert len(result.responses) >= 3
    # Check that "Something else" is included
    assert any(r.intent == "custom" for r in result.responses)
