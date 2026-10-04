import re
from typing import List, Dict, Any, Optional
from app.services.ai.base import AIProvider
from app.schemas.context import ConversationContext, PredictedResponse, MessageTurn

class LocalFallbackProvider(AIProvider):
    """
    Pure offline rule-based provider.
    Zero network dependencies. Generates reliable, predictable,
    and linguistically verified AAC responses in English, Kannada, and Hindi.
    """

    @property
    def name(self) -> str:
        return "local_fallback"

    async def is_available(self) -> bool:
        return True

    def _detect_topic(self, messages: List[MessageTurn]) -> str:
        if not messages:
            return "greeting"

        last_other_msg = ""
        for m in reversed(messages):
            if m.speaker == 'other':
                last_other_msg = m.text.lower()
                break

        if not last_other_msg:
            last_other_msg = messages[-1].text.lower()

        # Food & hunger
        if any(w in last_other_msg for w in ['hungry', 'eat', 'food', 'lunch', 'dinner', 'breakfast', 'हಸಿವು', 'ಊಟ', 'ತಿಂಡಿ', 'ತಿನ್ನಲು', 'भूख', 'खाना', 'नाश्ता']):
            # If user already answered hungry, topic advances to specific food items
            for m in messages:
                if m.speaker == 'user' and any(w in m.text.lower() for w in ['hungry', 'ಹಸಿವಾಗಿದೆ', 'भूख']):
                    return "food_choices"
            return "hunger_inquiry"

        # Drink & thirst
        if any(w in last_other_msg for w in ['drink', 'water', 'thirsty', 'juice', 'tea', 'ನೀರು', 'ಕುಡಿಯಲು', 'ಬಾಯಾರಿಕೆ', 'पानी', 'प्यास', 'चाय']):
            return "drink_inquiry"

        # School & homework
        if any(w in last_other_msg for w in ['homework', 'school', 'study', 'class', 'assignment', 'ಶಾಲೆ', 'ಪಾಠ', 'ಮನೆಕೆಲಸ', 'गृहकार्य', 'होमवर्क', 'स्कूल', 'पढ़ाई']):
            return "homework_inquiry"

        # Help request
        if any(w in last_other_msg for w in ['help', 'need help', 'explain', 'difficult', 'ಸಹಾಯ', 'ತಿಳಿಸಿ', 'ಕಷ್ಟ', 'मदद', 'समझाओ', 'सहायता']):
            return "help_inquiry"

        # Feelings & well-being
        if any(w in last_other_msg for w in ['how are you', 'how do you feel', 'are you okay', 'feeling', 'ಹೇಗಿದ್ದೀರಿ', 'ಆರಾಮವೇ', 'ಭಾವನೆ', 'कैसा लग रहा', 'तबीयत']):
            return "feelings_inquiry"

        # Greetings
        if any(w in last_other_msg for w in ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'namaste', 'ನಮಸ್ಕಾರ', 'ಶುಭೋದಯ', 'नमस्ते', 'प्रणाम']):
            return "greeting"

        return "general"

    async def predict_responses(self, context: ConversationContext) -> List[PredictedResponse]:
        lang = context.language.lower()
        is_kn = 'kn' in lang
        is_hi = 'hi' in lang
        is_child = context.ageGroup == 'class_1_7'
        topic = context.currentTopic or self._detect_topic(context.messages)

        # Collect phrases user already said to prevent repeats
        already_said = set()
        for m in context.messages:
            if m.speaker == 'user':
                already_said.add(m.text.strip().lower())

        options: List[PredictedResponse] = []

        if topic == "greeting":
            if is_kn:
                options = [
                    PredictedResponse(pictogramKeyword="hello", label="ನಮಸ್ಕಾರ", spokenText="ನಮಸ್ಕಾರ, ನೀವು ಹೇಗಿದ್ದೀರಿ?", intent="greeting"),
                    PredictedResponse(pictogramKeyword="happy", label="ಚೆನ್ನಾಗಿದ್ದೇನೆ", spokenText="ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ, ಧನ್ಯವಾದಗಳು.", intent="state"),
                    PredictedResponse(pictogramKeyword="friend", label="ಭೇಟಿಯಾಗಿ ಸಂತೋಷ", spokenText="ನಿಮ್ಮನ್ನು ಭೇಟಿಯಾಗಿದ್ದು ಸಂತೋಷವಾಯಿತು.", intent="social"),
                    PredictedResponse(pictogramKeyword="wave", label="ಶುಭ ದಿನ", spokenText="ನಿಮಗೆ ಶುಭ ದಿನವಾಗಲಿ.", intent="social"),
                ]
            elif is_hi:
                options = [
                    PredictedResponse(pictogramKeyword="hello", label="नमस्ते", spokenText="नमस्ते, आप कैसे हैं?", intent="greeting"),
                    PredictedResponse(pictogramKeyword="happy", label="मैं ठीक हूँ", spokenText="मैं बिल्कुल ठीक हूँ, धन्यवाद।", intent="state"),
                    PredictedResponse(pictogramKeyword="friend", label="मिलकर खुशी हुई", spokenText="आपसे मिलकर बहुत खुशी हुई।", intent="social"),
                    PredictedResponse(pictogramKeyword="wave", label="शुभ दिन", spokenText="आपका दिन शुभ हो।", intent="social"),
                ]
            else:
                options = [
                    PredictedResponse(pictogramKeyword="hello", label="Hello", spokenText="Hello, nice to see you." if not is_child else "Hello friend!", intent="greeting"),
                    PredictedResponse(pictogramKeyword="happy", label="I am good", spokenText="I am doing well, thank you.", intent="state"),
                    PredictedResponse(pictogramKeyword="friend", label="How are you?", spokenText="How are you doing today?", intent="question"),
                    PredictedResponse(pictogramKeyword="wave", label="Good day", spokenText="Have a wonderful day.", intent="social"),
                ]

        elif topic == "hunger_inquiry":
            if is_kn:
                options = [
                    PredictedResponse(pictogramKeyword="pizza", label="ಹಸಿವಾಗಿದೆ", spokenText="ನನಗೆ ಹಸಿವಾಗಿದೆ. ನನಗೆ ಊಟ ಬೇಕು.", intent="want"),
                    PredictedResponse(pictogramKeyword="food", label="ಆಹಾರ ಬೇಕು", spokenText="ನಾನು ಏನಾದರೂ ತಿನ್ನಲು ಬಯಸುತ್ತೇನೆ.", intent="want"),
                    PredictedResponse(pictogramKeyword="no", label="ಹಸಿವಿಲ್ಲ", spokenText="ಇಲ್ಲ, ನನಗೆ ಈಗ ಹಸಿವಿಲ್ಲ.", intent="decline"),
                    PredictedResponse(pictogramKeyword="water", label="ಬಾಯಾರಿಕೆ", spokenText="ನನಗೆ ಹಸಿವಿಲ್ಲ, ಆದರೆ ನೀರು ಬೇಕು.", intent="want"),
                ]
            elif is_hi:
                options = [
                    PredictedResponse(pictogramKeyword="pizza", label="भूख लगी है", spokenText="हाँ, मुझे बहुत भूख लगी है।", intent="want"),
                    PredictedResponse(pictogramKeyword="food", label="खाना चाहिए", spokenText="मुझे कुछ खाने के लिए चाहिए।", intent="want"),
                    PredictedResponse(pictogramKeyword="no", label="भूख नहीं है", spokenText="नहीं, मुझे अभी भूख नहीं है।", intent="decline"),
                    PredictedResponse(pictogramKeyword="water", label="प्यास लगी है", spokenText="मुझे भूख नहीं, बल्कि प्यास लगी है।", intent="want"),
                ]
            else:
                options = [
                    PredictedResponse(pictogramKeyword="pizza", label="Yes I am hungry", spokenText="Yes, I am hungry. I would like some food." if not is_child else "Yes, I am hungry!", intent="want"),
                    PredictedResponse(pictogramKeyword="food", label="I want food", spokenText="I would like something to eat, please.", intent="want"),
                    PredictedResponse(pictogramKeyword="no", label="No I am not hungry", spokenText="No, thank you. I am not hungry right now.", intent="decline"),
                    PredictedResponse(pictogramKeyword="water", label="I am thirsty", spokenText="I am not hungry, but I am thirsty.", intent="want"),
                ]

        elif topic == "food_choices":
            if is_kn:
                options = [
                    PredictedResponse(pictogramKeyword="pizza", label="ಪಿಜ್ಜಾ", spokenText="ನನಗೆ ಪಿಜ್ಜಾ ಬೇಕು." if is_child else "ನನಗೆ ಪಿಜ್ಜಾ ಇಷ್ಟ, ದಯವಿಟ್ಟು ಕೊಡಿ.", intent="choose"),
                    PredictedResponse(pictogramKeyword="rice", label="ಅನ್ನ / ಊಟ", spokenText="ನನಗೆ ಬಿಸಿ ಅನ್ನ ಮತ್ತು ಊಟ ಬೇಕು.", intent="choose"),
                    PredictedResponse(pictogramKeyword="bread", label="ತಿಂಡಿ", spokenText="ನನಗೆ ಲಘು ಉಪಹಾರ ಅಥವಾ ಸ್ಯಾಂಡ್ವಿಚ್ ಸಾಕು.", intent="choose"),
                    PredictedResponse(pictogramKeyword="apple", label="ಹಣ್ಣುಗಳು", spokenText="ನಾನು ತಾಜಾ ಹಣ್ಣುಗಳನ್ನು ತಿನ್ನಲು ಬಯಸುತ್ತೇನೆ.", intent="choose"),
                ]
            elif is_hi:
                options = [
                    PredictedResponse(pictogramKeyword="pizza", label="पिज़्ज़ा", spokenText="मुझे पिज़्ज़ा चाहिए।" if is_child else "मुझे पिज़्ज़ा पसंद है, कृपया पिज़्ज़ा दीजिए।", intent="choose"),
                    PredictedResponse(pictogramKeyword="rice", label="चावल और खाना", spokenText="मैं चावल और सादा खाना खाना चाहता हूँ।", intent="choose"),
                    PredictedResponse(pictogramKeyword="bread", label="सैंडविच", spokenText="मुझे सैंडविच या हल्का नाश्ता चाहिए।", intent="choose"),
                    PredictedResponse(pictogramKeyword="apple", label="फल", spokenText="मुझे ताजे फल खाने हैं।", intent="choose"),
                ]
            else:
                options = [
                    PredictedResponse(pictogramKeyword="pizza", label="Pizza", spokenText="I would like some pizza, please." if not is_child else "I want pizza!", intent="choose"),
                    PredictedResponse(pictogramKeyword="rice", label="Rice meal", spokenText="I would prefer a rice dish, please.", intent="choose"),
                    PredictedResponse(pictogramKeyword="bread", label="Sandwich", spokenText="A sandwich sounds very nice, thank you.", intent="choose"),
                    PredictedResponse(pictogramKeyword="apple", label="Fruit", spokenText="I would like some fresh fruit, please.", intent="choose"),
                ]

        elif topic == "drink_inquiry":
            if is_kn:
                options = [
                    PredictedResponse(pictogramKeyword="water", label="ನೀರು ಕೊಡಿ", spokenText="ದಯವಿಟ್ಟು ನನಗೆ ಕುಡಿಯಲು ನೀರು ಕೊಡಿ.", intent="want"),
                    PredictedResponse(pictogramKeyword="tea", label="ಬಿಸಿ ಚಹಾ", spokenText="ನನಗೆ ಒಂದು ಕಪ್ ಬಿಸಿ ಚಹಾ ಬೇಕು.", intent="want"),
                    PredictedResponse(pictogramKeyword="milk", label="ಹಾಲು / ಜ್ಯೂಸ್", spokenText="ನನಗೆ ಹಾಲು ಅಥವಾ ಜ್ಯೂಸ್ ಬೇಕು.", intent="want"),
                    PredictedResponse(pictogramKeyword="no", label="ಬೇಡ, ಧನ್ಯವಾದ", spokenText="ಇಲ್ಲ, ಈಗ ಏನೂ ಬೇಡ ಧನ್ಯವಾದಗಳು.", intent="decline"),
                ]
            elif is_hi:
                options = [
                    PredictedResponse(pictogramKeyword="water", label="पानी चाहिए", spokenText="कृपया मुझे पीने के लिए पानी दीजिए।", intent="want"),
                    PredictedResponse(pictogramKeyword="tea", label="गर्म चाय", spokenText="मुझे एक कप गर्म चाय चाहिए।", intent="want"),
                    PredictedResponse(pictogramKeyword="milk", label="दूध या जूस", spokenText="मुझे दूध या ताज़ा जूस चाहिए।", intent="want"),
                    PredictedResponse(pictogramKeyword="no", label="नहीं, धन्यवाद", spokenText="नहीं, अभी कुछ नहीं चाहिए, धन्यवाद।", intent="decline"),
                ]
            else:
                options = [
                    PredictedResponse(pictogramKeyword="water", label="Water please", spokenText="Water please, thank you." if is_child else "I would like a glass of water, please.", intent="want"),
                    PredictedResponse(pictogramKeyword="milk", label="Juice please", spokenText="I would like some cold juice, please.", intent="want"),
                    PredictedResponse(pictogramKeyword="tea", label="Warm tea", spokenText="A cup of warm tea would be wonderful.", intent="want"),
                    PredictedResponse(pictogramKeyword="no", label="No thank you", spokenText="No thank you, I have enough to drink.", intent="decline"),
                ]

        elif topic == "homework_inquiry":
            if is_kn:
                options = [
                    PredictedResponse(pictogramKeyword="yes", label="ಮುಗಿಸಿದ್ದೇನೆ", spokenText="ಹೌದು, ನಾನು ಮನೆಕೆಲಸವನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ಮುಗಿಸಿದ್ದೇನೆ.", intent="affirm"),
                    PredictedResponse(pictogramKeyword="no", label="ಇನ್ನೂ ಇಲ್ಲ", spokenText="ಇಲ್ಲ, ಇನ್ನೂ ಮುಗಿದಿಲ್ಲ. ಮಾಡುತ್ತಿದ್ದೇನೆ.", intent="status"),
                    PredictedResponse(pictogramKeyword="help", label="ಸಹಾಯ ಬೇಕು", spokenText="ನನಗೆ ಈ ಪಾಠ ಅರ್ಥವಾಗುತ್ತಿಲ್ಲ, ಸಹಾಯ ಬೇಕು.", intent="request"),
                    PredictedResponse(pictogramKeyword="home", label="ನಂತರ ಮಾಡುವೆ", spokenText="ನಾನು ಇದನ್ನು ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಪೂರ್ಣಗೊಳಿಸುವೆನು.", intent="delay"),
                ]
            elif is_hi:
                options = [
                    PredictedResponse(pictogramKeyword="yes", label="पूरा कर लिया", spokenText="हाँ, मैंने अपना गृहकार्य पूरा कर लिया है।", intent="affirm"),
                    PredictedResponse(pictogramKeyword="no", label="अभी नहीं", spokenText="नहीं, अभी पूरा नहीं हुआ है, कर रहा हूँ।", intent="status"),
                    PredictedResponse(pictogramKeyword="help", label="मदद चाहिए", spokenText="मुझे इस सवाल में आपकी थोड़ी मदद चाहिए।", intent="request"),
                    PredictedResponse(pictogramKeyword="home", label="बाद में करूँगा", spokenText="मैं इसे थोड़ी देर में पूरा कर लूँगा।", intent="delay"),
                ]
            else:
                options = [
                    PredictedResponse(pictogramKeyword="yes", label="Yes I finished", spokenText="Yes, I finished all my homework." if not is_child else "Yes, I finished it!", intent="affirm"),
                    PredictedResponse(pictogramKeyword="no", label="No not yet", spokenText="No, not yet. I am working on it now.", intent="status"),
                    PredictedResponse(pictogramKeyword="help", label="I need help", spokenText="I need some help understanding this assignment.", intent="request"),
                    PredictedResponse(pictogramKeyword="home", label="I will do it later", spokenText="I plan to complete it a little later today.", intent="delay"),
                ]

        elif topic == "help_inquiry":
            if is_kn:
                options = [
                    PredictedResponse(pictogramKeyword="yes", label="ಹೌದು ದಯವಿಟ್ಟು", spokenText="ಹೌದು, ದಯವಿಟ್ಟು ನನಗೆ ಸಹಾಯ ಮಾಡಿ.", intent="affirm"),
                    PredictedResponse(pictogramKeyword="no", label="ಬೇಡ ಧನ್ಯವಾದ", spokenText="ಬೇಡ ಧನ್ಯವಾದಗಳು, ನಾನೇ ಪ್ರಯತ್ನಿಸುವೆ.", intent="decline"),
                    PredictedResponse(pictogramKeyword="help", label="ಅರ್ಥವಾಗುತ್ತಿಲ್ಲ", spokenText="ನನಗೆ ಈ ಪ್ರಶ್ನೆ ಸ್ಪಷ್ಟವಾಗಿ ಅರ್ಥವಾಗುತ್ತಿಲ್ಲ.", intent="clarify"),
                    PredictedResponse(pictogramKeyword="school", label="ವಿವರಿಸಿ ಹೇಳಿ", spokenText="ದಯವಿಟ್ಟು ಇನ್ನೊಮ್ಮೆ ನಿಧಾನವಾಗಿ ವಿವರಿಸಿ ಹೇಳುವಿರಾ?", intent="request"),
                ]
            elif is_hi:
                options = [
                    PredictedResponse(pictogramKeyword="yes", label="हाँ कृपया", spokenText="हाँ, कृपया मेरी मदद कीजिए।", intent="affirm"),
                    PredictedResponse(pictogramKeyword="no", label="नहीं धन्यवाद", spokenText="धन्यवाद, मैं खुद कर सकता हूँ।", intent="decline"),
                    PredictedResponse(pictogramKeyword="help", label="समझ नहीं आया", spokenText="मुझे यह सवाल समझ नहीं आ रहा है।", intent="clarify"),
                    PredictedResponse(pictogramKeyword="school", label="समझा दीजिए", spokenText="कृपया इसे एक बार और विस्तार से समझा दीजिए।", intent="request"),
                ]
            else:
                options = [
                    PredictedResponse(pictogramKeyword="yes", label="Yes please", spokenText="Yes please, I would appreciate your help.", intent="affirm"),
                    PredictedResponse(pictogramKeyword="no", label="No thank you", spokenText="No thank you, I can manage on my own.", intent="decline"),
                    PredictedResponse(pictogramKeyword="help", label="I do not understand", spokenText="I do not understand this question clearly.", intent="clarify"),
                    PredictedResponse(pictogramKeyword="school", label="Can you explain it?", spokenText="Could you please explain it once more?", intent="request"),
                ]

        else: # General default options
            if is_kn:
                options = [
                    PredictedResponse(pictogramKeyword="yes", label="ಹೌದು", spokenText="ಹೌದು, ನಾನು ಒಪ್ಪುತ್ತೇನೆ.", intent="affirm"),
                    PredictedResponse(pictogramKeyword="no", label="ಇಲ್ಲ", spokenText="ಇಲ್ಲ, ಧನ್ಯವಾದಗಳು.", intent="decline"),
                    PredictedResponse(pictogramKeyword="happy", label="ಧನ್ಯವಾದಗಳು", spokenText="ತುಂಬಾ ಧನ್ಯವಾದಗಳು.", intent="gratitude"),
                    PredictedResponse(pictogramKeyword="help", label="ಸಹಾಯ ಬೇಕು", spokenText="ನನಗೆ ನಿಮ್ಮ ಸಹಾಯ ಬೇಕು.", intent="request"),
                ]
            elif is_hi:
                options = [
                    PredictedResponse(pictogramKeyword="yes", label="हाँ", spokenText="हाँ, मैं सहमत हूँ।", intent="affirm"),
                    PredictedResponse(pictogramKeyword="no", label="नहीं", spokenText="नहीं, धन्यवाद।", intent="decline"),
                    PredictedResponse(pictogramKeyword="happy", label="धन्यवाद", spokenText="आपका बहुत-बहुत धन्यवाद।", intent="gratitude"),
                    PredictedResponse(pictogramKeyword="help", label="मदद चाहिए", spokenText="मुझे आपकी सहायता की आवश्यकता है।", intent="request"),
                ]
            else:
                options = [
                    PredictedResponse(pictogramKeyword="yes", label="Yes", spokenText="Yes, that sounds good." if not is_child else "Yes please!", intent="affirm"),
                    PredictedResponse(pictogramKeyword="no", label="No", spokenText="No, thank you." if not is_child else "No thank you.", intent="decline"),
                    PredictedResponse(pictogramKeyword="happy", label="Thank you", spokenText="Thank you very much.", intent="gratitude"),
                    PredictedResponse(pictogramKeyword="help", label="I need a minute", spokenText="Please give me a moment to think.", intent="delay"),
                ]

        # Filter out phrases the user already said
        filtered = [opt for opt in options if opt.spokenText.strip().lower() not in already_said]
        if not filtered:
            filtered = options

        # Child gets at most 4 items before "Something else" (total 5 max)
        max_items = 4 if is_child else 5
        final_list = filtered[:max_items]

        # Always append "Something else"
        something_else_label = "ಬೇರೆ ವಿಷಯ" if is_kn else "कुछ और" if is_hi else "Something else"
        something_else_spoken = "ನನಗೆ ಬೇರೆ ವಿಷಯ ಹೇಳಬೇಕಿದೆ." if is_kn else "मुझे कुछ और कहना है।" if is_hi else "I want to say something else."
        final_list.append(
            PredictedResponse(
                pictogramKeyword="more",
                label=something_else_label,
                spokenText=something_else_spoken,
                intent="custom"
            )
        )

        return final_list

    async def generate_natural_sentence(self, phrase: str, language: str, age_group: str) -> str:
        lang = language.lower()
        is_kn = 'kn' in lang
        is_hi = 'hi' in lang
        is_child = age_group == 'class_1_7'
        cleaned = phrase.strip()

        if is_kn:
            return f"ನನಗೆ {cleaned} ಬೇಕು." if is_child else f"ದಯವಿಟ್ಟು ನನಗೆ {cleaned} ಕೊಡುತ್ತೀರಾ?"
        elif is_hi:
            return f"मुझे {cleaned} चाहिए।" if is_child else f"कृपया क्या आप मुझे {cleaned} दे सकते हैं?"
        else:
            return f"I want {cleaned}." if is_child else f"I would like {cleaned}, please."

    async def improve_text(self, text: str, language: str, age_group: str) -> str:
        lang = language.lower()
        is_kn = 'kn' in lang
        is_hi = 'hi' in lang
        is_child = age_group == 'class_1_7'
        cleaned = text.strip()

        # Handle simple common shorthands
        lower = cleaned.lower()
        if 'water' in lower:
            return "I want water." if is_child else "I would like some water, please."
        if 'pizza' in lower:
            return "I want pizza!" if is_child else "I would like some pizza, please."
        if 'food' in lower or 'hungry' in lower:
            return "I am hungry." if is_child else "I am feeling hungry, could I have something to eat?"
        if 'help' in lower:
            return "Help me please." if is_child else "Could you please assist me with this?"
        if 'bathroom' in lower or 'toilet' in lower:
            return "I need the bathroom." if is_child else "Excuse me, where is the restroom?"
        
        # Default expansion
        if is_kn:
            return f"{cleaned} ಬೇಕು." if is_child else f"ದಯವಿಟ್ಟು {cleaned}."
        elif is_hi:
            return f"{cleaned} चाहिए।" if is_child else f"कृपया {cleaned}।"
        else:
            return f"I want {cleaned}." if is_child else f"I would like {cleaned}, please."

    async def translate(self, text: str, source_language: str, target_language: str) -> str:
        # Fallback retains original text if no offline dictionary matches
        return text
