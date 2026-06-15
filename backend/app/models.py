from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class ModelConfig(Base):
    __tablename__ = "model_configs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True, nullable=False)
    provider = Column(String(20), nullable=False) # openai, anthropic, dashscope, local
    api_key = Column(String(200), nullable=False)
    endpoint = Column(String(200), nullable=True)
    params = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    tasks = relationship("Task", back_populates="model_config")


class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    items = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    tasks = relationship("Task", back_populates="dataset")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    model_config_id = Column(Integer, ForeignKey("model_configs.id"))
    dataset_id = Column(Integer, ForeignKey("datasets.id"))
    status = Column(String(20), default="pending", index=True) # pending, running, completed, failed
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    total_items = Column(Integer, default=0)
    completed_items = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    cost_estimate = Column(Float, nullable=True)

    model_config = relationship("ModelConfig", back_populates="tasks")
    dataset = relationship("Dataset", back_populates="tasks")
    results = relationship("Result", back_populates="task")


class Result(Base):
    __tablename__ = "results"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), index=True)
    dataset_item_id = Column(String(50), nullable=False)
    model_output = Column(Text, nullable=True)
    score = Column(Float, nullable=True, index=True)
    judge_details = Column(JSON, nullable=True)
    latency_ms = Column(Integer, nullable=True)
    token_usage = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    task = relationship("Task", back_populates="results")


class ModelCache(Base):
    __tablename__ = "model_cache"

    id = Column(Integer, primary_key=True, index=True)
    cache_key = Column(String(64), unique=True, index=True, nullable=False)
    model_name = Column(String(50), nullable=False)
    image_url = Column(Text, nullable=True)
    prompt = Column(Text, nullable=False)
    output = Column(Text, nullable=True)
    token_usage = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
