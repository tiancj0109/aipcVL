from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/datasets", tags=["datasets"])
DbSession = Annotated[Session, Depends(get_db)]

@router.get("/", response_model=List[schemas.DatasetResponse])
def get_datasets(db: DbSession, skip: int = 0, limit: int = 100):
    datasets_list = db.query(models.Dataset).offset(skip).limit(limit).all()
    return datasets_list

@router.post("/", response_model=schemas.DatasetResponse, status_code=status.HTTP_201_CREATED)
def create_dataset(dataset_in: schemas.DatasetCreate, db: DbSession):
    db_dataset = models.Dataset(**dataset_in.model_dump())
    db.add(db_dataset)
    db.commit()
    db.refresh(db_dataset)
    return db_dataset

@router.get("/{dataset_id}", response_model=schemas.DatasetResponse)
def get_dataset(dataset_id: int, db: DbSession):
    db_dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if not db_dataset:
        raise HTTPException(status_code=404, detail="未找到数据集")
    return db_dataset

@router.delete("/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dataset(dataset_id: int, db: DbSession):
    db_dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if not db_dataset:
        raise HTTPException(status_code=404, detail="未找到数据集")
    db.delete(db_dataset)
    db.commit()
    return None
