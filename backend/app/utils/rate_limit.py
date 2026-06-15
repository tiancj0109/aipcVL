import time
import threading

class SimpleRateLimiter:
    """
    A simple thread-safe rate limiter.
    In a distributed Celery environment, Redis is preferred.
    Since we are using Celery with Redis backend, we can use Redis.
    For Phase 2, we simulate a simple token bucket.
    """
    def __init__(self, calls_per_minute: int = 60):
        self.calls_per_minute = calls_per_minute
        self.interval = 60.0 / calls_per_minute
        self.last_call = 0.0
        self.lock = threading.Lock()

    def acquire(self):
        with self.lock:
            now = time.time()
            time_since_last = now - self.last_call
            
            if time_since_last < self.interval:
                sleep_time = self.interval - time_since_last
                time.sleep(sleep_time)
                
            self.last_call = time.time()

# Global limiters per provider
LIMITERS = {
    "openai": SimpleRateLimiter(calls_per_minute=20),
    "dashscope": SimpleRateLimiter(calls_per_minute=30),
    "anthropic": SimpleRateLimiter(calls_per_minute=10)
}

def wait_for_rate_limit(provider: str):
    limiter = LIMITERS.get(provider)
    if limiter:
        limiter.acquire()
