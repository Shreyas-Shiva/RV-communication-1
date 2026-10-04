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

ai_manager = AIManager()
