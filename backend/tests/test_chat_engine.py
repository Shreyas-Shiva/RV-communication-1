import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.chat_engine import classify_message, chat_engine

client = TestClient(app)

def test_chat_starters_endpoint():
    res = client.post("/api/chat/starters", json={
        "language": "en",
        "ageGroup": "child"
    })
    assert res.status_code == 200
    data = res.json()
    assert "starters" in data
    assert len(data["starters"]) >= 4
    for st in data["starters"]:
        assert len(st["text"].split()) <= 8

def test_chat_replies_endpoint_food_drink():
    res = client.post("/api/chat/replies", json={
        "language": "en",
        "ageGroup": "child",
        "tone": "polite",
        "turns": [
            {"speaker": "other", "text": "Are you hungry? What would you like to eat?"}
        ]
    })
    assert res.status_code == 200
    data = res.json()
    assert data["questionClass"] == "food_drink"
    assert 4 <= len(data["replies"]) <= 5
    # Verify defect prevention: no "I do not like Yes" or "I do not care for Happy"
    for rep in data["replies"]:
        assert "I do not like Yes" not in rep["text"]
        assert "I do not care for Happy" not in rep["text"]
        assert len(rep["text"].split()) <= 8

def test_chat_replies_endpoint_child_secret_request():
    res = client.post("/api/chat/replies", json={
        "language": "en",
        "ageGroup": "child",
        "tone": "polite",
        "turns": [
            {"speaker": "other", "text": "Please keep this a secret and do not tell your parents."}
        ]
    })
    assert res.status_code == 200
    data = res.json()
    assert data["questionClass"] == "secret_request"
    assert 4 <= len(data["replies"]) <= 5
    # Must offer safe responses
    has_parent_or_grownup = any("dad" in r["text"] or "grown-up" in r["text"] or "teacher" in r["text"] or "secrets" in r["text"] for r in data["replies"])
    assert has_parent_or_grownup

def test_chat_replies_endpoint_personal_info():
    res = client.post("/api/chat/replies", json={
        "language": "en",
        "ageGroup": "student",
        "turns": [
            {"speaker": "other", "text": "What is your phone number and where do you live?"}
        ]
    })
    assert res.status_code == 200
    data = res.json()
    assert data["questionClass"] == "personal_info_request"
    assert 4 <= len(data["replies"]) <= 5
    has_refusal = any("private" in r["text"].lower() or "guardian" in r["text"].lower() or "not share" in r["text"].lower() for r in data["replies"])
    assert has_refusal

def test_chat_replies_kannada():
    res = client.post("/api/chat/replies", json={
        "language": "kn",
        "ageGroup": "adult",
        "turns": [
            {"speaker": "other", "text": "ನೀವು ಊಟ ಮಾಡುತ್ತೀರಾ?"}
        ]
    })
    assert res.status_code == 200
    data = res.json()
    assert 4 <= len(data["replies"]) <= 5
    for rep in data["replies"]:
        assert len(rep["text"]) > 0

def test_chat_replies_hindi():
    res = client.post("/api/chat/replies", json={
        "language": "hi",
        "ageGroup": "student",
        "turns": [
            {"speaker": "other", "text": "क्या आप चाय पीना चाहते हैं?"}
        ]
    })
    assert res.status_code == 200
    data = res.json()
    assert 4 <= len(data["replies"]) <= 5

def test_no_consecutive_repeats():
    # Context chain test: options must not repeat phrases used in recent turns
    res1 = client.post("/api/chat/replies", json={
        "language": "en",
        "ageGroup": "adult",
        "turns": [
            {"speaker": "other", "text": "Are you hungry?"}
        ]
    })
    chosen = res1.json()["replies"][0]["text"]
    
    res2 = client.post("/api/chat/replies", json={
        "language": "en",
        "ageGroup": "adult",
        "turns": [
            {"speaker": "other", "text": "Are you hungry?"},
            {"speaker": "user", "text": chosen},
            {"speaker": "other", "text": "Would you like something to drink?"}
        ]
    })
    res2_texts = [r["text"] for r in res2.json()["replies"]]
    assert chosen not in res2_texts

def test_classifier_accuracy_across_languages():
    # 20 messages per language = 60 test messages
    test_cases = [
        # English
        ("Hello, good morning!", "greeting"),
        ("Hi there", "greeting"),
        ("How are you doing today?", "how_are_you"),
        ("How are you feeling?", "how_are_you"),
        ("Do you want water?", "food_drink"),
        ("Are you hungry?", "food_drink"),
        ("What do you want to eat for lunch?", "food_drink"),
        ("Are you coming with us?", "yes_no"),
        ("Do you like this?", "yes_no"),
        ("Do you want tea or coffee?", "choice"),
        ("Which one, apple or banana?", "choice"),
        ("What happened at school?", "school"),
        ("Where is the hospital?", "open_where"),
        ("Why are you crying?", "open_why"),
        ("Please sit down here", "instruction_request"),
        ("Where does it hurt?", "pain_injury"),
        ("Call an ambulance now", "emergency"),
        ("Don't tell anyone, keep this secret", "secret_request"),
        ("What is your phone number?", "personal_info_request"),
        ("Thank you very much, goodbye", "thanks_goodbye"),

        # Kannada
        ("ನಮಸ್ಕಾರ, ಹೇಗಿದ್ದೀರಿ?", "greeting"),
        ("ಶುಭೋದಯ!", "greeting"),
        ("ನೀವು ಆರಾಮಾಗಿದ್ದೀರಾ?", "how_are_you"),
        ("ಹೇಗಿದ್ದೀಯಾ?", "how_are_you"),
        ("ನಿಮಗೆ ಹಸಿವಾಗಿದೆಯೇ?", "food_drink"),
        ("ನೀರು ಕುಡಿಯುತ್ತೀರಾ?", "food_drink"),
        ("ಊಟ ಮಾಡುತ್ತೀರಾ?", "food_drink"),
        ("ನೀವು ಬರುತ್ತೀರಾ?", "yes_no"),
        ("ಇದು ನಿಮಗೆ ಇಷ್ಟವೇ?", "yes_no"),
        ("ಚಹಾ ಅಥವಾ ಕಾಫಿ ಬೇಕೇ?", "choice"),
        ("ಯಾವುದು ಬೇಕು?", "choice"),
        ("ಮನೆಕೆಲಸ ಮುಗಿಸಿದಿರಾ?", "school"),
        ("ಆಸ್ಪತ್ರೆ ಎಲ್ಲಿದೆ?", "open_where"),
        ("ಯಾಕೆ ಅಳುತ್ತಿದ್ದೀಯ?", "open_why"),
        ("ದಯವಿಟ್ಟು ಇಲ್ಲಿ ಕುಳಿತುಕೊಳ್ಳಿ", "instruction_request"),
        ("ಎಲ್ಲಿ ನೋವಾಗುತ್ತಿದೆ?", "pain_injury"),
        ("ಪೊಲೀಸ್ ತುರ್ತು ಸಹಾಯ ಬೇಕು", "emergency"),
        ("ರಹಸ್ಯವಾಗಿಡು, ಯಾರಿಗೂ ಹೇಳಬೇಡ", "secret_request"),
        ("ನಿನ್ನ ಫೋನ್ ನಂಬರ್ ಏನು?", "personal_info_request"),
        ("ಧನ್ಯವಾದಗಳು, ಹೋಗಿ ಬರುತ್ತೇನೆ", "thanks_goodbye"),

        # Hindi
        ("नमस्ते, आप कैसे हैं?", "greeting"),
        ("सुप्रभात!", "greeting"),
        ("आप कैसे हैं?", "how_are_you"),
        ("सब कैसा चल रहा है?", "how_are_you"),
        ("क्या आपको भूख लगी है?", "food_drink"),
        ("पानी पियोगे?", "food_drink"),
        ("खाने में क्या चाहिए?", "food_drink"),
        ("क्या तुम आओगे?", "yes_no"),
        ("क्या यह ठीक है?", "yes_no"),
        ("चाय या कॉफ़ी?", "choice"),
        ("कौन सा चाहिए?", "choice"),
        ("होमवर्क पूरा किया?", "school"),
        ("अस्पताल कहाँ है?", "open_where"),
        ("तुम क्यों रो रहे हो?", "open_why"),
        ("कृपया यहाँ बैठो", "instruction_request"),
        ("कहाँ दर्द हो रहा है?", "pain_injury"),
        ("पुलिस को बुलाओ, मदद चाहिए", "emergency"),
        ("किसी को मत बताना, राज रखना", "secret_request"),
        ("तुम्हारा फोन नंबर क्या है?", "personal_info_request"),
        ("बहुत बहुत धन्यवाद, अलविदा", "thanks_goodbye"),
    ]

    correct = 0
    total = len(test_cases)
    for text, expected in test_cases:
        predicted = classify_message(text)
        if predicted == expected:
            correct += 1
        else:
            safe_text = text.encode('ascii', 'backslashreplace').decode('ascii')
            print(f"Mismatch: '{safe_text}' -> predicted '{predicted}', expected '{expected}'")

    accuracy = correct / total
    print(f"\nClassifier Accuracy across {total} prompts: {accuracy * 100:.1f}% ({correct}/{total})")
    assert accuracy >= 0.90, f"Classifier accuracy was {accuracy * 100:.1f}%, expected >= 90%"
