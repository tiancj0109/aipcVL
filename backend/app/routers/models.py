from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/models", tags=["models"])
DbSession = Annotated[Session, Depends(get_db)]

@router.get("/", response_model=List[schemas.ModelConfigResponse])
def get_models(db: DbSession, skip: int = 0, limit: int = 100):
    models_list = db.query(models.ModelConfig).offset(skip).limit(limit).all()
    return models_list

@router.post("/", response_model=schemas.ModelConfigResponse, status_code=status.HTTP_201_CREATED)
def create_model(model_in: schemas.ModelConfigCreate, db: DbSession):
    db_model = models.ModelConfig(**model_in.model_dump())
    db.add(db_model)
    db.commit()
    db.refresh(db_model)
    return db_model

@router.delete("/{model_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_model(model_id: int, db: DbSession):
    db_model = db.query(models.ModelConfig).filter(models.ModelConfig.id == model_id).first()
    if not db_model:
        raise HTTPException(status_code=404, detail="未找到模型配置")
    db.delete(db_model)
    db.commit()
    return None

@router.post("/{model_id}/test", status_code=status.HTTP_200_OK)
def test_model(model_id: int, db: DbSession):
    db_model = db.query(models.ModelConfig).filter(models.ModelConfig.id == model_id).first()
    if not db_model:
        raise HTTPException(status_code=404, detail="未找到模型配置")
    # TODO: Implement actual connectivity test logic
    return {"status": "ok", "message": "连接测试成功(模拟)"}
