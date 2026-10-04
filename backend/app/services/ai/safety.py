import re
from typing import List, Optional, Tuple
from app.schemas.context import PredictedResponse

# Deterministic safety triggers in English, Kannada, and Hindi
# Categories: emergency, danger, self_harm, medication_poison, severe_symptoms

SAFETY_KEYWORDS_EN = {
    'emergency': [
        'help', 'emergency', 'danger', 'fire', 'call police', 'call ambulance', 
        'attack', 'intruder', 'accident', 'lost', 'stuck', 'save me'
    ],
    'self_harm': [
        'kill myself', 'hurt myself', 'suicide', 'want to die', 'end my life', 'cut myself'
    ],
    'medication_poison': [
        'poison', 'overdose', 'wrong medicine', 'wrong pills', 'too many pills', 'swallowed chemical'
    ],
    'severe_symptoms': [
        'cannot breathe', "can't breathe", 'choking', 'chest pain', 'heart attack', 
        'seizure', 'unconscious', 'bleeding heavily', 'severe pain', 'fainting'
    ]
}

SAFETY_KEYWORDS_KN = {
    'emergency': [
        'ಸಹಾಯ', 'ತುರ್ತು', 'ಅಪಾಯ', 'ಬೆಂಕಿ', 'ಪೊಲೀಸ್', 'ಆಂಬ್ಯುಲೆನ್ಸ್', 
        'ಆಕ್ರಮಣ', 'ಅಪಘಾತ', 'ದಾರಿ ತಪ್ಪಿದೆ', 'ಕಾಪಾಡಿ'
    ],
    'self_harm': [
        'ಸಾಯಲು ಬಯಸುತ್ತೇನೆ', 'ಆತ್ಮಹತ್ಯೆ', 'ನನ್ನನ್ನು ನೋಯಿಸಿಕೊಳ್ಳಲು', 'ಜೀವ ಬಿಡಲು'
    ],
    'medication_poison': [
        'ವಿಷ', 'ತಪ್ಪು ಔಷಧಿ', 'ಹೆಚ್ಚು ಮಾತ್ರೆ', 'ರಾಸಾಯನಿಕ ಕುಡಿದಿದ್ದೇನೆ'
    ],
    'severe_symptoms': [
        'ಉಸಿರಾಡಲು ಆಗುತ್ತಿಲ್ಲ', 'ಎದೆ ನೋವು', 'ಉಸಿರು ಕಟ್ಟಿದೆ', 'ಮೂರ್ಛೆ', 
        'ಹೃದಯಾಘಾತ', 'ವಿಪರೀತ ರಕ್ತಸ್ರಾವ', 'ಪ್ರಜ್ಞೆ ತಪ್ಪಿದೆ'
    ]
}

SAFETY_KEYWORDS_HI = {
    'emergency': [
        'मदद', 'आपातकाल', 'खतरा', 'आग', 'पुलिस', 'एम्बुलेंस', 
        'हमला', 'दुर्घटना', 'खो गया', 'बचाओ'
    ],
    'self_harm': [
        'मरना चाहता', 'आत्महत्या', 'खुद को चोट', 'जान देना'
    ],
    'medication_poison': [
        'जहर', 'गलत दवा', 'ओवरडोज़', 'ज्यादा गोलियां', 'केमिकल पी लिया'
    ],
    'severe_symptoms': [
        'सांस नहीं आ रही', 'दम घुट रहा', 'सीने में दर्द', 'दौरा', 
        'दिल का दौरा', 'बहुत खून बह रहा', 'बेहोश'
    ]
}

def check_safety_triggers(text: str) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    Deterministically checks if the input text triggers any safety concerns
    in English, Kannada, or Hindi.
    Returns: (triggered: bool, category: Optional[str], detected_keyword: Optional[str])
    """
    if not text:
        return False, None, None

    cleaned = text.lower().strip()

    # 1. English checks
    for category, keywords in SAFETY_KEYWORDS_EN.items():
        for kw in keywords:
            pattern = r'\b' + re.escape(kw) + r'\b'
            if re.search(pattern, cleaned):
                return True, category, kw

    # 2. Kannada checks
    for category, keywords in SAFETY_KEYWORDS_KN.items():
        for kw in keywords:
            if kw in cleaned:
                return True, category, kw

    # 3. Hindi checks
    for category, keywords in SAFETY_KEYWORDS_HI.items():
        for kw in keywords:
            if kw in cleaned:
                return True, category, kw

    return False, None, None

def get_safety_responses(category: str, language: str) -> List[PredictedResponse]:
    """
    Returns verified emergency responses tailored to the language.
    All safety responses are marked sensitive=True to require explicit confirmation before speaking.
    """
    lang = language.lower()
    is_kn = 'kn' in lang
    is_hi = 'hi' in lang

    if is_kn:
        return [
            PredictedResponse(
                pictogramKeyword="emergency",
                label="ತುರ್ತು ಸಹಾಯ ಬೇಕು",
                spokenText="ದಯವಿಟ್ಟು ನನಗೆ ತುರ್ತು ಸಹಾಯ ಮಾಡಿ. ಅಪಾಯದಲ್ಲಿದ್ದೇನೆ.",
                intent="emergency",
                sensitive=True
            ),
            PredictedResponse(
                pictogramKeyword="doctor",
                label="ವೈದ್ಯರನ್ನು ಕರೆಯಿರಿ",
                spokenText="ದಯವಿಟ್ಟು ವೈದ್ಯರನ್ನು ಅಥವಾ ಆಂಬ್ಯುಲೆನ್ಸ್ ಕರೆಯಿರಿ.",
                intent="emergency",
                sensitive=True
            ),
            PredictedResponse(
                pictogramKeyword="family",
                label="ಕುಟುಂಬಕ್ಕೆ ತಿಳಿಸಿ",
                spokenText="ದಯವಿಟ್ಟು ತಕ್ಷಣ ನನ್ನ ಕುಟುಂಬಕ್ಕೆ ಕರೆ ಮಾಡಿ.",
                intent="emergency",
                sensitive=True
            ),
            PredictedResponse(
                pictogramKeyword="help",
                label="ನನ್ನ ಜೊತೆಗಿರಿ",
                spokenText="ದಯವಿಟ್ಟು ನನ್ನ ಜೊತೆಯೇ ಇರಿ. ನನಗೆ ಸುರಕ್ಷತೆ ಬೇಕು.",
                intent="emergency",
                sensitive=True
            )
        ]
    elif is_hi:
        return [
            PredictedResponse(
                pictogramKeyword="emergency",
                label="आपातकालीन मदद चाहिए",
                spokenText="मुझे तुरंत मदद चाहिए, कृपया सहायता करें।",
                intent="emergency",
                sensitive=True
            ),
            PredictedResponse(
                pictogramKeyword="doctor",
                label="डॉक्टर को बुलाओ",
                spokenText="कृपया डॉक्टर या एम्बुलेंस को तुरंत बुलाएं।",
                intent="emergency",
                sensitive=True
            ),
            PredictedResponse(
                pictogramKeyword="family",
                label="परिवार को फोन करें",
                spokenText="कृपया मेरे परिवार को तुरंत फोन करें।",
                intent="emergency",
                sensitive=True
            ),
            PredictedResponse(
                pictogramKeyword="help",
                label="मेरे साथ रहें",
                spokenText="कृपया मेरे साथ रहें, मैं सुरक्षित महसूस नहीं कर रहा हूँ।",
                intent="emergency",
                sensitive=True
            )
        ]
    else:
        # Default English
        return [
            PredictedResponse(
                pictogramKeyword="emergency",
                label="I need emergency help",
                spokenText="I need emergency help immediately. Please assist me.",
                intent="emergency",
                sensitive=True
            ),
            PredictedResponse(
                pictogramKeyword="doctor",
                label="Call a doctor",
                spokenText="Please call a doctor or an ambulance right now.",
                intent="emergency",
                sensitive=True
            ),
            PredictedResponse(
                pictogramKeyword="family",
                label="Call my family",
                spokenText="Please call my family immediately.",
                intent="emergency",
                sensitive=True
            ),
            PredictedResponse(
                pictogramKeyword="help",
                label="Please stay with me",
                spokenText="Please stay with me. I do not feel safe.",
                intent="emergency",
                sensitive=True
            )
        ]
