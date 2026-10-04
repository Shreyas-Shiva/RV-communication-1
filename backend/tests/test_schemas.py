import pytest
from pydantic import ValidationError
from app.schemas.context import (
    MessageTurn,
    ConversationContext,
    PredictedResponse,
    SentenceGenerationRequest,
    TextImprovementRequest
)

def test_message_turn_valid():
    msg = MessageTurn(speaker="other", text="Hello there!", time=123456789.0)
    assert msg.speaker == "other"
    assert msg.text == "Hello there!"

def test_message_turn_invalid_speaker():
    with pytest.raises(ValidationError):
        MessageTurn(speaker="invalid_speaker", text="Hello", time=0)

def test_message_turn_length_limit():
    long_text = "a" * 1001
    with pytest.raises(ValidationError):
        MessageTurn(speaker="other", text=long_text, time=0)

def test_conversation_context_validation():
    ctx = ConversationContext(
        language="kn-IN",
        ageGroup="class_1_7",
        conversationId="test-convo-1",
        messages=[
            MessageTurn(speaker="other", text="ಹಸಿವಾಗಿದೆಯೇ?", time=100)
        ]
    )
    assert ctx.language == "kn-IN"
    assert ctx.ageGroup == "class_1_7"
    assert len(ctx.messages) == 1

def test_predicted_response_fields():
    resp = PredictedResponse(
        pictogramKeyword="pizza",
        label="Pizza",
        spokenText="I would like some pizza, please.",
        intent="choose",
        sensitive=False
    )
    assert resp.pictogramKeyword == "pizza"
    assert resp.sensitive is False

def test_sentence_generation_request_limits():
    with pytest.raises(ValidationError):
        SentenceGenerationRequest(phrase="", language="en", ageGroup="adult")
