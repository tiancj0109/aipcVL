from celery import Celery
from app.config import settings
from app.database import SessionLocal
from app.models import Task, Result, ModelConfig, Dataset
from app.services.evaluator import run_evaluation_task

celery_app = Celery(
    "aipcvl_worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

@celery_app.task(name="app.worker.run_task")
def run_task(task_id: int):
    db = SessionLocal()
    try:
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            return f"Task {task_id} not found."
            
        task.status = "running"
        db.commit()
        
        # Run the evaluation defined in services
        run_evaluation_task(db, task)
        
        task.status = "completed"
        db.commit()
    except Exception as e:
        task.status = "failed"
        task.error_message = str(e)
        db.commit()
    finally:
        db.close()
