from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseModelAdapter(ABC):
    def __init__(self, api_key: str, endpoint: str = None, **kwargs):
        self.api_key = api_key
        self.endpoint = endpoint
        self.params = kwargs

    @abstractmethod
    def generate(self, prompt: str, image_url: str = None) -> Dict[str, Any]:
        """
        Returns a dictionary with at least:
        - "output": raw text output
        - "latency_ms": time taken
        - "token_usage": {}
        """
        pass
