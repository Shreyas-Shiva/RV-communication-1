import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "COMMUNIQ API"

def test_api_status():
    response = client.get("/api/status")
    assert response.status_code == 200
    data = response.json()
    assert "groq" in data
    assert "gemini" in data
    assert "localFallback" in data
    assert data["localFallback"] == "working"
    assert "activeProvider" in data

def test_predict_responses_endpoint():
    payload = {
        "language": "en-IN",
        "ageGroup": "adult",
        "conversationId": "convo-test",
        "messages": [
            {"speaker": "other", "text": "Hi! Are you hungry?", "time": 100}
        ]
    }
    response = client.post("/api/ai/predict-responses", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "responses" in data
    assert len(data["responses"]) >= 3
    assert any("hungry" in r["spokenText"].lower() for r in data["responses"])
    # Check that "Something else" is included
    assert any(r["intent"] == "custom" for r in data["responses"])

def test_generate_sentence_endpoint():
    payload = {
        "phrase": "water",
        "language": "en",
        "ageGroup": "adult"
    }
    response = client.post("/api/ai/generate-sentence", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "naturalSentence" in data
    assert "water" in data["naturalSentence"].lower()

def test_improve_text_endpoint():
    payload = {
        "text": "want water",
        "language": "en",
        "ageGroup": "adult"
    }
    response = client.post("/api/ai/improve-text", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "improved" in data
    assert "water" in data["improved"].lower()

def test_conversations_api():
    convo = {
        "id": "c1",
        "title": "Lunch talk",
        "timestamp": 123456789.0,
        "language": "en-IN",
        "messagesCount": 2,
        "turns": []
    }
    # Save
    post_res = client.post("/api/conversations", json=convo)
    assert post_res.status_code == 200
    # List
    get_res = client.get("/api/conversations")
    assert get_res.status_code == 200
    items = get_res.json()
    assert any(i["id"] == "c1" for i in items)

def test_user_preferences_api():
    prefs = client.get("/api/user/preferences").json()
    assert "language" in prefs
    prefs["enableAI"] = True
    update_res = client.post("/api/user/preferences", json=prefs)
    assert update_res.status_code == 200
    assert update_res.json()["enableAI"] is True

def test_drawing_endpoints():
    status_res = client.get("/api/drawing/status")
    assert status_res.status_code == 200
    data = status_res.json()
    assert data["service"] == "drawing"
    assert data["ephemeralStorage"] is True

    # Test sketch analysis with mock base64 data
    mock_payload = {
        "imageData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "language": "en"
    }
    analyze_res = client.post("/api/drawing/analyze", json=mock_payload)
    assert analyze_res.status_code == 200
    res_data = analyze_res.json()
    assert "symbol" in res_data
    assert "confidence" in res_data
    assert "label" in res_data
    assert "It looks like" in res_data["message"]

def test_sign_endpoints():
    status_res = client.get("/api/sign/status")
    assert status_res.status_code == 200
    data = status_res.json()
    assert data["service"] == "sign_language"
    assert "vocabulary" in data

    mock_payload = {
        "data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "language": "en"
    }
    analyze_res = client.post("/api/sign/analyze-image", json=mock_payload)
    assert analyze_res.status_code == 200
    res_data = analyze_res.json()
    assert "sign" in res_data
    assert "confidence" in res_data
    assert "label" in res_data

def test_sentence_options_endpoint():
    payload = {
        "item": "pizza",
        "language": "en-IN",
        "ageGroup": "adult",
        "tone": "polite",
        "wording": "neutral"
    }
    res = client.post("/api/ai/sentence-options", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "options" in data
    assert len(data["options"]) >= 3
    assert any("pizza" in opt["text"].lower() for opt in data["options"])
    assert data["options"][0]["grammarChecked"] is True

def test_continue_endpoint():
    payload = {
        "lastSentence": "I would like some pizza, please.",
        "language": "en-IN",
        "ageGroup": "adult",
        "tone": "polite"
    }
    res = client.post("/api/ai/continue", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "options" in data
    assert "repairOptions" in data
    assert len(data["options"]) >= 3
    assert len(data["repairOptions"]) >= 4
    assert any("again" in opt["text"].lower() for opt in data["repairOptions"])

def test_sign_analyze_endpoint():
    # Test POST /api/sign/analyze endpoint
    res = client.post("/api/sign/analyze", json={})
    assert res.status_code == 200
    data = res.json()
    assert "transcript" in data
    assert data["transcript"] == "I need water"
    assert data["sign"] == "water"
    assert data["confidence"] >= 0.9

    # Test with custom mockTranscript
    res2 = client.post("/api/sign/analyze", json={"mockTranscript": "Hello, thank you"})
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["transcript"] == "Hello, thank you"
