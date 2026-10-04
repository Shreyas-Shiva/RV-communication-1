import pytest
from app.services.ai.safety import check_safety_triggers, get_safety_responses

def test_safety_triggers_english():
    # 1. Emergency
    triggered, category, kw = check_safety_triggers("There is a fire in the building, please help!")
    assert triggered is True
    assert category == "emergency"
    assert kw in ["fire", "help"]

    # 2. Self harm
    triggered, category, kw = check_safety_triggers("I want to hurt myself today.")
    assert triggered is True
    assert category == "self_harm"

    # 3. Poison / overdose
    triggered, category, kw = check_safety_triggers("I took too many pills by mistake.")
    assert triggered is True
    assert category == "medication_poison"

    # 4. Severe symptoms
    triggered, category, kw = check_safety_triggers("I cannot breathe and need a doctor.")
    assert triggered is True
    assert category == "severe_symptoms"

def test_safety_triggers_kannada():
    # 1. Emergency
    triggered, category, kw = check_safety_triggers("ದಯವಿಟ್ಟು ನನಗೆ ತಕ್ಷಣ ಸಹಾಯ ಮಾಡಿ!")
    assert triggered is True
    assert category == "emergency"
    assert kw == "ಸಹಾಯ"

    # 2. Self harm
    triggered, category, kw = check_safety_triggers("ನಾನು ಸಾಯಲು ಬಯಸುತ್ತೇನೆ.")
    assert triggered is True
    assert category == "self_harm"

    # 3. Poison / overdose
    triggered, category, kw = check_safety_triggers("ತಪ್ಪು ಔಷಧಿ ತೆಗೆದುಕೊಂಡಿದ್ದೇನೆ.")
    assert triggered is True
    assert category == "medication_poison"

    # 4. Severe symptoms
    triggered, category, kw = check_safety_triggers("ನನಗೆ ಉಸಿರಾಡಲು ಆಗುತ್ತಿಲ್ಲ.")
    assert triggered is True
    assert category == "severe_symptoms"

def test_safety_triggers_hindi():
    # 1. Emergency
    triggered, category, kw = check_safety_triggers("बचाओ, यहाँ बहुत बड़ा खतरा है!")
    assert triggered is True
    assert category == "emergency"

    # 2. Self harm
    triggered, category, kw = check_safety_triggers("मैं खुद को चोट पहुँचाना चाहता हूँ।")
    assert triggered is True
    assert category == "self_harm"

    # 3. Poison / overdose
    triggered, category, kw = check_safety_triggers("गलत दवा पी ली है।")
    assert triggered is True
    assert category == "medication_poison"

    # 4. Severe symptoms
    triggered, category, kw = check_safety_triggers("सांस नहीं आ रही है, डॉक्टर को बुलाओ।")
    assert triggered is True
    assert category == "severe_symptoms"

def test_safety_safe_inputs():
    # Normal conversation should not trigger safety
    assert check_safety_triggers("Hello, how are you?")[0] is False
    assert check_safety_triggers("Would you like some pizza?")[0] is False
    assert check_safety_triggers("ಶಾಲೆಗೆ ಹೋಗೋಣ ಬನ್ನಿ.")[0] is False
    assert check_safety_triggers("मुझे पानी पीना है।")[0] is False

def test_safety_responses_always_sensitive():
    for lang in ["en", "kn", "hi"]:
        responses = get_safety_responses("emergency", lang)
        assert len(responses) >= 3
        for r in responses:
            assert r.sensitive is True
            assert r.intent == "emergency"
            assert r.spokenText.strip() != ""
