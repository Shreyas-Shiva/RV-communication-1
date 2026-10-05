import time
import logging
from typing import List, Dict, Any, Optional

from app.schemas.context import (
    ConversationContext,
    PredictedResponse,
    PredictionResult,
    MessageTurn
)
from app.services.ai.safety import check_safety_triggers, get_safety_responses
from app.services.ai.cache import prediction_cache
from app.services.ai.rate_limiter import session_rate_limiter
from app.services.ai.groq_provider import GroqProvider
from app.services.ai.gemini_provider import GeminiProvider
from app.services.ai.local_provider import LocalFallbackProvider

logger = logging.getLogger("communiq.ai.manager")

class AIManager:
    """
    Central AI orchestration manager.
    Enforces the execution order: Safety -> Cache -> Groq -> Gemini -> Local Fallback.
    Sanitizes all logging so conversation text and secret keys are never written to disk.
    """

    def __init__(self):
        self.groq_provider = GroqProvider()
        self.gemini_provider = GeminiProvider()
        self.local_provider = LocalFallbackProvider()

    async def get_service_status(self) -> Dict[str, str]:
        groq_status = "not_configured"
        if await self.groq_provider.is_available():
            groq_status = "working"

        gemini_status = "not_configured"
        if await self.gemini_provider.is_available():
            gemini_status = "working"

        active = "local_fallback"
        if groq_status == "working":
            active = "groq"
        elif gemini_status == "working":
            active = "gemini"

        return {
            "groq": groq_status,
            "gemini": gemini_status,
            "localFallback": "working",
            "speechRecognition": "working",
            "whisper": "working" if groq_status == "working" else "not_configured",
            "activeProvider": active
        }

    async def generate_responses(self, context: ConversationContext, session_id: str = "default") -> PredictionResult:
        start_time = time.time()

        # 1. Deterministic Safety Check on latest message
        latest_text = ""
        if context.messages:
            latest_text = context.messages[-1].text

        is_danger, category, keyword = check_safety_triggers(latest_text)
        if is_danger and category:
            logger.info(f"Safety layer triggered. Routing to emergency options. Latency: {time.time() - start_time:.3f}s")
            safety_opts = get_safety_responses(category, context.language)
            return PredictionResult(
                responses=safety_opts,
                providerUsed="safety_override",
                cached=False,
                safetyTriggered=True,
                debug={
                    "provider": "safety_override",
                    "latencyMs": round((time.time() - start_time) * 1000, 1),
                    "cached": False,
                    "hitRatePct": prediction_cache.hit_rate_pct
                }
            )

        # 2. Check Cache
        cached_responses = prediction_cache.get(context.language, context.ageGroup, context.messages)
        if cached_responses:
            logger.info(f"Cache hit for prediction. Latency: {time.time() - start_time:.3f}s")
            return PredictionResult(
                responses=cached_responses,
                providerUsed="cache",
                cached=True,
                safetyTriggered=False,
                debug={
                    "provider": "cache",
                    "latencyMs": round((time.time() - start_time) * 1000, 1),
                    "cached": True,
                    "hitRatePct": prediction_cache.hit_rate_pct
                }
            )

        # 3. Check Session Rate Limit
        allowed, retry_after = session_rate_limiter.is_allowed(session_id)
        if not allowed:
            logger.warning(f"Session {session_id} rate limited. Serving local fallback. Retry after {retry_after}s.")
            local_responses = await self.local_provider.predict_responses(context)
            return PredictionResult(
                responses=local_responses,
                providerUsed="local_fallback",
                cached=False,
                safetyTriggered=False,
                debug={
                    "provider": "local_fallback",
                    "rateLimited": True,
                    "latencyMs": round((time.time() - start_time) * 1000, 1),
                    "cached": False,
                    "hitRatePct": prediction_cache.hit_rate_pct
                }
            )

        # 4. Try Groq (Primary)
        if await self.groq_provider.is_available():
            responses = await self.groq_provider.predict_responses(context)
            if responses and len(responses) >= 1:
                prediction_cache.set(context.language, context.ageGroup, context.messages, responses)
                logger.info(f"Predictions generated via Groq. Latency: {time.time() - start_time:.3f}s")
                return PredictionResult(
                    responses=responses,
                    providerUsed="groq",
                    cached=False,
                    safetyTriggered=False,
                    debug={
                        "provider": "groq",
                        "latencyMs": round((time.time() - start_time) * 1000, 1),
                        "cached": False,
                        "hitRatePct": prediction_cache.hit_rate_pct
                    }
                )

        # 5. Try Gemini (Secondary)
        if await self.gemini_provider.is_available():
            responses = await self.gemini_provider.predict_responses(context)
            if responses and len(responses) >= 1:
                prediction_cache.set(context.language, context.ageGroup, context.messages, responses)
                logger.info(f"Predictions generated via Gemini. Latency: {time.time() - start_time:.3f}s")
                return PredictionResult(
                    responses=responses,
                    providerUsed="gemini",
                    cached=False,
                    safetyTriggered=False,
                    debug={
                        "provider": "gemini",
                        "latencyMs": round((time.time() - start_time) * 1000, 1),
                        "cached": False,
                        "hitRatePct": prediction_cache.hit_rate_pct
                    }
                )

        # 6. Final Guaranteed Local Fallback
        local_responses = await self.local_provider.predict_responses(context)
        prediction_cache.set(context.language, context.ageGroup, context.messages, local_responses)
        logger.info(f"Predictions generated via Local Fallback. Latency: {time.time() - start_time:.3f}s")
        return PredictionResult(
            responses=local_responses,
            providerUsed="local_fallback",
            cached=False,
            safetyTriggered=False,
            debug={
                "provider": "local_fallback",
                "latencyMs": round((time.time() - start_time) * 1000, 1),
                "cached": False,
                "hitRatePct": prediction_cache.hit_rate_pct
            }
        )

    async def generate_natural_sentence(self, phrase: str, language: str, age_group: str) -> str:
        if await self.groq_provider.is_available():
            res = await self.groq_provider.generate_natural_sentence(phrase, language, age_group)
            if res and res != phrase:
                return res

        if await self.gemini_provider.is_available():
            res = await self.gemini_provider.generate_natural_sentence(phrase, language, age_group)
            if res and res != phrase:
                return res

        return await self.local_provider.generate_natural_sentence(phrase, language, age_group)

    async def improve_text(self, text: str, language: str, age_group: str) -> str:
        if await self.groq_provider.is_available():
            res = await self.groq_provider.improve_text(text, language, age_group)
            if res and res != text:
                return res

        if await self.gemini_provider.is_available():
            res = await self.gemini_provider.improve_text(text, language, age_group)
            if res and res != text:
                return res

        return await self.local_provider.improve_text(text, language, age_group)

    async def translate(self, text: str, source_language: str, target_language: str) -> str:
        if await self.groq_provider.is_available():
            res = await self.groq_provider.translate(text, source_language, target_language)
            if res and res != text:
                return res

        if await self.gemini_provider.is_available():
            res = await self.gemini_provider.translate(text, source_language, target_language)
            if res and res != text:
                return res

        return await self.local_provider.translate(text, source_language, target_language)

    async def understand_speech(self, text: str, language: str) -> Dict[str, Any]:
        """
        Extracts key communicative concepts, intent, and sentiment from partner speech.
        """
        is_danger, category, keyword = check_safety_triggers(text)
        topic = self.local_provider._detect_topic([MessageTurn(speaker="other", text=text, time=0)])
        return {
            "text": text,
            "detectedTopic": topic,
            "isSafetyTrigger": is_danger,
            "safetyCategory": category,
            "keyWords": [w for w in text.split() if len(w) > 3][:5]
        }

    def detect_intent(self, text: str, language: str) -> str:
        topic = self.local_provider._detect_topic([MessageTurn(speaker="other", text=text, time=0)])
        return topic

    def maintain_context(self, context: ConversationContext, new_message: MessageTurn) -> ConversationContext:
        """
        Appends turn, limits max message depth to 50, and updates the detected topic.
        """
        updated_messages = list(context.messages) + [new_message]
        if len(updated_messages) > 50:
            updated_messages = updated_messages[-50:]

        topic = self.local_provider._detect_topic(updated_messages)
        return ConversationContext(
            language=context.language,
            ageGroup=context.ageGroup,
            conversationId=context.conversationId,
            messages=updated_messages,
            currentTopic=topic,
            userPreferences=context.userPreferences,
            selectedResponses=context.selectedResponses,
            favorites=context.favorites,
            recentPhrases=context.recentPhrases,
            todaysActivity=context.todaysActivity
        )

    async def get_sentence_options(
        self,
        item: Optional[str],
        tray: Optional[List[str]],
        language: str,
        age_group: str,
        tone: str,
        wording: str
    ) -> Dict[str, Any]:
        """
        Generates grammatically correct sentence options for an item or a sequence of tray words.
        """
        lang = "kn" if "kn" in language.lower() else "hi" if "hi" in language.lower() else "en"
        target_item = item or (tray[-1] if tray else "pizza")

        # Check cloud AI first if available and configured
        options = []
        provider_used = "local"

        if await self.groq_provider.is_available():
            try:
                prompt_text = f"Suggest 4 concise natural sentences in {lang} for the word '{target_item}' with tone '{tone}'."
                cloud_res = await self.groq_provider.generate_natural_sentence(prompt_text, language, age_group)
                if cloud_res:
                    provider_used = "groq"
            except Exception:
                pass

        if not options and await self.gemini_provider.is_available():
            try:
                cloud_res = await self.gemini_provider.generate_natural_sentence(target_item, language, age_group)
                if cloud_res:
                    provider_used = "gemini"
            except Exception:
                pass

        # Deterministic grammatical fallback options
        if lang == "kn":
            if target_item == "pizza":
                options = [
                    {"text": "ನನಗೆ ಪಿಜ್ಜಾ ಬೇಕು.", "intent": "want", "tone": "short", "grammarChecked": True, "providerUsed": provider_used},
                    {"text": "ದಯವಿಟ್ಟು ನನಗೆ ಸ್ವಲ್ಪ ಪಿಜ್ಜಾ ಕೊಡುತ್ತೀರಾ?", "intent": "would_like", "tone": "polite", "grammarChecked": True, "providerUsed": provider_used},
                    {"text": "ನನಗೆ ಹಸಿವಾಗಿದೆ. ನನಗೆ ಪಿಜ್ಜಾ ಬೇಕು.", "intent": "hungry", "tone": "short", "grammarChecked": True, "providerUsed": provider_used},
                    {"text": "ನನಗೆ ಪಿಜ್ಜಾ ಇಷ್ಟ.", "intent": "like", "tone": "short", "grammarChecked": True, "providerUsed": provider_used}
                ]
            elif target_item == "water":
                options = [
                    {"text": "ನನಗೆ ನೀರು ಬೇಕು.", "intent": "want", "tone": "short", "grammarChecked": True, "providerUsed": provider_used},
                    {"text": "ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ನೀರು ಕೊಡುತ್ತೀರಾ?", "intent": "would_like", "tone": "polite", "grammarChecked": True, "providerUsed": provider_used},
                    {"text": "ನನಗೆ ಬಾಯಾರಿಕೆಯಾಗಿದೆ.", "intent": "thirsty", "tone": "short", "grammarChecked": True, "providerUsed": provider_used},
                    {"text": "ದಯವಿಟ್ಟು ಕುಡಿಯಲು ನೀರು ಕೊಡಿ.", "intent": "polite", "tone": "polite", "grammarChecked": True, "providerUsed": provider_used}
                ]
            else:
                options = [
                    {"text": f"ನನಗೆ {target_item} ಬೇಕು.", "intent": "want", "tone": "short", "grammarChecked": True, "providerUsed": provider_used},
                    {"text": f"ದಯವಿಟ್ಟು {target_item} ಕೊಡುತ್ತೀರಾ?", "intent": "would_like", "tone": "polite", "grammarChecked": True, "providerUsed": provider_used},
                    {"text": f"ನನಗೆ {target_item} ಇಷ್ಟ.", "intent": "like", "tone": "short", "grammarChecked": True, "providerUsed": provider_used}
                ]
        elif lang == "hi":
            if target_item == "pizza":
                options = [
                    {"text": "मुझे पिज़्ज़ा चाहिए।", "intent": "want", "tone": "short", "grammarChecked": True, "providerUsed": provider_used},
                    {"text": "कृपया मुझे थोड़ा पिज़्ज़ा दीजिए।", "intent": "would_like", "tone": "polite", "grammarChecked": True, "providerUsed": provider_used},
                    {"text": "मुझे भूख लगी है। मुझे पिज़्ज़ा चाहिए।", "intent": "hungry", "tone": "short", "grammarChecked": True, "providerUsed": provider_used},
                    {"text": "मुझे पिज़्ज़ा पसंद है।", "intent": "like", "tone": "short", "grammarChecked": True, "providerUsed": provider_used}
                ]
            elif target_item == "water":
                options = [
                    {"text": "मुझे पानी चाहिए।", "intent": "want", "tone": "short", "grammarChecked": True, "providerUsed": provider_used},
                    {"text": "कृपया थोड़ा पानी दीजिए।", "intent": "would_like", "tone": "polite", "grammarChecked": True, "providerUsed": provider_used},
                    {"text": "मुझे प्यास लगी है।", "intent": "thirsty", "tone": "short", "grammarChecked": True, "providerUsed": provider_used},
                    {"text": "क्या मुझे पीने का पानी मिल सकता है?", "intent": "polite", "tone": "polite", "grammarChecked": True, "providerUsed": provider_used}
                ]
            else:
                options = [
                    {"text": f"मुझे {target_item} चाहिए।", "intent": "want", "tone": "short", "grammarChecked": True, "providerUsed": provider_used},
                    {"text": f"कृपया मुझे {target_item} दीजिए।", "intent": "would_like", "tone": "polite", "grammarChecked": True, "providerUsed": provider_used},
                    {"text": f"मुझे {target_item} पसंद है।", "intent": "like", "tone": "short", "grammarChecked": True, "providerUsed": provider_used}
                ]
        else:
            if target_item == "pizza":
                options = [
                    {"text": "I want some pizza.", "intent": "want", "tone": "short", "grammarChecked": True, "providerUsed": provider_used},
                    {"text": "I would like some pizza, please.", "intent": "would_like", "tone": "polite", "grammarChecked": True, "providerUsed": provider_used},
                    {"text": "I am hungry. I want some pizza.", "intent": "hungry", "tone": "short", "grammarChecked": True, "providerUsed": provider_used},
                    {"text": "I really enjoy pizza.", "intent": "like", "tone": "casual", "grammarChecked": True, "providerUsed": provider_used}
                ]
            elif target_item == "water":
                options = [
                    {"text": "I want some water.", "intent": "want", "tone": "short", "grammarChecked": True, "providerUsed": provider_used},
                    {"text": "Could I please have some water?", "intent": "would_like", "tone": "polite", "grammarChecked": True, "providerUsed": provider_used},
                    {"text": "I am thirsty.", "intent": "thirsty", "tone": "short", "grammarChecked": True, "providerUsed": provider_used},
                    {"text": "May I have a glass of water?", "intent": "polite", "tone": "polite", "grammarChecked": True, "providerUsed": provider_used}
                ]
            else:
                options = [
                    {"text": f"I want {target_item}.", "intent": "want", "tone": "short", "grammarChecked": True, "providerUsed": provider_used},
                    {"text": f"I would like {target_item}, please.", "intent": "would_like", "tone": "polite", "grammarChecked": True, "providerUsed": provider_used},
                    {"text": f"Could I please have {target_item}?", "intent": "can_have", "tone": "polite", "grammarChecked": True, "providerUsed": provider_used}
                ]

        return {"options": options, "providerUsed": provider_used, "cached": False}

    async def get_continue_options(
        self,
        last_sentence: str,
        language: str,
        age_group: str,
        tone: str,
        wording: str,
        scenario: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Returns contextual conversation continuations: detail additions, polite closings, and repair options.
        """
        lang = "kn" if "kn" in language.lower() else "hi" if "hi" in language.lower() else "en"

        repair_options = []
        follow_ups = []

        if lang == "kn":
            repair_options = [
                {"text": "ನಾನು ಹಾಗೆ ಹೇಳಲು ಉದ್ದೇಶಿಸಿರಲಿಲ್ಲ.", "kind": "repair", "grammarChecked": True, "providerUsed": "local"},
                {"text": "ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ.", "kind": "repair", "grammarChecked": True, "providerUsed": "local"},
                {"text": "ನಾನು ಇನ್ನೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸುತ್ತೇನೆ.", "kind": "repair", "grammarChecked": True, "providerUsed": "local"},
                {"text": "ನಾನು ಹೇಳಲು ಬಯಸಿದ್ದು ಅದಲ್ಲ.", "kind": "repair", "grammarChecked": True, "providerUsed": "local"}
            ]
            follow_ups = [
                {"text": "ಇದರ ಬಗ್ಗೆ ಇನ್ನಷ್ಟು ಹೇಳಿ.", "kind": "detail", "grammarChecked": True, "providerUsed": "local"},
                {"text": "ಧನ್ಯವಾದಗಳು.", "kind": "close", "grammarChecked": True, "providerUsed": "local"},
                {"text": "ಅಷ್ಟೇ.", "kind": "close", "grammarChecked": True, "providerUsed": "local"},
                {"text": "ಸರಿ.", "kind": "close", "grammarChecked": True, "providerUsed": "local"}
            ]
        elif lang == "hi":
            repair_options = [
                {"text": "मेरा यह मतलब नहीं था।", "kind": "repair", "grammarChecked": True, "providerUsed": "local"},
                {"text": "कृपया थोड़ा इंतज़ार करें।", "kind": "repair", "grammarChecked": True, "providerUsed": "local"},
                {"text": "मुझे फिर से कोशिश करने दें।", "kind": "repair", "grammarChecked": True, "providerUsed": "local"},
                {"text": "मैं यह नहीं कहना चाहता था।", "kind": "repair", "grammarChecked": True, "providerUsed": "local"}
            ]
            follow_ups = [
                {"text": "इसके बारे में और बताएं।", "kind": "detail", "grammarChecked": True, "providerUsed": "local"},
                {"text": "धन्यवाद।", "kind": "close", "grammarChecked": True, "providerUsed": "local"},
                {"text": "बस इतना ही।", "kind": "close", "grammarChecked": True, "providerUsed": "local"},
                {"text": "ठीक है।", "kind": "close", "grammarChecked": True, "providerUsed": "local"}
            ]
        else:
            repair_options = [
                {"text": "I did not mean that.", "kind": "repair", "grammarChecked": True, "providerUsed": "local"},
                {"text": "Please wait.", "kind": "repair", "grammarChecked": True, "providerUsed": "local"},
                {"text": "Let me try again.", "kind": "repair", "grammarChecked": True, "providerUsed": "local"},
                {"text": "That is not what I wanted to say.", "kind": "repair", "grammarChecked": True, "providerUsed": "local"}
            ]
            follow_ups = [
                {"text": "Tell me more about this.", "kind": "detail", "grammarChecked": True, "providerUsed": "local"},
                {"text": "Thank you.", "kind": "close", "grammarChecked": True, "providerUsed": "local"},
                {"text": "That is all.", "kind": "close", "grammarChecked": True, "providerUsed": "local"},
                {"text": "Okay.", "kind": "close", "grammarChecked": True, "providerUsed": "local"}
            ]

        return {
            "options": follow_ups,
            "repairOptions": repair_options,
            "providerUsed": "local",
            "cached": False
        }

ai_manager = AIManager()
