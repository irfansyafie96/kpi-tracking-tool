from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from database import engine, Base
from seed import seed as run_seed
from routers import auth, users, projects, kpi_metrics, evaluations, dashboard, uploads

Base.metadata.create_all(bind=engine)
run_seed()

app = FastAPI(title="KPI Backend", version="3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(projects.router)
app.include_router(kpi_metrics.router)
app.include_router(evaluations.router)
app.include_router(dashboard.router)
app.include_router(uploads.router)

upload_dir = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")


@app.get("/api/health")
def health():
    return {"status": "ok"}
