"""
Progress router — sync student chapter completion to SQLite.
Frontend stores progress locally too (Zustand persist), so this is a
secondary backup that enables future instructor dashboard.
"""
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from database import get_conn
from routers.auth import get_user_from_token

router = APIRouter()

class ProgressSync(BaseModel):
    completed: dict[int, bool]

@router.post("/sync")
def sync_progress(body: ProgressSync, authorization: str = Header(default="")):
    token = authorization.replace("Bearer ", "").strip()
    user = get_user_from_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    conn = get_conn()
    for chapter_id, done in body.completed.items():
        conn.execute("""
            INSERT INTO progress (student_id, chapter_id, completed)
            VALUES (?, ?, ?)
            ON CONFLICT (student_id, chapter_id) DO UPDATE SET completed = excluded.completed,
                updated = datetime('now')
        """, (user["id"], int(chapter_id), int(done)))
    conn.commit()
    conn.close()
    return {"status": "synced"}

@router.get("/me")
def get_my_progress(authorization: str = Header(default="")):
    token = authorization.replace("Bearer ", "").strip()
    user = get_user_from_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    conn = get_conn()
    rows = conn.execute(
        "SELECT chapter_id, completed FROM progress WHERE student_id = ?", (user["id"],)
    ).fetchall()
    conn.close()
    return {str(r["chapter_id"]): bool(r["completed"]) for r in rows}
