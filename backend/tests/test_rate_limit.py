from app.services.ai.rate_limiter import SessionRateLimiter

def test_rate_limiter_allows_under_limit():
    limiter = SessionRateLimiter(max_requests_per_minute=5)
    session = "test_user_session_1"
    
    for _ in range(5):
        allowed, retry_after = limiter.is_allowed(session)
        assert allowed is True
        assert retry_after == 0

def test_rate_limiter_blocks_over_limit():
    limiter = SessionRateLimiter(max_requests_per_minute=3)
    session = "test_user_session_2"

    for _ in range(3):
        assert limiter.is_allowed(session)[0] is True

    # 4th request in the same minute should be rejected
    allowed, retry_after = limiter.is_allowed(session)
    assert allowed is False
    assert retry_after > 0

def test_rate_limiter_session_isolation():
    limiter = SessionRateLimiter(max_requests_per_minute=2)
    s1 = "session_a"
    s2 = "session_b"

    assert limiter.is_allowed(s1)[0] is True
    assert limiter.is_allowed(s1)[0] is True
    assert limiter.is_allowed(s1)[0] is False

    # s2 is completely independent
    assert limiter.is_allowed(s2)[0] is True
