from sqlalchemy.orm import Session
from app.models import Task, Result, ModelConfig, Dataset, ModelCache
from app.adapters.openai import OpenAIAdapter, LocalModelAdapter
from app.utils.cache import get_cache_key, get_or_download_image
from app.utils.rate_limit import wait_for_rate_limit
import json
import time

def run_evaluation_task(db: Session, task: Task):
    model_conf = task.model_config
    dataset = task.dataset
    
    # Initialize adapter
    adapter = None
    if model_conf.provider == "openai":
        adapter = OpenAIAdapter(api_key=model_conf.api_key, endpoint=model_conf.endpoint)
    else:
        adapter = LocalModelAdapter(api_key=model_conf.api_key, endpoint=model_conf.endpoint)

    items = dataset.items if dataset.items else []
    total_cost = 0.0

    # 1. Breakpoint Continuation: fetch already processed item IDs for this task
    existing_results = db.query(Result.dataset_item_id).filter(Result.task_id == task.id).all()
    processed_ids = {r[0] for r in existing_results}

    for item in items:
        item_id_str = str(item.get("id", "0"))
        if item_id_str in processed_ids:
            # Skip already processed (breakpoint continuation)
            continue
            
        prompt = item.get("prompt", "")
        img = item.get("image_url", None)
        expected = item.get("expected", "")
        
        # 2. Image Caching: download external images locally
        local_img_path = get_or_download_image(img)
        
        # 3. Model Caching: check if we've run this exact model/prompt/image before
        cache_key = get_cache_key(model_conf.name, prompt, img)
        cached = db.query(ModelCache).filter(ModelCache.cache_key == cache_key).first()
        
        if cached:
            response = {
                "output": cached.output,
                "latency_ms": 0,
                "token_usage": cached.token_usage
            }
        else:
            # 4. Rate Limiting: before calling external provider
            wait_for_rate_limit(model_conf.provider)
            
            response = adapter.generate(prompt=prompt, image_url=local_img_path)
            
            # Save to Model Cache
            new_cache = ModelCache(
                cache_key=cache_key,
                model_name=model_conf.name,
                image_url=img, # Keep original URL for reference
                prompt=prompt,
                output=response["output"],
                token_usage=response.get("token_usage")
            )
            db.add(new_cache)
            db.commit() # Commit cache immediately so it's available for other workers
        
        # Simple Exact Match Scoring
        output = response["output"]
        score = 1.0 if expected.lower() in output.lower() else 0.0
        
        result = Result(
            task_id=task.id,
            dataset_item_id=item_id_str,
            model_output=output,
            score=score,
            judge_details={"method": "exact_match", "cached": bool(cached)},
            latency_ms=response["latency_ms"],
            token_usage=response["token_usage"]
        )
        db.add(result)
        
        task.completed_items += 1
        # Mock cost calculation
        total_cost += 0.002
        db.commit()

    task.cost_estimate = (task.cost_estimate or 0) + total_cost
    db.commit()
