from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class ModelConfigBase(BaseModel):
    name: str = Field(..., max_length=50)
    provider: str = Field(..., max_length=20)
    api_key: str = Field(..., max_length=200)
    endpoint: Optional[str] = Field(None, max_length=200)
    params: Optional[Dict[str, Any]] = None

class ModelConfigCreate(ModelConfigBase):
    pass

class ModelConfigResponse(ModelConfigBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

class DatasetBase(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None
    items: List[Dict[str, Any]]

class DatasetCreate(DatasetBase):
    pass

class DatasetResponse(DatasetBase):
    id: int
    created_at: datetime

class TaskCreate(BaseModel):
    name: str = Field(..., max_length=100)
    model_config_id: int
    dataset_id: int

class TaskMetrics(BaseModel):
    avg_score: Optional[float] = None
    pass_rate: Optional[float] = None
    avg_latency: Optional[float] = None
    total_cost: Optional[float] = None

class TaskResponse(BaseModel):
    id: int
    name: str
    status: str
    progress: float
    metrics: TaskMetrics

class TaskDetailResponse(TaskResponse):
    pass
