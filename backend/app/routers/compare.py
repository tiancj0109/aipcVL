from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app import models

router = APIRouter(prefix="/compare", tags=["compare"])
DbSession = Annotated[Session, Depends(get_db)]

class CompareRequest(BaseModel):
    model_config_ids: List[int]
    dataset_id: int

@router.post("/models")
def compare_models(request: CompareRequest, db: DbSession):
    if len(request.model_config_ids) != 2:
        raise HTTPException(status_code=400, detail="必须且只能提供两个模型配置ID以进行对比")

    m1_id, m2_id = request.model_config_ids[0], request.model_config_ids[1]
    
    # Find latest completed tasks for these models and this dataset
    task1 = db.query(models.Task).filter(
        models.Task.model_config_id == m1_id,
        models.Task.dataset_id == request.dataset_id,
        models.Task.status == "completed"
    ).order_by(models.Task.created_at.desc()).first()
    
    task2 = db.query(models.Task).filter(
        models.Task.model_config_id == m2_id,
        models.Task.dataset_id == request.dataset_id,
        models.Task.status == "completed"
    ).order_by(models.Task.created_at.desc()).first()
    
    if not task1 or not task2:
        raise HTTPException(status_code=404, detail="未找到这两个模型在此数据集上的已完成评测任务。")
        
    def get_metrics(t):
        if not t: return None
        results = db.query(models.Result).filter(models.Result.task_id == t.id).all()
        if not results: return None
        
        avg_score = sum(r.score for r in results) / len(results)
        pass_rate = sum(1 for r in results if r.score >= 0.5) / len(results)
        avg_latency = sum(r.latency_ms for r in results if r.latency_ms) / len(results)
        
        # Gather error cases (score < 0.5)
        error_cases = [
            {
                "id": r.dataset_item_id,
                "score": r.score,
                "output": r.model_output
            } for r in filter(lambda res: res.score < 0.5, results)
        ]
        
        return {
            "task_id": t.id,
            "model_name": t.model_config.name,
            "avg_score": avg_score,
            "pass_rate": pass_rate,
            "avg_latency": avg_latency,
            "total_cost": t.cost_estimate,
            "error_cases": error_cases
        }

    return {
        "model_1": get_metrics(task1),
        "model_2": get_metrics(task2),
        "dataset_name": task1.dataset.name
    }
