from .base import BaseModelAdapter
import time

class OpenAIAdapter(BaseModelAdapter):
    def generate(self, prompt: str, image_url: str = None):
        # MOCK IMPLEMENTATION for Phase 1
        start_time = time.time()
        time.sleep(0.5) # Simulate API call
        
        output_text = f"Mocked OpenAI Response for prompt: {prompt[:10]}..."
        
        latency = int((time.time() - start_time) * 1000)
        return {
            "output": output_text,
            "latency_ms": latency,
            "token_usage": {"prompt_tokens": 10, "completion_tokens": 10}
        }

class LocalModelAdapter(BaseModelAdapter):
    def generate(self, prompt: str, image_url: str = None):
        # MOCK IMPLEMENTATION for Phase 1
        start_time = time.time()
        time.sleep(0.2) # Simulate local call
        
        output_text = f"Mocked Local Response for prompt: {prompt[:10]}..."
        
        latency = int((time.time() - start_time) * 1000)
        return {
            "output": output_text,
            "latency_ms": latency,
            "token_usage": {"prompt_tokens": 10, "completion_tokens": 10}
        }
