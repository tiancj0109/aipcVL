from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.worker import run_task

router = APIRouter(prefix="/tasks", tags=["tasks"])
DbSession = Annotated[Session, Depends(get_db)]

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_task(task_in: schemas.TaskCreate, db: DbSession):
    # Verify model and dataset exist
    db_model = db.query(models.ModelConfig).filter(models.ModelConfig.id == task_in.model_config_id).first()
    if not db_model:
        raise HTTPException(status_code=404, detail="未找到模型配置")
    
    db_dataset = db.query(models.Dataset).filter(models.Dataset.id == task_in.dataset_id).first()
    if not db_dataset:
        raise HTTPException(status_code=404, detail="未找到数据集")
        
    db_task = models.Task(
        name=task_in.name,
        model_config_id=task_in.model_config_id,
        dataset_id=task_in.dataset_id,
        status="pending",
        total_items=len(db_dataset.items) if isinstance(db_dataset.items, list) else 0
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    # Trigger Celery task here
    run_task.delay(db_task.id)
    
    return {"task_id": db_task.id}

@router.get("/", response_model=List[schemas.TaskResponse])
def get_tasks(db: DbSession, skip: int = 0, limit: int = 100):
    tasks_list = db.query(models.Task).offset(skip).limit(limit).all()
    
    # Map to response schema
    results = []
    for t in tasks_list:
        progress = 0
        if t.total_items > 0:
            progress = (t.completed_items / t.total_items) * 100
            
        metrics = schemas.TaskMetrics() # TODO calculate metrics
        results.append(schemas.TaskResponse(
            id=t.id,
            name=t.name,
            status=t.status,
            progress=progress,
            metrics=metrics
        ))
    return results

@router.get("/{task_id}", response_model=schemas.TaskDetailResponse)
def get_task(task_id: int, db: DbSession):
    t = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="未找到评测任务")
        
    progress = 0
    if t.total_items > 0:
        progress = (t.completed_items / t.total_items) * 100
        
    metrics = schemas.TaskMetrics() # TODO calculate metrics
    return schemas.TaskDetailResponse(
        id=t.id,
        name=t.name,
        status=t.status,
        progress=progress,
        metrics=metrics
    )

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: DbSession):
    t = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="未找到评测任务")
    db.delete(t)
    db.commit()
    return None

@router.post("/{task_id}/retry")
def retry_task(task_id: int, db: DbSession):
    t = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="未找到评测任务")
    
    t.status = "pending"
    db.commit()
    # Retrigger Celery task here
    run_task.delay(task_id)
    
    return {"status": "ok", "message": "已重新标记任务以进行评测"}

@router.get("/{task_id}/results")
def get_task_results(
    task_id: int, 
    db: DbSession,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    min_score: Optional[float] = Query(None, ge=0, le=1),
    max_score: Optional[float] = Query(None, ge=0, le=1)
):
    query = db.query(models.Result).filter(models.Result.task_id == task_id)
    
    if min_score is not None:
        query = query.filter(models.Result.score >= min_score)
    if max_score is not None:
        query = query.filter(models.Result.score <= max_score)
        
    return query.offset(skip).limit(limit).all()
