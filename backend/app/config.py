from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AIPCVL"
    DATABASE_URL: str = "mysql+pymysql://root:zhongxinyi@127.0.0.1:3306/aipcvl"
    CELERY_BROKER_URL: str = "redis://127.0.0.1:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://127.0.0.1:6379/0"

settings = Settings()
