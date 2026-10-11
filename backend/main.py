"""
QAIRU AI Platform — FastAPI Backend
Runs locally on port 8000. Electron spawns this process on app launch.
"""
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, progress, chat, knowledge

app = FastAPI(title="QAIRU AI Platform API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,      prefix="/api/auth",     tags=["auth"])
app.include_router(progress.router,  prefix="/api/progress", tags=["progress"])
app.include_router(chat.router,      prefix="/api/chat",     tags=["chat"])
app.include_router(knowledge.router, prefix="/api",          tags=["knowledge"])



@app.get("/api/health")
def health():
    return {"status": "ok", "version": "1.0.0"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
