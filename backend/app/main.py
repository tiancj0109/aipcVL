from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import models, datasets, tasks, compare

app = FastAPI(title="AIPCVL API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(models.router, prefix="/api")
app.include_router(datasets.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")
app.include_router(compare.router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
