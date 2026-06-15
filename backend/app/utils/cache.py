import hashlib
import json
import os
import urllib.request
from urllib.error import URLError

CACHE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "cache", "images")
os.makedirs(CACHE_DIR, exist_ok=True)

def get_cache_key(model_name: str, prompt: str, image_url: str = None) -> str:
    """Generate a unique SHA-256 hash for the given inputs."""
    data = {
        "model": model_name,
        "prompt": prompt,
        "image": image_url or ""
    }
    # Sort keys to ensure consistent hashing
    data_str = json.dumps(data, sort_keys=True)
    return hashlib.sha256(data_str.encode('utf-8')).hexdigest()

def get_or_download_image(image_url: str) -> str:
    """Download an image if it doesn't exist locally, return the local file path."""
    if not image_url or not image_url.startswith("http"):
        return image_url # Might be local path or None already
        
    url_hash = hashlib.md5(image_url.encode('utf-8')).hexdigest()
    # Assume it's a jpg for simplicity, realistic implementation might parse extension
    ext = os.path.splitext(image_url)[1].split("?")[0]
    if not ext:
        ext = ".jpg"
    
    local_filename = f"{url_hash}{ext}"
    local_path = os.path.join(CACHE_DIR, local_filename)
    
    if not os.path.exists(local_path):
        try:
            urllib.request.urlretrieve(image_url, local_path)
        except URLError as e:
            print(f"Failed to download image {image_url}: {e}")
            return image_url # fallback to remote URL
            
    return local_path
