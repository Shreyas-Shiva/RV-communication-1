from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.database.mongodb import db_manager
from app.api.router import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: attempt database connection
    await db_manager.connect()
    yield
    # Shutdown: close database connection
    await db_manager.disconnect()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_prefix)

@app.get("/")
async def root():
    return {
        "app": settings.app_name,
        "tagline": "Everyone deserves a voice.",
        "status": "online",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
