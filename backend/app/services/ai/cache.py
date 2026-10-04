import time
import hashlib
import logging
from typing import List, Optional, Tuple, Dict, Any
from app.schemas.context import PredictedResponse, MessageTurn

logger = logging.getLogger("communiq.ai.cache")

class PredictionCache:
    def __init__(self, ttl_seconds: int = 600, max_entries: int = 1000):
        self.ttl_seconds = ttl_seconds
        self.max_entries = max_entries
        self._cache: Dict[str, Tuple[float, List[PredictedResponse]]] = {}
        self.total_requests: int = 0
        self.hits: int = 0
        self.misses: int = 0

    def _generate_key(self, language: str, age_group: str, messages: List[MessageTurn]) -> str:
        # Key based on language, age group, and the last 3 messages
        last_three = messages[-3:] if messages else []
        normalized_msgs = []
        for m in last_three:
            normalized_msgs.append(f"{m.speaker}:{m.text.strip().lower()}")
        
        raw_key = f"{language}|{age_group}|{'||'.join(normalized_msgs)}"
        return hashlib.sha256(raw_key.encode('utf-8')).hexdigest()

    def get(self, language: str, age_group: str, messages: List[MessageTurn]) -> Optional[List[PredictedResponse]]:
        self.total_requests += 1
        key = self._generate_key(language, age_group, messages)
        entry = self._cache.get(key)
        if not entry:
            self.misses += 1
            logger.info(f"Prediction cache miss. Stats: {self.hits} hits / {self.total_requests} requests ({self.hit_rate_pct:.1f}% hit rate).")
            return None
        
        timestamp, data = entry
        if time.time() - timestamp > self.ttl_seconds:
            # Expired
            del self._cache[key]
            self.misses += 1
            logger.info(f"Prediction cache entry expired. Stats: {self.hits} hits / {self.total_requests} requests ({self.hit_rate_pct:.1f}% hit rate).")
            return None
        
        self.hits += 1
        logger.info(f"Prediction cache hit! Hit rate: {self.hit_rate_pct:.1f}% ({self.hits}/{self.total_requests}). Free-tier request saved.")
        return data

    def set(self, language: str, age_group: str, messages: List[MessageTurn], responses: List[PredictedResponse]) -> None:
        if len(self._cache) >= self.max_entries:
            # Simple cleanup of oldest entries
            oldest_key = min(self._cache.keys(), key=lambda k: self._cache[k][0])
            del self._cache[oldest_key]
            
        key = self._generate_key(language, age_group, messages)
        self._cache[key] = (time.time(), responses)

    @property
    def hit_rate_pct(self) -> float:
        if self.total_requests == 0:
            return 0.0
        return (self.hits / self.total_requests) * 100.0

    def get_stats(self) -> Dict[str, Any]:
        return {
            "total_requests": self.total_requests,
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate_pct": round(self.hit_rate_pct, 2),
            "cached_entries": len(self._cache)
        }

    def clear(self) -> None:
        self._cache.clear()
        self.total_requests = 0
        self.hits = 0
        self.misses = 0

prediction_cache = PredictionCache()
