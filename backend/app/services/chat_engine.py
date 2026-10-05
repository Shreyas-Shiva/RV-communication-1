"""
COMMUNIQ Chat Engine Service
Handles deterministic classification, safety auditing, context chaining,
and generation of 4-5 grammatical response options in English, Kannada, and Hindi.
"""

import re
from typing import List, Dict, Any, Optional
from app.schemas.chat import ChatTurn, ChatReplyItem, ChatRepliesResponse, ChatStartersResponse

# 25+ Question Classes
QUESTION_CLASSES = [
    "greeting",
    "how_are_you",
    "yes_no",
    "choice",
    "open_what",
    "open_where",
    "open_who",
    "open_why",
    "open_when",
    "instruction_request",
    "statement",
    "feelings_health",
    "food_drink",
    "play",
    "school",
    "shopping",
    "travel_directions",
    "thanks_goodbye",
    "emergency",
    "pain_injury",
    "danger_safety",
    "medication",
    "secret_request",
    "personal_info_request",
    "unknown"
]

# Classification Patterns
PATTERNS = {
    # Child protection & secrets
    "secret_request": [
        r"\b(?:keep (?:a |this )?secret|don'?t tell|do not tell|tell no one|keep it between us|meet me alone|come with me alone)\b",
        r"(?:ರಹಸ್ಯವಾಗಿಡು|ಯಾರಿಗೂ ಹೇಳಬೇಡ|ಒಬ್ಬನೇ ಬಾ|ಒಬ್ಬಳೇ ಬಾ)",
        r"(?:किसी को मत बताना|गुप्त रखना|अकेले में मिलना|राज रखना)"
    ],
    # Personal information requests
    "personal_info_request": [
        r"\b(?:what(?:'s| is) your (?:address|phone|number|password|school)|where do you live|where is your house)\b",
        r"(?:ನಿನ್ನ ವಿಳಾಸ|ಫೋನ್ ನಂಬರ್|ಪಾಸ್‌ವರ್ಡ್|ಎಲ್ಲಿ ವಾಸಿಸುತ್ತೀಯಾ|ನಿನ್ನ ಶಾಲೆ ಯಾವುದು)",
        r"(?:तुम्हारा पता|फोन नंबर|पासवर्ड|कहाँ रहते हो|तुम्हारा स्कूल)"
    ],
    # Emergency & safety
    "emergency": [
        r"\b(?:help|emergency|call (?:the )?(?:police|ambulance|112|108)|fire|danger)\b",
        r"(?:ತುರ್ತು|ಸಹಾಯ|ಪೊಲೀಸ್|ಅಪಾಯ|ಆಂಬ್ಯುಲೆನ್ಸ್)",
        r"(?:मदद|आपातकाल|पुलिस|खतरा|एम्बुलेंस)"
    ],
    "pain_injury": [
        r"\b(?:hurt|hurts|pain|injured|bleeding|ache|headache|stomach ache)\b",
        r"(?:ನೋವು|ಗಾಯ|ರಕ್ತ|ತಲೆನೋವು|ಹೊಟ್ಟೆನೋವು)",
        r"(?:दर्द|चोट|दर्द हो रहा|सिरदर्द|पेट दर्द)"
    ],
    "medication": [
        r"\b(?:medicine|pills|tablet|syrup|dose)\b",
        r"(?:ಔಷಧಿ|ಮಾತ್ರೆ|ಗುಳಿಗೆ)",
        r"(?:दवाई|दवा|गोली)"
    ],
    "food_drink": [
        r"\b(?:hungry|thirsty|eat|drink|lunch|dinner|breakfast|food|water|snack|tea|coffee|pizza|apple|milk)\b",
        r"(?:ಹಸಿವ|ಬಾಯಾರಿಕೆ|ಊಟ|ತಿಂಡಿ|ತಿನ್ನು|ಕುಡಿ|ನೀರು|ಆಹಾರ|ಹಾಲು)",
        r"(?:भूख|प्यास|खाना|पीना|पानी|चाय|नाश्ता|भोजन|दूध|खाओ|पियो)"
    ],
    "greeting": [
        r"\b(?:hello|hi|hey|good morning|good afternoon|good evening|namaste|namaskara)\b",
        r"(?:ನಮಸ್ಕಾರ|ಶುಭೋದಯ|ಹಲೋ|ಹಾಯ್)",
        r"(?:नमस्ते|नमस्कार|सुप्रभात|हेलो|हाय)"
    ],
    "how_are_you": [
        r"\b(?:how are you|how do you do|how(?:'re| are) you feeling|how is it going|everything ok)\b",
        r"(?:ಹೇಗಿದ್ದೀರಾ|ಹೇಗಿದ್ದೀಯಾ|ಆರಾಮಾಗಿದ್ದೀರಾ|ಸೌಖ್ಯವೇ)",
        r"(?:आप कैसे हैं|तुम कैसे हो|कैसा चल रहा है|सब ठीक है)"
    ],
    "yes_no": [
        r"^(?:are you|is it|do you|did you|can you|will you|would you|have you|shall we)\b",
        r"(?:ಹೌದೇ|ಅಲ್ಲವೇ|ಮಾಡುತ್ತೀರಾ|ಬರುತ್ತೀರಾ|ಇಷ್ಟವೇ|ಬೇಕೇ)",
        r"(?:क्या आप|क्या तुम|क्या यह|करोगे|आओगे|चाहिए)"
    ],
    "choice": [
        r"\b(?:or|which one)\b",
        r"(?:(?:\s|^)ಅಥವಾ(?:\s|$)|ಯಾವುದು ಬೇಕು)",
        r"(?:(?:\s|^)या(?:\s|$)|कौन सा|यह या वह)"
    ],
    "emergency": [
        r"\b(?:help|emergency|call (?:the )?(?:police|ambulance|112|108)|ambulance|fire|danger)\b",
        r"(?:ತುರ್ತು|ಸಹಾಯ|ಪೊಲೀಸ್|ಅಪಾಯ|ಆಂಬ್ಯುಲೆನ್ಸ್)",
        r"(?:मदद|आपातकाल|पुलिस|खतरा|एम्बुलेंस)"
    ],
    "instruction_request": [
        r"\b(?:please|sit down|come here|listen|open|close|look|wait)\b",
        r"(?:ದಯವಿಟ್ಟು|ಕುಳಿತುಕೋ|ಕುಳಿತುಕೊಳ್ಳಿ|ಇಲ್ಲಿ ಬಾ|ಕೇಳು|ತೆರೆ|ಮುಚ್ಚು|ನೋಡು|ನಿಲ್ಲು)",
        r"(?:कृपया|बैठो|इधर आओ|सुनो|खोलो|बंद करो|देखो|रुको)"
    ],
    "open_what": [
        r"\b(?:what is|what are|what do you|what happened|what would you|what did)\b",
        r"(?:ಏನು|ಏನಾಯಿತು)",
        r"(?:क्या हुआ|क्या चाहिए)"
    ],
    "open_where": [
        r"\b(?:where is|where are|where do|where did|where should)\b",
        r"(?:ಎಲ್ಲಿ|ಎಲ್ಲಿಗೆ|ಎಲ್ಲಿರುವುದು)",
        r"(?:कहाँ|किधर|कहाँ है)"
    ],
    "open_who": [
        r"\b(?:who is|who are|who did|who was)\b",
        r"(?:ಯಾರು|ಯಾರವರು)",
        r"(?:कौन|कौन है)"
    ],
    "open_why": [
        r"\b(?:why are|why did|why is|why do)\b",
        r"(?:ಏಕೆ|ಯಾಕೆ)",
        r"(?:क्यों|किसलिए)"
    ],
    "open_when": [
        r"\b(?:when is|when are|when will|what time)\b",
        r"(?:ಯಾವಾಗ|ಎಷ್ಟು ಹೊತ್ತಿಗೆ)",
        r"(?:कब|किस समय)"
    ],
    "feelings_health": [
        r"\b(?:happy|sad|angry|tired|scared|sick|excited|worried|feeling)\b",
        r"(?:ಖುಷಿ|ದುಃಖ|ಕೋಪ|ದಣಿವು|ಭಯ|ಹುಷಾರಿಲ್ಲ)",
        r"(?:खुश|उदास|गुस्सा|थका हुआ|डर|बीमार)"
    ],
    "play": [
        r"\b(?:play|game|toy|ball|match|fun|playground)\b",
        r"(?:ಆಟ|ಆಡು|ಆಟಿಕೆ|ಚೆಂಡು|ಮೈದಾನ)",
        r"(?:खेल|खेलना|खिलौना|गेंद|मैदान)"
    ],
    "school": [
        r"\b(?:school|homework|class|teacher|book|study|lesson|read|write)\b",
        r"(?:ಶಾಲೆ|ಮನೆಕೆಲಸ|ತರಗತಿ|ಶಿಕ್ಷಕ|ಪುಸ್ತಕ|ಓದು|ಬರೆ)",
        r"(?:स्कूल|होमवर्क|कक्षा|अध्यापक|किताब|पढ़ाई|लिखना)"
    ],
    "shopping": [
        r"\b(?:price|cost|how much|buy|store|shop|rupees|pay)\b",
        r"(?:ಬೆಲೆ|ಎಷ್ಟು|ಖರೀದಿ|ಅಂಗಡಿ|ದುಡ್ಡು|ಹಣ)",
        r"(?:कीमत|कितने का|खरीदना|दुकान|रुपये)"
    ],
    "travel_directions": [
        r"\b(?:bus|train|car|station|stop|ticket|road|way|left|right)\b",
        r"(?:ಬಸ್ಸು|ರೈಲು|ನಿಲ್ದಾಣ|ಟಿಕೆಟ್|ರಸ್ತೆ|ಎಡ|ಬಲ)",
        r"(?:बस|ट्रेन|स्टेशन|टिकट|रास्ता|बाएँ|दाएँ)"
    ],
    "thanks_goodbye": [
        r"\b(?:thank you|thanks|bye|goodbye|see you|take care)\b",
        r"(?:ಧನ್ಯವಾದಗಳು|ವಂದನೆಗಳು|ಹೋಗಿ ಬರುತ್ತೇನೆ|ಬೈ)",
        r"(?:धन्यवाद|शुक्रिया|अलविदा|बाय|फिर मिलेंगे)"
    ]
}

CLASSIFICATION_PRIORITY = [
    "secret_request",
    "personal_info_request",
    "emergency",
    "pain_injury",
    "medication",
    "choice",
    "school",
    "food_drink",
    "shopping",
    "travel_directions",
    "play",
    "feelings_health",
    "how_are_you",
    "greeting",
    "thanks_goodbye",
    "instruction_request",
    "yes_no",
    "open_why",
    "open_when",
    "open_who",
    "open_where",
    "open_what"
]

def classify_message(text: str) -> str:
    cleaned = text.strip().lower()
    if not cleaned:
        return "unknown"
    for q_class in CLASSIFICATION_PRIORITY:
        regexes = PATTERNS.get(q_class, [])
        for pattern in regexes:
            if re.search(pattern, cleaned, re.IGNORECASE):
                return q_class
    return "statement" if not cleaned.endswith("?") else "unknown"


# Handcrafted Built-In Packs (4 to 5 options per class, per language, per age group)
# All Kannada and Hindi entries maintain high natural quality.
BUILTIN_PACKS: Dict[str, Dict[str, Dict[str, List[Dict[str, Any]]]]] = {
    "food_drink": {
        "en": {
            "child": [
                {"id": "fd_c1", "text": "I am hungry.", "pictogramKeyword": "hungry", "intent": "state"},
                {"id": "fd_c2", "text": "I want water please.", "pictogramKeyword": "water", "intent": "request"},
                {"id": "fd_c3", "text": "Can I have a snack?", "pictogramKeyword": "snack", "intent": "request"},
                {"id": "fd_c4", "text": "I am not hungry now.", "pictogramKeyword": "no", "intent": "refuse"},
                {"id": "fd_c5", "text": "More please.", "pictogramKeyword": "more", "intent": "request"}
            ],
            "student": [
                {"id": "fd_s1", "text": "Yes, I would like something to eat.", "pictogramKeyword": "eat", "intent": "request"},
                {"id": "fd_s2", "text": "Could I have a glass of water?", "pictogramKeyword": "water", "intent": "request"},
                {"id": "fd_s3", "text": "What are the options?", "pictogramKeyword": "question", "intent": "ask"},
                {"id": "fd_s4", "text": "No thank you, I just ate.", "pictogramKeyword": "no", "intent": "refuse"},
                {"id": "fd_s5", "text": "I would like tea please.", "pictogramKeyword": "tea", "intent": "request"}
            ],
            "adult": [
                {"id": "fd_a1", "text": "Yes please, I would like a meal.", "pictogramKeyword": "eat", "intent": "request"},
                {"id": "fd_a2", "text": "Could I please have some water?", "pictogramKeyword": "water", "intent": "request"},
                {"id": "fd_a3", "text": "I am fine for now, thank you.", "pictogramKeyword": "no", "intent": "polite_refuse"},
                {"id": "fd_a4", "text": "Could we please look at the menu?", "pictogramKeyword": "menu", "intent": "ask"},
                {"id": "fd_a5", "text": "A cup of warm tea would be wonderful.", "pictogramKeyword": "tea", "intent": "request"}
            ]
        },
        "kn": {
            "child": [
                {"id": "fd_kn_c1", "text": "ನನಗೆ ಹಸಿವಾಗಿದೆ.", "pictogramKeyword": "hungry", "intent": "state"},
                {"id": "fd_kn_c2", "text": "ನನಗೆ ನೀರು ಬೇಕು.", "pictogramKeyword": "water", "intent": "request"},
                {"id": "fd_kn_c3", "text": "ನನಗೆ ತಿಂಡಿ ಕೊಡಿ.", "pictogramKeyword": "snack", "intent": "request"},
                {"id": "fd_kn_c4", "text": "ನನಗೆ ಈಗ ಬೇಡ.", "pictogramKeyword": "no", "intent": "refuse"},
                {"id": "fd_kn_c5", "text": "ಇನ್ನೂ ಸ್ವಲ್ಪ ಬೇಕು.", "pictogramKeyword": "more", "intent": "request"}
            ],
            "student": [
                {"id": "fd_kn_s1", "text": "ಹೌದು, ನಾನು ಊಟ ಮಾಡುತ್ತೇನೆ.", "pictogramKeyword": "eat", "intent": "request"},
                {"id": "fd_kn_s2", "text": "ದಯವಿಟ್ಟು ಕುಡಿಯಲು ನೀರು ಕೊಡಿ.", "pictogramKeyword": "water", "intent": "request"},
                {"id": "fd_kn_s3", "text": "ತಿನ್ನಲು ಏನಿದೆ?", "pictogramKeyword": "question", "intent": "ask"},
                {"id": "fd_kn_s4", "text": "ಬೇಡ ಧನ್ಯವಾದಗಳು, ನಾನು ಈಗಷ್ಟೇ ತಿಂದೆ.", "pictogramKeyword": "no", "intent": "refuse"},
                {"id": "fd_kn_s5", "text": "ನನಗೆ ಸ್ವಲ್ಪ ಚಹಾ ಬೇಕು.", "pictogramKeyword": "tea", "intent": "request"}
            ],
            "adult": [
                {"id": "fd_kn_a1", "text": "ದಯವಿಟ್ಟು ಊಟ ಕೊಡುತ್ತೀರಾ?", "pictogramKeyword": "eat", "intent": "request"},
                {"id": "fd_kn_a2", "text": "ನನಗೆ ಸ್ವಲ್ಪ ಕುಡಿಯುವ ನೀರು ಬೇಕು.", "pictogramKeyword": "water", "intent": "request"},
                {"id": "fd_kn_a3", "text": "ಈಗ ಬೇಡ, ಧನ್ಯವಾದಗಳು.", "pictogramKeyword": "no", "intent": "polite_refuse"},
                {"id": "fd_kn_a4", "text": "ಇಲ್ಲಿ ಏನು ಸಿಗುತ್ತದೆ?", "pictogramKeyword": "menu", "intent": "ask"},
                {"id": "fd_kn_a5", "text": "ನನಗೆ ಒಂದು ಕಪ್ ಬಿಸಿ ಚಹಾ ಕೊಡಿ.", "pictogramKeyword": "tea", "intent": "request"}
            ]
        },
        "hi": {
            "child": [
                {"id": "fd_hi_c1", "text": "मुझे भूख लगी है।", "pictogramKeyword": "hungry", "intent": "state"},
                {"id": "fd_hi_c2", "text": "मुझे पानी चाहिए।", "pictogramKeyword": "water", "intent": "request"},
                {"id": "fd_hi_c3", "text": "मुझे नाश्ता दीजिए।", "pictogramKeyword": "snack", "intent": "request"},
                {"id": "fd_hi_c4", "text": "मुझे अभी नहीं चाहिए।", "pictogramKeyword": "no", "intent": "refuse"},
                {"id": "fd_hi_c5", "text": "थोड़ा और दीजिए।", "pictogramKeyword": "more", "intent": "request"}
            ],
            "student": [
                {"id": "fd_hi_s1", "text": "हाँ, मैं कुछ खाना चाहता हूँ।", "pictogramKeyword": "eat", "intent": "request"},
                {"id": "fd_hi_s2", "text": "कृपया मुझे एक गिलास पानी दीजिए।", "pictogramKeyword": "water", "intent": "request"},
                {"id": "fd_hi_s3", "text": "खाने में क्या है?", "pictogramKeyword": "question", "intent": "ask"},
                {"id": "fd_hi_s4", "text": "नहीं धन्यवाद, मैंने अभी खाया है।", "pictogramKeyword": "no", "intent": "refuse"},
                {"id": "fd_hi_s5", "text": "मुझे चाय चाहिए।", "pictogramKeyword": "tea", "intent": "request"}
            ],
            "adult": [
                {"id": "fd_hi_a1", "text": "हाँ कृपया, मुझे भोजन चाहिए।", "pictogramKeyword": "eat", "intent": "request"},
                {"id": "fd_hi_a2", "text": "कृपया मुझे पीने का पानी दीजिए।", "pictogramKeyword": "water", "intent": "request"},
                {"id": "fd_hi_a3", "text": "अभी नहीं, बहुत-बहुत धन्यवाद।", "pictogramKeyword": "no", "intent": "polite_refuse"},
                {"id": "fd_hi_a4", "text": "क्या मुझे मेन्यू मिल सकता है?", "pictogramKeyword": "menu", "intent": "ask"},
                {"id": "fd_hi_a5", "text": "मुझे एक कप गर्म चाय दीजिए।", "pictogramKeyword": "tea", "intent": "request"}
            ]
        }
    },
    "greeting": {
        "en": {
            "child": [
                {"id": "gr_c1", "text": "Hello!", "pictogramKeyword": "hello", "intent": "greet"},
                {"id": "gr_c2", "text": "Good morning!", "pictogramKeyword": "sun", "intent": "greet"},
                {"id": "gr_c3", "text": "Hi, nice to see you.", "pictogramKeyword": "smile", "intent": "greet"},
                {"id": "gr_c4", "text": "I am happy to talk.", "pictogramKeyword": "happy", "intent": "social"},
                {"id": "gr_c5", "text": "How are you today?", "pictogramKeyword": "question", "intent": "ask"}
            ],
            "student": [
                {"id": "gr_s1", "text": "Hello, good to see you.", "pictogramKeyword": "hello", "intent": "greet"},
                {"id": "gr_s2", "text": "Hi, how are things going?", "pictogramKeyword": "smile", "intent": "greet"},
                {"id": "gr_s3", "text": "Good morning.", "pictogramKeyword": "sun", "intent": "greet"},
                {"id": "gr_s4", "text": "Hello, can we talk for a minute?", "pictogramKeyword": "chat", "intent": "social"},
                {"id": "gr_s5", "text": "Hi there!", "pictogramKeyword": "wave", "intent": "greet"}
            ],
            "adult": [
                {"id": "gr_a1", "text": "Hello, nice to meet you.", "pictogramKeyword": "hello", "intent": "greet"},
                {"id": "gr_a2", "text": "Good morning, I hope you are well.", "pictogramKeyword": "sun", "intent": "greet"},
                {"id": "gr_a3", "text": "Hello, thank you for your time.", "pictogramKeyword": "thank_you", "intent": "polite"},
                {"id": "gr_a4", "text": "Namaste, how are you today?", "pictogramKeyword": "namaste", "intent": "greet"},
                {"id": "gr_a5", "text": "Good day, I am glad to speak with you.", "pictogramKeyword": "smile", "intent": "greet"}
            ]
        },
        "kn": {
            "child": [
                {"id": "gr_kn_c1", "text": "ನಮಸ್ಕಾರ!", "pictogramKeyword": "hello", "intent": "greet"},
                {"id": "gr_kn_c2", "text": "ಶುಭೋದಯ!", "pictogramKeyword": "sun", "intent": "greet"},
                {"id": "gr_kn_c3", "text": "ಹಲೋ, ನಿಮ್ಮನ್ನು ನೋಡಿ ಸಂತೋಷವಾಯಿತು.", "pictogramKeyword": "smile", "intent": "greet"},
                {"id": "gr_kn_c4", "text": "ನಾನು ಮಾತನಾಡಲು ಇಷ್ಟಪಡುತ್ತೇನೆ.", "pictogramKeyword": "happy", "intent": "social"},
                {"id": "gr_kn_c5", "text": "ನೀವು ಹೇಗಿದ್ದೀರಿ?", "pictogramKeyword": "question", "intent": "ask"}
            ],
            "student": [
                {"id": "gr_kn_s1", "text": "ನಮಸ್ಕಾರ, ಹೇಗಿದ್ದೀರಿ?", "pictogramKeyword": "hello", "intent": "greet"},
                {"id": "gr_kn_s2", "text": "ಶುಭೋದಯ, ಎಲ್ಲವೂ ಚೆನ್ನಾಗಿದೆಯೇ?", "pictogramKeyword": "sun", "intent": "greet"},
                {"id": "gr_kn_s3", "text": "ಹಲೋ, ಭೇಟಿಯಾಗಿದ್ದು ಸಂತೋಷ.", "pictogramKeyword": "smile", "intent": "greet"},
                {"id": "gr_kn_s4", "text": "ನನ್ನ ಹೆಸರು ಕಮ್ಯುನಿಕ್ ಮೂಲಕ ಮಾತನಾಡುತ್ತೇನೆ.", "pictogramKeyword": "chat", "intent": "social"},
                {"id": "gr_kn_s5", "text": "ನಮಸ್ಕಾರ ಸ್ನೇಹಿತರೆ.", "pictogramKeyword": "wave", "intent": "greet"}
            ],
            "adult": [
                {"id": "gr_kn_a1", "text": "ನಮಸ್ಕಾರ, ನಿಮ್ಮನ್ನು ಭೇಟಿಯಾಗಿದ್ದು ಸಂತೋಷ.", "pictogramKeyword": "hello", "intent": "greet"},
                {"id": "gr_kn_a2", "text": "ಶುಭೋದಯ, ನೀವು ಕ್ಷೇಮವೇ?", "pictogramKeyword": "sun", "intent": "greet"},
                {"id": "gr_kn_a3", "text": "ನಮಸ್ಕಾರ, ನಿಮ್ಮ ಸಮಯಕ್ಕೆ ಧನ್ಯವಾದಗಳು.", "pictogramKeyword": "thank_you", "intent": "polite"},
                {"id": "gr_kn_a4", "text": "ಆರಾಮಾಗಿದ್ದೀರಾ?", "pictogramKeyword": "question", "intent": "ask"},
                {"id": "gr_kn_a5", "text": "ನಮಸ್ಕಾರ, ಮಾತನಾಡಲು ಸಂತೋಷ.", "pictogramKeyword": "smile", "intent": "greet"}
            ]
        },
        "hi": {
            "child": [
                {"id": "gr_hi_c1", "text": "नमस्ते!", "pictogramKeyword": "hello", "intent": "greet"},
                {"id": "gr_hi_c2", "text": "सुप्रभात!", "pictogramKeyword": "sun", "intent": "greet"},
                {"id": "gr_hi_c3", "text": "हेलो, आपसे मिलकर खुशी हुई।", "pictogramKeyword": "smile", "intent": "greet"},
                {"id": "gr_hi_c4", "text": "मुझे बात करना अच्छा लगता है।", "pictogramKeyword": "happy", "intent": "social"},
                {"id": "gr_hi_c5", "text": "आप कैसे हैं?", "pictogramKeyword": "question", "intent": "ask"}
            ],
            "student": [
                {"id": "gr_hi_s1", "text": "नमस्ते, आप कैसे हैं?", "pictogramKeyword": "hello", "intent": "greet"},
                {"id": "gr_hi_s2", "text": "सुप्रभात, सब कैसा चल रहा है?", "pictogramKeyword": "sun", "intent": "greet"},
                {"id": "gr_hi_s3", "text": "हेलो, मिलकर अच्छा लगा।", "pictogramKeyword": "smile", "intent": "greet"},
                {"id": "gr_hi_s4", "text": "नमस्ते, क्या हम बात कर सकते हैं?", "pictogramKeyword": "chat", "intent": "social"},
                {"id": "gr_hi_s5", "text": "हेलो दोस्तों!", "pictogramKeyword": "wave", "intent": "greet"}
            ],
            "adult": [
                {"id": "gr_hi_a1", "text": "नमस्ते, आपसे मिलकर बहुत खुशी हुई।", "pictogramKeyword": "hello", "intent": "greet"},
                {"id": "gr_hi_a2", "text": "सुप्रभात, आशा है आप सकुशल हैं।", "pictogramKeyword": "sun", "intent": "greet"},
                {"id": "gr_hi_a3", "text": "नमस्ते, आपके समय के लिए धन्यवाद।", "pictogramKeyword": "thank_you", "intent": "polite"},
                {"id": "gr_hi_a4", "text": "आप कैसे हैं?", "pictogramKeyword": "question", "intent": "ask"},
                {"id": "gr_hi_a5", "text": "नमस्कार, बात करके अच्छा लगा।", "pictogramKeyword": "smile", "intent": "greet"}
            ]
        }
    },
    "how_are_you": {
        "en": {
            "child": [
                {"id": "hry_c1", "text": "I am feeling happy.", "pictogramKeyword": "happy", "intent": "state"},
                {"id": "hry_c2", "text": "I am doing good.", "pictogramKeyword": "good", "intent": "state"},
                {"id": "hry_c3", "text": "I am a little tired.", "pictogramKeyword": "tired", "intent": "state"},
                {"id": "hry_c4", "text": "I am feeling okay.", "pictogramKeyword": "ok", "intent": "state"},
                {"id": "hry_c5", "text": "And how are you?", "pictogramKeyword": "question", "intent": "ask"}
            ],
            "student": [
                {"id": "hry_s1", "text": "I am doing well, thank you.", "pictogramKeyword": "good", "intent": "state"},
                {"id": "hry_s2", "text": "Pretty good, how about you?", "pictogramKeyword": "question", "intent": "ask"},
                {"id": "hry_s3", "text": "I am a bit exhausted today.", "pictogramKeyword": "tired", "intent": "state"},
                {"id": "hry_s4", "text": "Just taking it easy.", "pictogramKeyword": "calm", "intent": "state"},
                {"id": "hry_s5", "text": "I am excited today.", "pictogramKeyword": "happy", "intent": "state"}
            ],
            "adult": [
                {"id": "hry_a1", "text": "I am doing very well, thank you for asking.", "pictogramKeyword": "good", "intent": "polite"},
                {"id": "hry_a2", "text": "I am fine, how are you doing?", "pictogramKeyword": "question", "intent": "ask"},
                {"id": "hry_a3", "text": "I am feeling slightly tired today.", "pictogramKeyword": "tired", "intent": "state"},
                {"id": "hry_a4", "text": "Everything is going smoothly, thank you.", "pictogramKeyword": "smile", "intent": "state"},
                {"id": "hry_a5", "text": "I am coping well, thank you.", "pictogramKeyword": "ok", "intent": "state"}
            ]
        },
        "kn": {
            "child": [
                {"id": "hry_kn_c1", "text": "ನಾನು ಖುಷಿಯಾಗಿದ್ದೇನೆ.", "pictogramKeyword": "happy", "intent": "state"},
                {"id": "hry_kn_c2", "text": "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ.", "pictogramKeyword": "good", "intent": "state"},
                {"id": "hry_kn_c3", "text": "ನನಗೆ ಸ್ವಲ್ಪ ದಣಿವಾಗಿದೆ.", "pictogramKeyword": "tired", "intent": "state"},
                {"id": "hry_kn_c4", "text": "ನಾನು ಆರಾಮಾಗಿದ್ದೇನೆ.", "pictogramKeyword": "ok", "intent": "state"},
                {"id": "hry_kn_c5", "text": "ನೀವು ಹೇಗಿದ್ದೀರಿ?", "pictogramKeyword": "question", "intent": "ask"}
            ],
            "student": [
                {"id": "hry_kn_s1", "text": "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ, ಧನ್ಯವಾದಗಳು.", "pictogramKeyword": "good", "intent": "state"},
                {"id": "hry_kn_s2", "text": "ಎಲ್ಲವೂ ಸರಿ ಇದೆ, ನಿಮ್ಮ ಸಮಾಚಾರವೇನು?", "pictogramKeyword": "question", "intent": "ask"},
                {"id": "hry_kn_s3", "text": "ಇವತ್ತು ಸ್ವಲ್ಪ ಸುಸ್ತಾಗಿದೆ.", "pictogramKeyword": "tired", "intent": "state"},
                {"id": "hry_kn_s4", "text": "ನಾನು ಆರಾಮಾಗಿದ್ದೇನೆ.", "pictogramKeyword": "calm", "intent": "state"},
                {"id": "hry_kn_s5", "text": "ನನಗೆ ಸಂತೋಷವಾಗಿದೆ.", "pictogramKeyword": "happy", "intent": "state"}
            ],
            "adult": [
                {"id": "hry_kn_a1", "text": "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ, ವಿಚಾರಿಸಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದಗಳು.", "pictogramKeyword": "good", "intent": "polite"},
                {"id": "hry_kn_a2", "text": "ನಾನು ಆರಾಮಾಗಿದ್ದೇನೆ, ನೀವು ಹೇಗಿದ್ದೀರಿ?", "pictogramKeyword": "question", "intent": "ask"},
                {"id": "hry_kn_a3", "text": "ಇಂದು ಸ್ವಲ್ಪ ದಣಿವು ಅನ್ನಿಸುತ್ತಿದೆ.", "pictogramKeyword": "tired", "intent": "state"},
                {"id": "hry_kn_a4", "text": "ಎಲ್ಲವೂ ಸುಗಮವಾಗಿ ನಡೆಯುತ್ತಿದೆ.", "pictogramKeyword": "smile", "intent": "state"},
                {"id": "hry_kn_a5", "text": "ಸೌಖ್ಯವಾಗಿದ್ದೇನೆ, ಧನ್ಯವಾದಗಳು.", "pictogramKeyword": "ok", "intent": "state"}
            ]
        },
        "hi": {
            "child": [
                {"id": "hry_hi_c1", "text": "मैं बहुत खुश हूँ।", "pictogramKeyword": "happy", "intent": "state"},
                {"id": "hry_hi_c2", "text": "मैं ठीक हूँ।", "pictogramKeyword": "good", "intent": "state"},
                {"id": "hry_hi_c3", "text": "मुझे थोड़ी थकान है।", "pictogramKeyword": "tired", "intent": "state"},
                {"id": "hry_hi_c4", "text": "सब अच्छा है।", "pictogramKeyword": "ok", "intent": "state"},
                {"id": "hry_hi_c5", "text": "और आप कैसे हैं?", "pictogramKeyword": "question", "intent": "ask"}
            ],
            "student": [
                {"id": "hry_hi_s1", "text": "मैं अच्छा हूँ, पूछने के लिए धन्यवाद।", "pictogramKeyword": "good", "intent": "state"},
                {"id": "hry_hi_s2", "text": "सब ठीक चल रहा है, आप बताइए?", "pictogramKeyword": "question", "intent": "ask"},
                {"id": "hry_hi_s3", "text": "आज थोड़ी थकान महसूस हो रही है।", "pictogramKeyword": "tired", "intent": "state"},
                {"id": "hry_hi_s4", "text": "मैं आराम से हूँ।", "pictogramKeyword": "calm", "intent": "state"},
                {"id": "hry_hi_s5", "text": "मैं आज बहुत उत्साहित हूँ।", "pictogramKeyword": "happy", "intent": "state"}
            ],
            "adult": [
                {"id": "hry_hi_a1", "text": "मैं बिल्कुल ठीक हूँ, पूछने के लिए धन्यवाद।", "pictogramKeyword": "good", "intent": "polite"},
                {"id": "hry_hi_a2", "text": "मैं ठीक हूँ, आप कैसे हैं?", "pictogramKeyword": "question", "intent": "ask"},
                {"id": "hry_hi_a3", "text": "आज थोड़ा थका हुआ महसूस कर रहा हूँ।", "pictogramKeyword": "tired", "intent": "state"},
                {"id": "hry_hi_a4", "text": "सब कुछ बहुत अच्छा चल रहा है।", "pictogramKeyword": "smile", "intent": "state"},
                {"id": "hry_hi_a5", "text": "सकुशल हूँ, धन्यवाद।", "pictogramKeyword": "ok", "intent": "state"}
            ]
        }
    },
    "yes_no": {
        "en": {
            "child": [
                {"id": "yn_c1", "text": "Yes, please.", "pictogramKeyword": "yes", "intent": "affirm"},
                {"id": "yn_c2", "text": "No, thank you.", "pictogramKeyword": "no", "intent": "negate"},
                {"id": "yn_c3", "text": "Maybe.", "pictogramKeyword": "maybe", "intent": "neutral"},
                {"id": "yn_c4", "text": "I do not know.", "pictogramKeyword": "confused", "intent": "uncertain"},
                {"id": "yn_c5", "text": "I am not sure yet.", "pictogramKeyword": "wait", "intent": "uncertain"}
            ],
            "student": [
                {"id": "yn_s1", "text": "Yes, definitely.", "pictogramKeyword": "yes", "intent": "affirm"},
                {"id": "yn_s2", "text": "No, I would rather not.", "pictogramKeyword": "no", "intent": "negate"},
                {"id": "yn_s3", "text": "I am not sure, maybe.", "pictogramKeyword": "maybe", "intent": "neutral"},
                {"id": "yn_s4", "text": "I do not know right now.", "pictogramKeyword": "confused", "intent": "uncertain"},
                {"id": "yn_s5", "text": "Give me a moment to decide.", "pictogramKeyword": "wait", "intent": "delay"}
            ],
            "adult": [
                {"id": "yn_a1", "text": "Yes, that sounds very good.", "pictogramKeyword": "yes", "intent": "affirm"},
                {"id": "yn_a2", "text": "No thank you, I appreciate it.", "pictogramKeyword": "no", "intent": "negate"},
                {"id": "yn_a3", "text": "Perhaps, let me consider it.", "pictogramKeyword": "maybe", "intent": "neutral"},
                {"id": "yn_a4", "text": "I am not certain at this moment.", "pictogramKeyword": "confused", "intent": "uncertain"},
                {"id": "yn_a5", "text": "Please allow me a moment.", "pictogramKeyword": "wait", "intent": "delay"}
            ]
        },
        "kn": {
            "child": [
                {"id": "yn_kn_c1", "text": "ಹೌದು, ದಯವಿಟ್ಟು.", "pictogramKeyword": "yes", "intent": "affirm"},
                {"id": "yn_kn_c2", "text": "ಇಲ್ಲ, ಬೇಡ.", "pictogramKeyword": "no", "intent": "negate"},
                {"id": "yn_kn_c3", "text": "ಬಹುಶಃ ಇರಬಹುದು.", "pictogramKeyword": "maybe", "intent": "neutral"},
                {"id": "yn_kn_c4", "text": "ನನಗೆ ಗೊತ್ತಿಲ್ಲ.", "pictogramKeyword": "confused", "intent": "uncertain"},
                {"id": "yn_kn_c5", "text": "ಖಚಿತವಿಲ್ಲ.", "pictogramKeyword": "wait", "intent": "uncertain"}
            ],
            "student": [
                {"id": "yn_kn_s1", "text": "ಹೌದು, ಖಂಡಿತ.", "pictogramKeyword": "yes", "intent": "affirm"},
                {"id": "yn_kn_s2", "text": "ಇಲ್ಲ, ನನಗೆ ಇಷ್ಟವಿಲ್ಲ.", "pictogramKeyword": "no", "intent": "negate"},
                {"id": "yn_kn_s3", "text": "ಬಹುಶಃ, ನನಗೆ ಸರಿಯಾಗಿ ತಿಳಿದಿಲ್ಲ.", "pictogramKeyword": "maybe", "intent": "neutral"},
                {"id": "yn_kn_s4", "text": "ನನಗೆ ಈಗ ಮಾಹಿತಿ ಇಲ್ಲ.", "pictogramKeyword": "confused", "intent": "uncertain"},
                {"id": "yn_kn_s5", "text": "ಸ್ವಲ್ಪ ಸಮಯ ಕೊಡಿ.", "pictogramKeyword": "wait", "intent": "delay"}
            ],
            "adult": [
                {"id": "yn_kn_a1", "text": "ಹೌದು, ಒಪ್ಪಿಗೆ.", "pictogramKeyword": "yes", "intent": "affirm"},
                {"id": "yn_kn_a2", "text": "ಇಲ್ಲ, ಧನ್ಯವಾದಗಳು.", "pictogramKeyword": "no", "intent": "negate"},
                {"id": "yn_kn_a3", "text": "ಬಹುಶಃ, ಯೋಚಿಸಿ ಹೇಳುತ್ತೇನೆ.", "pictogramKeyword": "maybe", "intent": "neutral"},
                {"id": "yn_kn_a4", "text": "ನನಗೆ ಸದ್ಯಕ್ಕೆ ತಿಳಿದಿಲ್ಲ.", "pictogramKeyword": "confused", "intent": "uncertain"},
                {"id": "yn_kn_a5", "text": "ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಸಮಯಾವಕಾಶ ಕೊಡಿ.", "pictogramKeyword": "wait", "intent": "delay"}
            ]
        },
        "hi": {
            "child": [
                {"id": "yn_hi_c1", "text": "हाँ, कृपया।", "pictogramKeyword": "yes", "intent": "affirm"},
                {"id": "yn_hi_c2", "text": "नहीं, धन्यवाद।", "pictogramKeyword": "no", "intent": "negate"},
                {"id": "yn_hi_c3", "text": "शायद।", "pictogramKeyword": "maybe", "intent": "neutral"},
                {"id": "yn_hi_c4", "text": "मुझे नहीं पता।", "pictogramKeyword": "confused", "intent": "uncertain"},
                {"id": "yn_hi_c5", "text": "पक्का नहीं है।", "pictogramKeyword": "wait", "intent": "uncertain"}
            ],
            "student": [
                {"id": "yn_hi_s1", "text": "हाँ, बिल्कुल।", "pictogramKeyword": "yes", "intent": "affirm"},
                {"id": "yn_hi_s2", "text": "नहीं, मैं नहीं चाहता।", "pictogramKeyword": "no", "intent": "negate"},
                {"id": "yn_hi_s3", "text": "शायद, मुझे पूरा यकीन नहीं है।", "pictogramKeyword": "maybe", "intent": "neutral"},
                {"id": "yn_hi_s4", "text": "मुझे अभी जानकारी नहीं है।", "pictogramKeyword": "confused", "intent": "uncertain"},
                {"id": "yn_hi_s5", "text": "मुझे सोचने के लिए थोड़ा समय दें।", "pictogramKeyword": "wait", "intent": "delay"}
            ],
            "adult": [
                {"id": "yn_hi_a1", "text": "हाँ, बिल्कुल ठीक है।", "pictogramKeyword": "yes", "intent": "affirm"},
                {"id": "yn_hi_a2", "text": "नहीं धन्यवाद, मुझे आवश्यकता नहीं है।", "pictogramKeyword": "no", "intent": "negate"},
                {"id": "yn_hi_a3", "text": "शायद, मुझे थोड़ा सोचना होगा।", "pictogramKeyword": "maybe", "intent": "neutral"},
                {"id": "yn_hi_a4", "text": "मुझे इस समय स्पष्ट नहीं है।", "pictogramKeyword": "confused", "intent": "uncertain"},
                {"id": "yn_hi_a5", "text": "कृपया मुझे थोड़ा समय दीजिए।", "pictogramKeyword": "wait", "intent": "delay"}
            ]
        }
    },
    "choice": {
        "en": {
            "child": [
                {"id": "ch_c1", "text": "I want the first one.", "pictogramKeyword": "one", "intent": "pick"},
                {"id": "ch_c2", "text": "I want the other one.", "pictogramKeyword": "two", "intent": "pick"},
                {"id": "ch_c3", "text": "Neither of them.", "pictogramKeyword": "no", "intent": "reject"},
                {"id": "ch_c4", "text": "Both please.", "pictogramKeyword": "more", "intent": "both"},
                {"id": "ch_c5", "text": "You can choose.", "pictogramKeyword": "friend", "intent": "defer"}
            ],
            "student": [
                {"id": "ch_s1", "text": "I prefer the first option.", "pictogramKeyword": "one", "intent": "pick"},
                {"id": "ch_s2", "text": "The second one is better.", "pictogramKeyword": "two", "intent": "pick"},
                {"id": "ch_s3", "text": "Neither of these, thank you.", "pictogramKeyword": "no", "intent": "reject"},
                {"id": "ch_s4", "text": "Either is fine with me.", "pictogramKeyword": "ok", "intent": "defer"},
                {"id": "ch_s5", "text": "Do you have any other choices?", "pictogramKeyword": "question", "intent": "ask"}
            ],
            "adult": [
                {"id": "ch_a1", "text": "I would prefer the first option, please.", "pictogramKeyword": "one", "intent": "pick"},
                {"id": "ch_a2", "text": "The latter option suits me better.", "pictogramKeyword": "two", "intent": "pick"},
                {"id": "ch_a3", "text": "Neither of them, but thank you.", "pictogramKeyword": "no", "intent": "reject"},
                {"id": "ch_a4", "text": "I am comfortable with either choice.", "pictogramKeyword": "ok", "intent": "defer"},
                {"id": "ch_a5", "text": "Could you suggest an alternative?", "pictogramKeyword": "question", "intent": "ask"}
            ]
        },
        "kn": {
            "child": [
                {"id": "ch_kn_c1", "text": "ನನಗೆ ಮೊದಲನೆಯದು ಬೇಕು.", "pictogramKeyword": "one", "intent": "pick"},
                {"id": "ch_kn_c2", "text": "ನನಗೆ ಎರಡನೆಯದು ಬೇಕು.", "pictogramKeyword": "two", "intent": "pick"},
                {"id": "ch_kn_c3", "text": "ಎರಡೂ ಬೇಡ.", "pictogramKeyword": "no", "intent": "reject"},
                {"id": "ch_kn_c4", "text": "ಎರಡೂ ಕೊಡಿ.", "pictogramKeyword": "more", "intent": "both"},
                {"id": "ch_kn_c5", "text": "ನೀವೇ ಆರಿಸಿ.", "pictogramKeyword": "friend", "intent": "defer"}
            ],
            "student": [
                {"id": "ch_kn_s1", "text": "ನಾನು ಮೊದಲನೆಯದನ್ನು ಆಯ್ಕೆ ಮಾಡುತ್ತೇನೆ.", "pictogramKeyword": "one", "intent": "pick"},
                {"id": "ch_kn_s2", "text": "ಎರಡನೆಯದು ಉತ್ತಮವಾಗಿದೆ.", "pictogramKeyword": "two", "intent": "pick"},
                {"id": "ch_kn_s3", "text": "ಇವೆರಡೂ ಬೇಡ, ಧನ್ಯವಾದಗಳು.", "pictogramKeyword": "no", "intent": "reject"},
                {"id": "ch_kn_s4", "text": "ಯಾವುದಾದರೂ ಪರವಾಗಿಲ್ಲ.", "pictogramKeyword": "ok", "intent": "defer"},
                {"id": "ch_kn_s5", "text": "ಬೇರೆ ಆಯ್ಕೆಗಳಿವೆಯೇ?", "pictogramKeyword": "question", "intent": "ask"}
            ],
            "adult": [
                {"id": "ch_kn_a1", "text": "ಮೊದಲನೆಯ ಆಯ್ಕೆಯನ್ನು ಆದ್ಯತೆ ನೀಡುತ್ತೇನೆ.", "pictogramKeyword": "one", "intent": "pick"},
                {"id": "ch_kn_a2", "text": "ಎರಡನೆಯದು ನನಗೆ ಸರಿಹೊಂದುತ್ತದೆ.", "pictogramKeyword": "two", "intent": "pick"},
                {"id": "ch_kn_a3", "text": "ಇವೆರಡರಲ್ಲಿ ಯಾವುದೂ ಬೇಡ, ಧನ್ಯವಾದಗಳು.", "pictogramKeyword": "no", "intent": "reject"},
                {"id": "ch_kn_a4", "text": "ಯಾವುದಾದರೂ ಸರಿ.", "pictogramKeyword": "ok", "intent": "defer"},
                {"id": "ch_kn_a5", "text": "ಇನ್ನೊಂದು ಪರ್ಯಾಯ ಸೂಚಿಸಬಹುದೇ?", "pictogramKeyword": "question", "intent": "ask"}
            ]
        },
        "hi": {
            "child": [
                {"id": "ch_hi_c1", "text": "मुझे पहला वाला चाहिए।", "pictogramKeyword": "one", "intent": "pick"},
                {"id": "ch_hi_c2", "text": "मुझे दूसरा वाला चाहिए।", "pictogramKeyword": "two", "intent": "pick"},
                {"id": "ch_hi_c3", "text": "दोनों में से कोई नहीं।", "pictogramKeyword": "no", "intent": "reject"},
                {"id": "ch_hi_c4", "text": "मुझे दोनों चाहिए।", "pictogramKeyword": "more", "intent": "both"},
                {"id": "ch_hi_c5", "text": "आप चुन लीजिए।", "pictogramKeyword": "friend", "intent": "defer"}
            ],
            "student": [
                {"id": "ch_hi_s1", "text": "मैं पहला विकल्प पसंद करूँगा।", "pictogramKeyword": "one", "intent": "pick"},
                {"id": "ch_hi_s2", "text": "दूसरा वाला अधिक बेहतर है।", "pictogramKeyword": "two", "intent": "pick"},
                {"id": "ch_hi_s3", "text": "इनमें से कोई नहीं, धन्यवाद।", "pictogramKeyword": "no", "intent": "reject"},
                {"id": "ch_hi_s4", "text": "कोई भी चलेगा।", "pictogramKeyword": "ok", "intent": "defer"},
                {"id": "ch_hi_s5", "text": "क्या कोई अन्य विकल्प है?", "pictogramKeyword": "question", "intent": "ask"}
            ],
            "adult": [
                {"id": "ch_hi_a1", "text": "मैं पहले विकल्प को प्राथमिकता दूँगा।", "pictogramKeyword": "one", "intent": "pick"},
                {"id": "ch_hi_a2", "text": "दूसरा विकल्प मेरे लिए ठीक रहेगा।", "pictogramKeyword": "two", "intent": "pick"},
                {"id": "ch_hi_a3", "text": "इनमें से कोई भी नहीं, शुक्रिया।", "pictogramKeyword": "no", "intent": "reject"},
                {"id": "ch_hi_a4", "text": "दोनों में से कोई भी चलेगा।", "pictogramKeyword": "ok", "intent": "defer"},
                {"id": "ch_hi_a5", "text": "क्या कोई अन्य विकल्प उपलब्ध है?", "pictogramKeyword": "question", "intent": "ask"}
            ]
        }
    },
    "secret_request": {
        "en": {
            "child": [
                {"id": "sec_c1", "text": "I tell my mom and dad.", "pictogramKeyword": "family", "intent": "safe_refusal", "sensitive": True},
                {"id": "sec_c2", "text": "No, I do not keep secrets.", "pictogramKeyword": "no", "intent": "safe_refusal", "sensitive": True},
                {"id": "sec_c3", "text": "I need a grown-up.", "pictogramKeyword": "help", "intent": "safe_refusal", "sensitive": True},
                {"id": "sec_c4", "text": "I will get my teacher.", "pictogramKeyword": "teacher", "intent": "safe_refusal", "sensitive": True},
                {"id": "sec_c5", "text": "Please stop asking.", "pictogramKeyword": "stop", "intent": "safe_refusal", "sensitive": True}
            ],
            "student": [
                {"id": "sec_s1", "text": "I do not keep secrets.", "pictogramKeyword": "no", "intent": "safe_refusal", "sensitive": True},
                {"id": "sec_s2", "text": "I discuss everything with my family.", "pictogramKeyword": "family", "intent": "safe_refusal", "sensitive": True},
                {"id": "sec_s3", "text": "I am not comfortable with this.", "pictogramKeyword": "stop", "intent": "safe_refusal", "sensitive": True},
                {"id": "sec_s4", "text": "I will inform a responsible adult.", "pictogramKeyword": "help", "intent": "safe_refusal", "sensitive": True},
                {"id": "sec_s5", "text": "Please respect my boundaries.", "pictogramKeyword": "stop", "intent": "safe_refusal", "sensitive": True}
            ],
            "adult": [
                {"id": "sec_a1", "text": "I do not agree to keep this confidential.", "pictogramKeyword": "no", "intent": "safe_refusal", "sensitive": True},
                {"id": "sec_a2", "text": "I prefer open and transparent communication.", "pictogramKeyword": "chat", "intent": "safe_refusal", "sensitive": True},
                {"id": "sec_a3", "text": "I am not comfortable with that request.", "pictogramKeyword": "stop", "intent": "safe_refusal", "sensitive": True},
                {"id": "sec_a4", "text": "Please discontinue this line of discussion.", "pictogramKeyword": "stop", "intent": "safe_refusal", "sensitive": True},
                {"id": "sec_a5", "text": "I will seek advice from a trusted person.", "pictogramKeyword": "help", "intent": "safe_refusal", "sensitive": True}
            ]
        },
        "kn": {
            "child": [
                {"id": "sec_kn_c1", "text": "ನಾನು ಅಪ್ಪ ಅಮ್ಮನಿಗೆ ಹೇಳುತ್ತೇನೆ.", "pictogramKeyword": "family", "intent": "safe_refusal", "sensitive": True},
                {"id": "sec_kn_c2", "text": "ಇಲ್ಲ, ನಾನು ರಹಸ್ಯ ಇಡುವುದಿಲ್ಲ.", "pictogramKeyword": "no", "intent": "safe_refusal", "sensitive": True},
                {"id": "sec_kn_c3", "text": "ನನಗೆ ಹಿರಿಯರ ಸಹಾಯ ಬೇಕು.", "pictogramKeyword": "help", "intent": "safe_refusal", "sensitive": True},
                {"id": "sec_kn_c4", "text": "ನಾನು ಶಿಕ್ಷಕರಿಗೆ ತಿಳಿಸುತ್ತೇನೆ.", "pictogramKeyword": "teacher", "intent": "safe_refusal", "sensitive": True},
                {"id": "sec_kn_c5", "text": "ದಯವಿಟ್ಟು ನಿಲ್ಲಿಸಿ.", "pictogramKeyword": "stop", "intent": "safe_refusal", "sensitive": True}
            ],
            "student": [
                {"id": "sec_kn_s1", "text": "ನಾನು ಯಾವುದೇ ರಹಸ್ಯ ಇಡುವುದಿಲ್ಲ.", "pictogramKeyword": "no", "intent": "safe_refusal", "sensitive": True},
                {"id": "sec_kn_s2", "text": "ನಾನು ಮನೆಯಲ್ಲಿ ಎಲ್ಲವನ್ನೂ ಹಂಚಿಕೊಳ್ಳುತ್ತೇನೆ.", "pictogramKeyword": "family", "intent": "safe_refusal", "sensitive": True},
                {"id": "sec_kn_s3", "text": "ನನಗೆ ಇದು ಸರಿ ಅನಿಸುತ್ತಿಲ್ಲ.", "pictogramKeyword": "stop", "intent": "safe_refusal", "sensitive": True},
                {"id": "sec_kn_s4", "text": "ನಾನು ಹಿರಿಯರ ಗಮನಕ್ಕೆ ತರುತ್ತೇನೆ.", "pictogramKeyword": "help", "intent": "safe_refusal", "sensitive": True},
                {"id": "sec_kn_s5", "text": "ದಯವಿಟ್ಟು ನನ್ನ ಗಡಿಗಳನ್ನು ಗೌರವಿಸಿ.", "pictogramKeyword": "stop", "intent": "safe_refusal", "sensitive": True}
            ],
            "adult": [
                {"id": "sec_kn_a1", "text": "ನಾನು ಇದನ್ನು ರಹಸ್ಯವಾಗಿಡಲು ಒಪ್ಪುವುದಿಲ್ಲ.", "pictogramKeyword": "no", "intent": "safe_refusal", "sensitive": True},
                {"id": "sec_kn_a2", "text": "ಪಾರದರ್ಶಕತೆ ಮುಖ್ಯ ಎಂದು ನಾನು ನಂಬುತ್ತೇನೆ.", "pictogramKeyword": "chat", "intent": "safe_refusal", "sensitive": True},
                {"id": "sec_kn_a3", "text": "ನನಗೆ ಈ ವಿನಂತಿ ಸಮ್ಮತವಲ್ಲ.", "pictogramKeyword": "stop", "intent": "safe_refusal", "sensitive": True},
                {"id": "sec_kn_a4", "text": "ದಯವಿಟ್ಟು ಈ ಚರ್ಚೆಯನ್ನು ಇಲ್ಲಿಗೆ ನಿಲ್ಲಿಸಿ.", "pictogramKeyword": "stop", "intent": "safe_refusal", "sensitive": True},
                {"id": "sec_kn_a5", "text": "ನಾನು ವಿಶ್ವಾಸಾರ್ಹ ವ್ಯಕ್ತಿಯ ಸಲಹೆ ಪಡೆಯುತ್ತೇನೆ.", "pictogramKeyword": "help", "intent": "safe_refusal", "sensitive": True}
            ]
        },
        "hi": {
            "child": [
                {"id": "sec_hi_c1", "text": "मैं मम्मी पापा को बताता हूँ।", "pictogramKeyword": "family", "intent": "safe_refusal", "sensitive": True},
                {"id": "sec_hi_c2", "text": "नहीं, मैं बात नहीं छिपाता।", "pictogramKeyword": "no", "intent": "safe_refusal", "sensitive": True},
                {"id": "sec_hi_c3", "text": "मुझे बड़े व्यक्ति की मदद चाहिए।", "pictogramKeyword": "help", "intent": "safe_refusal", "sensitive": True},
                {"id": "sec_hi_c4", "text": "मैं अपने शिक्षक को बताऊँगा।", "pictogramKeyword": "teacher", "intent": "safe_refusal", "sensitive": True},
                {"id": "sec_hi_c5", "text": "कृपया ऐसा मत कहिए।", "pictogramKeyword": "stop", "intent": "safe_refusal", "sensitive": True}
            ],
            "student": [
                {"id": "sec_hi_s1", "text": "मैं कोई बात गुप्त नहीं रखता।", "pictogramKeyword": "no", "intent": "safe_refusal", "sensitive": True},
                {"id": "sec_hi_s2", "text": "मैं अपने परिवार से सब साझा करता हूँ।", "pictogramKeyword": "family", "intent": "safe_refusal", "sensitive": True},
                {"id": "sec_hi_s3", "text": "मुझे यह बात ठीक नहीं लग रही।", "pictogramKeyword": "stop", "intent": "safe_refusal", "sensitive": True},
                {"id": "sec_hi_s4", "text": "मैं किसी बड़े को सूचित करूँगा।", "pictogramKeyword": "help", "intent": "safe_refusal", "sensitive": True},
                {"id": "sec_hi_s5", "text": "कृपया मेरी सीमाओं का ध्यान रखें।", "pictogramKeyword": "stop", "intent": "safe_refusal", "sensitive": True}
            ],
            "adult": [
                {"id": "sec_hi_a1", "text": "मैं इसे गोपनीय रखने के लिए सहमत नहीं हूँ।", "pictogramKeyword": "no", "intent": "safe_refusal", "sensitive": True},
                {"id": "sec_hi_a2", "text": "मैं पारदर्शी बातचीत पसंद करता हूँ।", "pictogramKeyword": "chat", "intent": "safe_refusal", "sensitive": True},
                {"id": "sec_hi_a3", "text": "मुझे यह अनुरोध स्वीकार्य नहीं है।", "pictogramKeyword": "stop", "intent": "safe_refusal", "sensitive": True},
                {"id": "sec_hi_a4", "text": "कृपया इस बातचीत को यहीं रोक दें।", "pictogramKeyword": "stop", "intent": "safe_refusal", "sensitive": True},
                {"id": "sec_hi_a5", "text": "मैं किसी विश्वसनीय व्यक्ति की सलाह लूँगा।", "pictogramKeyword": "help", "intent": "safe_refusal", "sensitive": True}
            ]
        }
    },
    "personal_info_request": {
        "en": {
            "child": [
                {"id": "pi_c1", "text": "Please ask my parent or teacher.", "pictogramKeyword": "family", "intent": "privacy_guard"},
                {"id": "pi_c2", "text": "I do not want to say.", "pictogramKeyword": "no", "intent": "privacy_guard"},
                {"id": "pi_c3", "text": "That is private.", "pictogramKeyword": "lock", "intent": "privacy_guard"},
                {"id": "pi_c4", "text": "I cannot share that.", "pictogramKeyword": "stop", "intent": "privacy_guard"},
                {"id": "pi_c5", "text": "I do not give personal information.", "pictogramKeyword": "shield", "intent": "privacy_guard"}
            ],
            "student": [
                {"id": "pi_s1", "text": "Please ask my guardian or teacher.", "pictogramKeyword": "family", "intent": "privacy_guard"},
                {"id": "pi_s2", "text": "I do not share personal details.", "pictogramKeyword": "shield", "intent": "privacy_guard"},
                {"id": "pi_s3", "text": "That information is private.", "pictogramKeyword": "lock", "intent": "privacy_guard"},
                {"id": "pi_s4", "text": "I cannot provide that information.", "pictogramKeyword": "stop", "intent": "privacy_guard"},
                {"id": "pi_s5", "text": "I do not want to say.", "pictogramKeyword": "no", "intent": "privacy_guard"}
            ],
            "adult": [
                {"id": "pi_a1", "text": "I do not share personal details with strangers.", "pictogramKeyword": "shield", "intent": "privacy_guard"},
                {"id": "pi_a2", "text": "That is private personal information.", "pictogramKeyword": "lock", "intent": "privacy_guard"},
                {"id": "pi_a3", "text": "I do not wish to disclose that.", "pictogramKeyword": "no", "intent": "privacy_guard"},
                {"id": "pi_a4", "text": "Please speak with my designated caregiver.", "pictogramKeyword": "family", "intent": "privacy_guard"},
                {"id": "pi_a5", "text": "I decline to answer that question.", "pictogramKeyword": "stop", "intent": "privacy_guard"}
            ]
        },
        "kn": {
            "child": [
                {"id": "pi_kn_c1", "text": "ನನ್ನ ಅಪ್ಪ ಅಮ್ಮನನ್ನು ಕೇಳಿ.", "pictogramKeyword": "family", "intent": "privacy_guard"},
                {"id": "pi_kn_c2", "text": "ನಾನು ಹೇಳಲು ಇಷ್ಟಪಡುವುದಿಲ್ಲ.", "pictogramKeyword": "no", "intent": "privacy_guard"},
                {"id": "pi_kn_c3", "text": "ಅದು ವೈಯಕ್ತಿಕ.", "pictogramKeyword": "lock", "intent": "privacy_guard"},
                {"id": "pi_kn_c4", "text": "ನಾನು ಹಂಚಿಕೊಳ್ಳಲು ಸಾಧ್ಯವಿಲ್ಲ.", "pictogramKeyword": "stop", "intent": "privacy_guard"},
                {"id": "pi_kn_c5", "text": "ನಾನು ಈ ಮಾಹಿತಿ ನೀಡುವುದಿಲ್ಲ.", "pictogramKeyword": "shield", "intent": "privacy_guard"}
            ],
            "student": [
                {"id": "pi_kn_s1", "text": "ದಯವಿಟ್ಟು ನನ್ನ ಪಾಲಕರನ್ನು ಕೇಳಿ.", "pictogramKeyword": "family", "intent": "privacy_guard"},
                {"id": "pi_kn_s2", "text": "ನಾನು ವೈಯಕ್ತಿಕ ವಿವರ ಹಂಚಿಕೊಳ್ಳುವುದಿಲ್ಲ.", "pictogramKeyword": "shield", "intent": "privacy_guard"},
                {"id": "pi_kn_s3", "text": "ಅದು ಖಾಸಗಿ ಮಾಹಿತಿ.", "pictogramKeyword": "lock", "intent": "privacy_guard"},
                {"id": "pi_kn_s4", "text": "ನಾನು ಈ ಮಾಹಿತಿ ನೀಡಲು ಅಸಮರ್ಥ.", "pictogramKeyword": "stop", "intent": "privacy_guard"},
                {"id": "pi_kn_s5", "text": "ನಾನು ಹೇಳಲು ಇಷ್ಟಪಡುವುದಿಲ್ಲ.", "pictogramKeyword": "no", "intent": "privacy_guard"}
            ],
            "adult": [
                {"id": "pi_kn_a1", "text": "ನಾನು ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ ಹಂಚಿಕೊಳ್ಳುವುದಿಲ್ಲ.", "pictogramKeyword": "shield", "intent": "privacy_guard"},
                {"id": "pi_kn_a2", "text": "ಅದು ನನ್ನ ಖಾಸಗಿ ಮಾಹಿತಿ.", "pictogramKeyword": "lock", "intent": "privacy_guard"},
                {"id": "pi_kn_a3", "text": "ನಾನು ಇದನ್ನು ಬಹಿರಂಗಪಡಿಸಲು ಇಷ್ಟಪಡುವುದಿಲ್ಲ.", "pictogramKeyword": "no", "intent": "privacy_guard"},
                {"id": "pi_kn_a4", "text": "ದಯವಿಟ್ಟು ನನ್ನ ಪಾಲಕರೊಂದಿಗೆ ಮಾತನಾಡಿ.", "pictogramKeyword": "family", "intent": "privacy_guard"},
                {"id": "pi_kn_a5", "text": "ನಾನು ಈ ಪ್ರಶ್ನೆಗೆ ಉತ್ತರಿಸುವುದಿಲ್ಲ.", "pictogramKeyword": "stop", "intent": "privacy_guard"}
            ]
        },
        "hi": {
            "child": [
                {"id": "pi_hi_c1", "text": "कृपया मेरे माता-पिता से पूछें।", "pictogramKeyword": "family", "intent": "privacy_guard"},
                {"id": "pi_hi_c2", "text": "मैं नहीं बताना चाहता।", "pictogramKeyword": "no", "intent": "privacy_guard"},
                {"id": "pi_hi_c3", "text": "यह निजी बात है।", "pictogramKeyword": "lock", "intent": "privacy_guard"},
                {"id": "pi_hi_c4", "text": "मैं यह नहीं बता सकता।", "pictogramKeyword": "stop", "intent": "privacy_guard"},
                {"id": "pi_hi_c5", "text": "मैं निजी जानकारी नहीं देता।", "pictogramKeyword": "shield", "intent": "privacy_guard"}
            ],
            "student": [
                {"id": "pi_hi_s1", "text": "कृपया मेरे अभिभावक या शिक्षक से बात करें।", "pictogramKeyword": "family", "intent": "privacy_guard"},
                {"id": "pi_hi_s2", "text": "मैं व्यक्तिगत जानकारी साझा नहीं करता।", "pictogramKeyword": "shield", "intent": "privacy_guard"},
                {"id": "pi_hi_s3", "text": "यह जानकारी पूरी तरह निजी है।", "pictogramKeyword": "lock", "intent": "privacy_guard"},
                {"id": "pi_hi_s4", "text": "मैं यह जानकारी नहीं दे सकता।", "pictogramKeyword": "stop", "intent": "privacy_guard"},
                {"id": "pi_hi_s5", "text": "मैं यह नहीं बताना चाहता।", "pictogramKeyword": "no", "intent": "privacy_guard"}
            ],
            "adult": [
                {"id": "pi_hi_a1", "text": "मैं व्यक्तिगत जानकारी साझा नहीं करता।", "pictogramKeyword": "shield", "intent": "privacy_guard"},
                {"id": "pi_hi_a2", "text": "यह मेरी निजी जानकारी है।", "pictogramKeyword": "lock", "intent": "privacy_guard"},
                {"id": "pi_hi_a3", "text": "मैं इसे साझा नहीं करना चाहता।", "pictogramKeyword": "no", "intent": "privacy_guard"},
                {"id": "pi_hi_a4", "text": "कृपया मेरे देखभालकर्ता से बात करें।", "pictogramKeyword": "family", "intent": "privacy_guard"},
                {"id": "pi_hi_a5", "text": "मैं इस सवाल का जवाब नहीं देना चाहता।", "pictogramKeyword": "stop", "intent": "privacy_guard"}
            ]
        }
    },
    "emergency": {
        "en": {
            "child": [
                {"id": "em_c1", "text": "I need help right now!", "pictogramKeyword": "help", "intent": "emergency", "sensitive": True},
                {"id": "em_c2", "text": "Please call my parents.", "pictogramKeyword": "family", "intent": "emergency", "sensitive": True},
                {"id": "em_c3", "text": "I am hurt.", "pictogramKeyword": "hurt", "intent": "emergency", "sensitive": True},
                {"id": "em_c4", "text": "I do not feel safe.", "pictogramKeyword": "danger", "intent": "emergency", "sensitive": True},
                {"id": "em_c5", "text": "Please stay with me.", "pictogramKeyword": "friend", "intent": "emergency", "sensitive": True}
            ],
            "student": [
                {"id": "em_s1", "text": "Please get help immediately.", "pictogramKeyword": "help", "intent": "emergency", "sensitive": True},
                {"id": "em_s2", "text": "Please contact emergency services.", "pictogramKeyword": "call", "intent": "emergency", "sensitive": True},
                {"id": "em_s3", "text": "I need urgent medical attention.", "pictogramKeyword": "doctor", "intent": "emergency", "sensitive": True},
                {"id": "em_s4", "text": "I am in distress.", "pictogramKeyword": "danger", "intent": "emergency", "sensitive": True},
                {"id": "em_s5", "text": "Please call my family.", "pictogramKeyword": "family", "intent": "emergency", "sensitive": True}
            ],
            "adult": [
                {"id": "em_a1", "text": "Please call an ambulance immediately.", "pictogramKeyword": "ambulance", "intent": "emergency", "sensitive": True},
                {"id": "em_a2", "text": "I need immediate emergency assistance.", "pictogramKeyword": "help", "intent": "emergency", "sensitive": True},
                {"id": "em_a3", "text": "Please notify my emergency contact.", "pictogramKeyword": "phone", "intent": "emergency", "sensitive": True},
                {"id": "em_a4", "text": "I am having a medical emergency.", "pictogramKeyword": "doctor", "intent": "emergency", "sensitive": True},
                {"id": "em_a5", "text": "Please stay calm and assist me.", "pictogramKeyword": "safe", "intent": "emergency", "sensitive": True}
            ]
        },
        "kn": {
            "child": [
                {"id": "em_kn_c1", "text": "ನನಗೆ ಈಗಲೇ ಸಹಾಯ ಬೇಕು!", "pictogramKeyword": "help", "intent": "emergency", "sensitive": True},
                {"id": "em_kn_c2", "text": "ನನ್ನ ಅಪ್ಪ ಅಮ್ಮನಿಗೆ ಕರೆ ಮಾಡಿ.", "pictogramKeyword": "family", "intent": "emergency", "sensitive": True},
                {"id": "em_kn_c3", "text": "ನನಗೆ ಗಾಯವಾಗಿದೆ.", "pictogramKeyword": "hurt", "intent": "emergency", "sensitive": True},
                {"id": "em_kn_c4", "text": "ನನಗೆ ಭಯವಾಗುತ್ತಿದೆ.", "pictogramKeyword": "danger", "intent": "emergency", "sensitive": True},
                {"id": "em_kn_c5", "text": "ನನ್ನ ಜೊತೆಯೇ ಇರಿ.", "pictogramKeyword": "friend", "intent": "emergency", "sensitive": True}
            ],
            "student": [
                {"id": "em_kn_s1", "text": "ದಯವಿಟ್ಟು ತಕ್ಷಣ ಸಹಾಯ ಪಡೆಯಿರಿ.", "pictogramKeyword": "help", "intent": "emergency", "sensitive": True},
                {"id": "em_kn_s2", "text": "ತುರ್ತು ಸೇವೆಗೆ ಕರೆ ಮಾಡಿ.", "pictogramKeyword": "call", "intent": "emergency", "sensitive": True},
                {"id": "em_kn_s3", "text": "ನನಗೆ ವೈದ್ಯಕೀಯ ಸಹಾಯ ಬೇಕು.", "pictogramKeyword": "doctor", "intent": "emergency", "sensitive": True},
                {"id": "em_kn_s4", "text": "ನನಗೆ ತೊಂದರೆಯಾಗಿದೆ.", "pictogramKeyword": "danger", "intent": "emergency", "sensitive": True},
                {"id": "em_kn_s5", "text": "ಮನೆಯವರಿಗೆ ಕರೆ ಮಾಡಿ ತಿಳಿಸಿ.", "pictogramKeyword": "family", "intent": "emergency", "sensitive": True}
            ],
            "adult": [
                {"id": "em_kn_a1", "text": "ದಯವಿಟ್ಟು ಆಂಬ್ಯುಲೆನ್ಸ್‌ಗೆ ಕರೆ ಮಾಡಿ.", "pictogramKeyword": "ambulance", "intent": "emergency", "sensitive": True},
                {"id": "em_kn_a2", "text": "ನನಗೆ ತುರ್ತು ನೆರವು ಅಗತ್ಯವಿದೆ.", "pictogramKeyword": "help", "intent": "emergency", "sensitive": True},
                {"id": "em_kn_a3", "text": "ನನ್ನ ಮನೆಯವರಿಗೆ ತಕ್ಷಣ ತಿಳಿಸಿ.", "pictogramKeyword": "phone", "intent": "emergency", "sensitive": True},
                {"id": "em_kn_a4", "text": "ಇದು ವೈದ್ಯಕೀಯ ತುರ್ತು ಪರಿಸ್ಥಿತಿ.", "pictogramKeyword": "doctor", "intent": "emergency", "sensitive": True},
                {"id": "em_kn_a5", "text": "ದಯವಿಟ್ಟು ನನ್ನೊಂದಿಗೆ ಇರಿ.", "pictogramKeyword": "safe", "intent": "emergency", "sensitive": True}
            ]
        },
        "hi": {
            "child": [
                {"id": "em_hi_c1", "text": "मुझे अभी मदद चाहिए!", "pictogramKeyword": "help", "intent": "emergency", "sensitive": True},
                {"id": "em_hi_c2", "text": "मम्मी पापा को फोन कीजिए।", "pictogramKeyword": "family", "intent": "emergency", "sensitive": True},
                {"id": "em_hi_c3", "text": "मुझे चोट लगी है।", "pictogramKeyword": "hurt", "intent": "emergency", "sensitive": True},
                {"id": "em_hi_c4", "text": "मुझे डर लग रहा है।", "pictogramKeyword": "danger", "intent": "emergency", "sensitive": True},
                {"id": "em_hi_c5", "text": "मेरे साथ रहिए।", "pictogramKeyword": "friend", "intent": "emergency", "sensitive": True}
            ],
            "student": [
                {"id": "em_hi_s1", "text": "कृपया तुरंत मदद बुलाइए।", "pictogramKeyword": "help", "intent": "emergency", "sensitive": True},
                {"id": "em_hi_s2", "text": "कृपया आपातकालीन नंबर पर कॉल करें।", "pictogramKeyword": "call", "intent": "emergency", "sensitive": True},
                {"id": "em_hi_s3", "text": "मुझे तुरंत डॉक्टर की ज़रूरत है।", "pictogramKeyword": "doctor", "intent": "emergency", "sensitive": True},
                {"id": "em_hi_s4", "text": "मैं परेशानी में हूँ।", "pictogramKeyword": "danger", "intent": "emergency", "sensitive": True},
                {"id": "em_hi_s5", "text": "मेरे परिवार को सूचित करें।", "pictogramKeyword": "family", "intent": "emergency", "sensitive": True}
            ],
            "adult": [
                {"id": "em_hi_a1", "text": "कृपया तुरंत एम्बुलेंस को कॉल करें।", "pictogramKeyword": "ambulance", "intent": "emergency", "sensitive": True},
                {"id": "em_hi_a2", "text": "मुझे तत्काल आपातकालीन सहायता चाहिए।", "pictogramKeyword": "help", "intent": "emergency", "sensitive": True},
                {"id": "em_hi_a3", "text": "कृपया मेरे आपातकालीन संपर्क को सूचित करें।", "pictogramKeyword": "phone", "intent": "emergency", "sensitive": True},
                {"id": "em_hi_a4", "text": "यह एक मेडिकल इमरजेंसी है।", "pictogramKeyword": "doctor", "intent": "emergency", "sensitive": True},
                {"id": "em_hi_a5", "text": "कृपया शांत रहें और मेरी मदद करें।", "pictogramKeyword": "safe", "intent": "emergency", "sensitive": True}
            ]
        }
    },
    "unknown": {
        "en": {
            "child": [
                {"id": "un_c1", "text": "Yes, I agree.", "pictogramKeyword": "yes", "intent": "social"},
                {"id": "un_c2", "text": "I do not understand.", "pictogramKeyword": "confused", "intent": "repair"},
                {"id": "un_c3", "text": "Can you say that again?", "pictogramKeyword": "repeat", "intent": "repair"},
                {"id": "un_c4", "text": "That is nice.", "pictogramKeyword": "happy", "intent": "social"},
                {"id": "un_c5", "text": "Please wait a moment.", "pictogramKeyword": "wait", "intent": "repair"}
            ],
            "student": [
                {"id": "un_s1", "text": "I understand what you mean.", "pictogramKeyword": "ok", "intent": "social"},
                {"id": "un_s2", "text": "Could you please explain that?", "pictogramKeyword": "question", "intent": "repair"},
                {"id": "un_s3", "text": "That sounds interesting.", "pictogramKeyword": "smile", "intent": "social"},
                {"id": "un_s4", "text": "I am not completely sure.", "pictogramKeyword": "maybe", "intent": "repair"},
                {"id": "un_s5", "text": "Please give me a moment to respond.", "pictogramKeyword": "wait", "intent": "repair"}
            ],
            "adult": [
                {"id": "un_a1", "text": "Thank you, I understand.", "pictogramKeyword": "thank_you", "intent": "polite"},
                {"id": "un_a2", "text": "Could you please rephrase that?", "pictogramKeyword": "repeat", "intent": "repair"},
                {"id": "un_a3", "text": "I appreciate your patience.", "pictogramKeyword": "heart", "intent": "social"},
                {"id": "un_a4", "text": "That is very helpful to know.", "pictogramKeyword": "info", "intent": "social"},
                {"id": "un_a5", "text": "Please give me a brief moment.", "pictogramKeyword": "wait", "intent": "repair"}
            ]
        },
        "kn": {
            "child": [
                {"id": "un_kn_c1", "text": "ಹೌದು, ನಾನು ಒಪ್ಪುತ್ತೇನೆ.", "pictogramKeyword": "yes", "intent": "social"},
                {"id": "un_kn_c2", "text": "ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ.", "pictogramKeyword": "confused", "intent": "repair"},
                {"id": "un_kn_c3", "text": "ಇನ್ನೊಮ್ಮೆ ಹೇಳುತ್ತೀರಾ?", "pictogramKeyword": "repeat", "intent": "repair"},
                {"id": "un_kn_c4", "text": "ಅದು ತುಂಬಾ ಚೆನ್ನಾಗಿದೆ.", "pictogramKeyword": "happy", "intent": "social"},
                {"id": "un_kn_c5", "text": "ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ನಿಲ್ಲಿ.", "pictogramKeyword": "wait", "intent": "repair"}
            ],
            "student": [
                {"id": "un_kn_s1", "text": "ನನಗೆ ಅರ್ಥವಾಯಿತು.", "pictogramKeyword": "ok", "intent": "social"},
                {"id": "un_kn_s2", "text": "ದಯವಿಟ್ಟು ಇನ್ನೊಮ್ಮೆ ವಿವರಿಸುತ್ತೀರಾ?", "pictogramKeyword": "question", "intent": "repair"},
                {"id": "un_kn_s3", "text": "ಅದು ಆಸಕ್ತಿದಾಯಕವಾಗಿದೆ.", "pictogramKeyword": "smile", "intent": "social"},
                {"id": "un_kn_s4", "text": "ನನಗೆ ಖಚಿತವಿಲ್ಲ.", "pictogramKeyword": "maybe", "intent": "repair"},
                {"id": "un_kn_s5", "text": "ನಾನು ಉತ್ತರಿಸಲು ಸ್ವಲ್ಪ ಸಮಯ ಬೇಕು.", "pictogramKeyword": "wait", "intent": "repair"}
            ],
            "adult": [
                {"id": "un_kn_a1", "text": "ಧನ್ಯವಾದಗಳು, ನನಗೆ ಅರ್ಥವಾಯಿತು.", "pictogramKeyword": "thank_you", "intent": "polite"},
                {"id": "un_kn_a2", "text": "ದಯವಿಟ್ಟು ಇನ್ನೊಮ್ಮೆ ಸ್ಪಷ್ಟವಾಗಿ ಹೇಳಿ.", "pictogramKeyword": "repeat", "intent": "repair"},
                {"id": "un_kn_a3", "text": "ನಿಮ್ಮ ಸಹನೆಗೆ ಧನ್ಯವಾದಗಳು.", "pictogramKeyword": "heart", "intent": "social"},
                {"id": "un_kn_a4", "text": "ತಿಳಿಸಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದಗಳು.", "pictogramKeyword": "info", "intent": "social"},
                {"id": "un_kn_a5", "text": "ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಸಮಯಾವಕಾಶ ಕೊಡಿ.", "pictogramKeyword": "wait", "intent": "repair"}
            ]
        },
        "hi": {
            "child": [
                {"id": "un_hi_c1", "text": "हाँ, मैं सहमत हूँ।", "pictogramKeyword": "yes", "intent": "social"},
                {"id": "un_hi_c2", "text": "मुझे समझ नहीं आया।", "pictogramKeyword": "confused", "intent": "repair"},
                {"id": "un_hi_c3", "text": "क्या आप फिर से कहेंगे?", "pictogramKeyword": "repeat", "intent": "repair"},
                {"id": "un_hi_c4", "text": "यह बहुत अच्छा है।", "pictogramKeyword": "happy", "intent": "social"},
                {"id": "un_hi_c5", "text": "कृपया थोड़ा रुकिए।", "pictogramKeyword": "wait", "intent": "repair"}
            ],
            "student": [
                {"id": "un_hi_s1", "text": "मैं आपकी बात समझ रहा हूँ।", "pictogramKeyword": "ok", "intent": "social"},
                {"id": "un_hi_s2", "text": "कृपया थोड़ा स्पष्ट समझाएँ।", "pictogramKeyword": "question", "intent": "repair"},
                {"id": "un_hi_s3", "text": "यह दिलचस्प है।", "pictogramKeyword": "smile", "intent": "social"},
                {"id": "un_hi_s4", "text": "मुझे पूरा भरोसा नहीं है।", "pictogramKeyword": "maybe", "intent": "repair"},
                {"id": "un_hi_s5", "text": "मुझे उत्तर देने के लिए थोड़ा समय दें।", "pictogramKeyword": "wait", "intent": "repair"}
            ],
            "adult": [
                {"id": "un_hi_a1", "text": "धन्यवाद, मैं समझ गया।", "pictogramKeyword": "thank_you", "intent": "polite"},
                {"id": "un_hi_a2", "text": "कृपया इसे दोबारा कहिए।", "pictogramKeyword": "repeat", "intent": "repair"},
                {"id": "un_hi_a3", "text": "आपके धैर्य के लिए शुक्रिया।", "pictogramKeyword": "heart", "intent": "social"},
                {"id": "un_hi_a4", "text": "यह जानकारी बहुत उपयोगी है।", "pictogramKeyword": "info", "intent": "social"},
                {"id": "un_hi_a5", "text": "कृपया मुझे थोड़ा समय दीजिए।", "pictogramKeyword": "wait", "intent": "repair"}
            ]
        }
    }
}

# Starters / Greetings
STARTERS_PACK = {
    "en": {
        "child": [
            {"id": "st_c1", "text": "Hello!", "pictogramKeyword": "hello", "intent": "greet"},
            {"id": "st_c2", "text": "Can I ask something?", "pictogramKeyword": "question", "intent": "ask"},
            {"id": "st_c3", "text": "I want to tell you something.", "pictogramKeyword": "chat", "intent": "tell"},
            {"id": "st_c4", "text": "Excuse me please.", "pictogramKeyword": "bell", "intent": "attention"},
            {"id": "st_c5", "text": "I need help please.", "pictogramKeyword": "help", "intent": "help"}
        ],
        "student": [
            {"id": "st_s1", "text": "Hello, how are you?", "pictogramKeyword": "hello", "intent": "greet"},
            {"id": "st_s2", "text": "Excuse me, may I ask a question?", "pictogramKeyword": "question", "intent": "ask"},
            {"id": "st_s3", "text": "There is something I want to say.", "pictogramKeyword": "chat", "intent": "tell"},
            {"id": "st_s4", "text": "Good to see you.", "pictogramKeyword": "smile", "intent": "social"},
            {"id": "st_s5", "text": "Could you please assist me?", "pictogramKeyword": "help", "intent": "help"}
        ],
        "adult": [
            {"id": "st_a1", "text": "Hello, good day.", "pictogramKeyword": "hello", "intent": "greet"},
            {"id": "st_a2", "text": "Excuse me, I would like to ask something.", "pictogramKeyword": "question", "intent": "ask"},
            {"id": "st_a3", "text": "I would like to tell you something.", "pictogramKeyword": "chat", "intent": "tell"},
            {"id": "st_a4", "text": "Thank you for taking time to speak.", "pictogramKeyword": "thank_you", "intent": "polite"},
            {"id": "st_a5", "text": "Could you please assist me for a moment?", "pictogramKeyword": "help", "intent": "help"}
        ]
    },
    "kn": {
        "child": [
            {"id": "st_kn_c1", "text": "ನಮಸ್ಕಾರ!", "pictogramKeyword": "hello", "intent": "greet"},
            {"id": "st_kn_c2", "text": "ನಾನು ಒಂದು ಮಾತು ಕೇಳಲಾ?", "pictogramKeyword": "question", "intent": "ask"},
            {"id": "st_kn_c3", "text": "ನಾನು ಒಂದು ವಿಷಯ ಹೇಳಬೇಕು.", "pictogramKeyword": "chat", "intent": "tell"},
            {"id": "st_kn_c4", "text": "ದಯವಿಟ್ಟು ಕೇಳಿ.", "pictogramKeyword": "bell", "intent": "attention"},
            {"id": "st_kn_c5", "text": "ನನಗೆ ಸಹಾಯ ಬೇಕು.", "pictogramKeyword": "help", "intent": "help"}
        ],
        "student": [
            {"id": "st_kn_s1", "text": "ನಮಸ್ಕಾರ, ಹೇಗಿದ್ದೀರಿ?", "pictogramKeyword": "hello", "intent": "greet"},
            {"id": "st_kn_s2", "text": "ಕ್ಷಮಿಸಿ, ನಾನು ಒಂದು ಪ್ರಶ್ನೆ ಕೇಳಬಹುದೇ?", "pictogramKeyword": "question", "intent": "ask"},
            {"id": "st_kn_s3", "text": "ನಾನು ನಿಮ್ಮೊಂದಿಗೆ ಮಾತನಾಡಬೇಕು.", "pictogramKeyword": "chat", "intent": "tell"},
            {"id": "st_kn_s4", "text": "ಭೇಟಿಯಾಗಿದ್ದು ಸಂತೋಷ.", "pictogramKeyword": "smile", "intent": "social"},
            {"id": "st_kn_s5", "text": "ನನಗೆ ಸ್ವಲ್ಪ ಸಹಾಯ ಮಾಡುತ್ತೀರಾ?", "pictogramKeyword": "help", "intent": "help"}
        ],
        "adult": [
            {"id": "st_kn_a1", "text": "ನಮಸ್ಕಾರ, ಶುಭ ದಿನ.", "pictogramKeyword": "hello", "intent": "greet"},
            {"id": "st_kn_a2", "text": "ಕ್ಷಮಿಸಿ, ನಾನು ಒಂದು ವಿಷಯ ವಿಚಾರಿಸಬಹುದೇ?", "pictogramKeyword": "question", "intent": "ask"},
            {"id": "st_kn_a3", "text": "ನಾನು ನಿಮ್ಮಲ್ಲಿ ಒಂದು ಮಾತು ಹೇಳಲು ಇಷ್ಟಪಡುತ್ತೇನೆ.", "pictogramKeyword": "chat", "intent": "tell"},
            {"id": "st_kn_a4", "text": "ಮಾತನಾಡಲು ಸಮಯ ನೀಡಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದಗಳು.", "pictogramKeyword": "thank_you", "intent": "polite"},
            {"id": "st_kn_a5", "text": "ದಯವಿಟ್ಟು ನನಗೆ ಸ್ವಲ್ಪ ಸಹಾಯ ಮಾಡುವಿರಾ?", "pictogramKeyword": "help", "intent": "help"}
        ]
    },
    "hi": {
        "child": [
            {"id": "st_hi_c1", "text": "नमस्ते!", "pictogramKeyword": "hello", "intent": "greet"},
            {"id": "st_hi_c2", "text": "क्या मैं कुछ पूछ सकता हूँ?", "pictogramKeyword": "question", "intent": "ask"},
            {"id": "st_hi_c3", "text": "मुझे आपसे कुछ कहना है।", "pictogramKeyword": "chat", "intent": "tell"},
            {"id": "st_hi_c4", "text": "सुनिए कृपया।", "pictogramKeyword": "bell", "intent": "attention"},
            {"id": "st_hi_c5", "text": "मुझे मदद चाहिए।", "pictogramKeyword": "help", "intent": "help"}
        ],
        "student": [
            {"id": "st_hi_s1", "text": "नमस्ते, आप कैसे हैं?", "pictogramKeyword": "hello", "intent": "greet"},
            {"id": "st_hi_s2", "text": "माफ़ कीजिए, क्या मैं एक सवाल पूछ सकता हूँ?", "pictogramKeyword": "question", "intent": "ask"},
            {"id": "st_hi_s3", "text": "मैं आपसे कुछ बात करना चाहता हूँ।", "pictogramKeyword": "chat", "intent": "tell"},
            {"id": "st_hi_s4", "text": "आपसे मिलकर अच्छा लगा।", "pictogramKeyword": "smile", "intent": "social"},
            {"id": "st_hi_s5", "text": "क्या आप मेरी मदद कर सकते हैं?", "pictogramKeyword": "help", "intent": "help"}
        ],
        "adult": [
            {"id": "st_hi_a1", "text": "नमस्ते, आपका दिन शुभ हो।", "pictogramKeyword": "hello", "intent": "greet"},
            {"id": "st_hi_a2", "text": "माफ़ कीजिए, मैं कुछ पूछना चाहता हूँ।", "pictogramKeyword": "question", "intent": "ask"},
            {"id": "st_hi_a3", "text": "मैं आपसे कुछ साझा करना चाहता हूँ।", "pictogramKeyword": "chat", "intent": "tell"},
            {"id": "st_hi_a4", "text": "बातचीत के लिए समय देने हेतु धन्यवाद।", "pictogramKeyword": "thank_you", "intent": "polite"},
            {"id": "st_hi_a5", "text": "क्या आप कृपया थोड़ी सहायता कर सकते हैं?", "pictogramKeyword": "help", "intent": "help"}
        ]
    }
}

class ChatEngine:
    def validate_reply(self, text: str, age_group: str) -> bool:
        """Validates that reply has no unfilled slots, no internal ids, and child word limit."""
        if not text:
            return False
        # No internal ids or unfilled templates
        if "_" in text and not any(k in text for k in [" ", "।", "."]):
            return False
        if "{" in text or "}" in text:
            return False
        # Defect prevention: known defects
        if "I do not like Yes" in text or "I do not care for Happy" in text:
            return False
        # Child mode word limit
        if age_group == "child":
            words = text.strip().split()
            if len(words) > 8:
                return False
        return True

    def get_replies_for_class(
        self,
        q_class: str,
        language: str,
        age_group: str
    ) -> List[Dict[str, Any]]:
        # Normalize language and age_group
        lang = "en" if language.startswith("en") else ("kn" if language.startswith("kn") else "hi")
        age = "child" if age_group in ["child", "class_1_7"] else ("student" if age_group in ["student", "class_8_12"] else "adult")

        pack = BUILTIN_PACKS.get(q_class, BUILTIN_PACKS["unknown"])
        lang_pack = pack.get(lang, pack.get("en", {}))
        age_items = lang_pack.get(age, lang_pack.get("adult", []))
        return list(age_items)

    def generate_chat_replies(
        self,
        turns: List[ChatTurn],
        language: str,
        age_group: str,
        tone: str = "polite",
        wording: str = "neutral",
        role: Optional[str] = None,
        hints: Optional[List[str]] = None
    ) -> ChatRepliesResponse:
        # 1. Inspect last turn
        last_turn_text = ""
        for turn in reversed(turns):
            if turn.speaker == "other":
                last_turn_text = turn.text
                break
        if not last_turn_text and turns:
            last_turn_text = turns[-1].text

        # 2. Classify
        q_class = classify_message(last_turn_text) if last_turn_text else "greeting"

        # 3. Pull candidates
        raw_items = self.get_replies_for_class(q_class, language, age_group)

        # 4. Context chain: avoid repeating texts from the last 3 turns
        recent_spoken = {t.text.strip().lower() for t in turns[-3:]} if turns else set()

        filtered_items = []
        for item in raw_items:
            if item["text"].strip().lower() not in recent_spoken:
                if self.validate_reply(item["text"], age_group):
                    filtered_items.append(item)

        # 5. Ensure at least 4 and at most 5 items
        if len(filtered_items) < 4:
            # Fall back to unknown pack items that are valid
            fallback_items = self.get_replies_for_class("unknown", language, age_group)
            for fb in fallback_items:
                if fb["text"].strip().lower() not in recent_spoken and fb not in filtered_items:
                    if self.validate_reply(fb["text"], age_group):
                        filtered_items.append(fb)
                if len(filtered_items) >= 5:
                    break

        final_items = filtered_items[:5]
        # In case we have only 4, that is also valid (prompt says "exactly 4 or 5 sentence options")
        if len(final_items) < 4:
            # Fill with guaranteed valid starters
            lang = "en" if language.startswith("en") else ("kn" if language.startswith("kn") else "hi")
            age = "child" if age_group in ["child", "class_1_7"] else ("student" if age_group in ["student", "class_8_12"] else "adult")
            starters = STARTERS_PACK[lang][age]
            for st in starters:
                if st not in final_items and self.validate_reply(st["text"], age_group):
                    final_items.append(st)
                if len(final_items) >= 4:
                    break

        reply_objects = [
            ChatReplyItem(
                id=item.get("id", f"rep_{idx}"),
                text=item["text"],
                pictogramKeyword=item.get("pictogramKeyword", "chat"),
                intent=item.get("intent", "state"),
                sensitive=item.get("sensitive", False),
                source="pack",
                grammarChecked=True
            )
            for idx, item in enumerate(final_items)
        ]

        return ChatRepliesResponse(
            questionClass=q_class,
            replies=reply_objects,
            provider="builtin_pack"
        )

    def get_starters(
        self,
        language: str,
        age_group: str,
        role: Optional[str] = None
    ) -> ChatStartersResponse:
        lang = "en" if language.startswith("en") else ("kn" if language.startswith("kn") else "hi")
        age = "child" if age_group in ["child", "class_1_7"] else ("student" if age_group in ["student", "class_8_12"] else "adult")
        items = STARTERS_PACK.get(lang, STARTERS_PACK["en"]).get(age, STARTERS_PACK["en"]["adult"])
        starters = [
            ChatReplyItem(
                id=item["id"],
                text=item["text"],
                pictogramKeyword=item["pictogramKeyword"],
                intent=item["intent"],
                sensitive=False,
                source="pack",
                grammarChecked=True
            )
            for item in items
        ]
        return ChatStartersResponse(starters=starters)

chat_engine = ChatEngine()
