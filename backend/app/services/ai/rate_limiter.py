import time
from collections import defaultdict
from typing import Dict, List, Tuple

class SessionRateLimiter:
    def __init__(self, max_requests_per_minute: int = 30):
        self.max_requests = max_requests_per_minute
        self.window_seconds = 60
        self._history: Dict[str, List[float]] = defaultdict(list)

    def is_allowed(self, session_id: str) -> Tuple[bool, int]:
        now = time.time()
        cutoff = now - self.window_seconds
        
        # Purge timestamps older than the sliding window
        self._history[session_id] = [t for t in self._history[session_id] if t > cutoff]
        
        if len(self._history[session_id]) >= self.max_requests:
            oldest_in_window = self._history[session_id][0]
            retry_after = max(1, int(self.window_seconds - (now - oldest_in_window)))
            return False, retry_after
        
        self._history[session_id].append(now)
        return True, 0

    def reset(self, session_id: str | None = None) -> None:
        if session_id:
            self._history.pop(session_id, None)
        else:
            self._history.clear()

session_rate_limiter = SessionRateLimiter()
