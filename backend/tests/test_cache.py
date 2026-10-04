import time
from app.schemas.context import MessageTurn, PredictedResponse
from app.services.ai.cache import PredictionCache

def test_cache_hit_and_miss():
    cache = PredictionCache(ttl_seconds=60)
    messages = [
        MessageTurn(speaker="other", text="Hi", time=1),
        MessageTurn(speaker="user", text="Hello", time=2),
        MessageTurn(speaker="other", text="How are you?", time=3)
    ]
    
    assert cache.get("en", "adult", messages) is None

    responses = [
        PredictedResponse(pictogramKeyword="happy", label="Good", spokenText="I am good.", intent="state")
    ]
    cache.set("en", "adult", messages, responses)

    cached = cache.get("en", "adult", messages)
    assert cached is not None
    assert cached[0].label == "Good"

def test_cache_last_three_messages_keying():
    cache = PredictionCache(ttl_seconds=60)
    msg1 = [
        MessageTurn(speaker="other", text="Older message 1", time=1),
        MessageTurn(speaker="other", text="Turn 1", time=2),
        MessageTurn(speaker="user", text="Turn 2", time=3),
        MessageTurn(speaker="other", text="Turn 3", time=4)
    ]
    msg2 = [
        MessageTurn(speaker="other", text="Completely different older message", time=0),
        MessageTurn(speaker="other", text="Turn 1", time=2),
        MessageTurn(speaker="user", text="Turn 2", time=3),
        MessageTurn(speaker="other", text="Turn 3", time=4)
    ]

    responses = [PredictedResponse(pictogramKeyword="yes", label="Yes", spokenText="Yes", intent="affirm")]
    cache.set("en", "adult", msg1, responses)

    # msg2 has the identical last 3 messages, so it should hit the cache!
    hit = cache.get("en", "adult", msg2)
    assert hit is not None
    assert hit[0].label == "Yes"

def test_cache_expiration():
    cache = PredictionCache(ttl_seconds=1)
    messages = [MessageTurn(speaker="other", text="Hi", time=1)]
    responses = [PredictedResponse(pictogramKeyword="yes", label="Yes", spokenText="Yes", intent="affirm")]

    cache.set("en", "adult", messages, responses)
    assert cache.get("en", "adult", messages) is not None

    time.sleep(1.1)
    assert cache.get("en", "adult", messages) is None
