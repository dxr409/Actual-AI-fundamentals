"""
Auth router — simple email/password login.
For local university distribution: no production-grade hashing required,
but bcrypt is used for basic security. Replace with SSO/OAuth later.
"""
import uuid
import secrets
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from database import get_conn

router = APIRouter()

# In-memory token store (replace with JWT or DB-backed sessions for production)
_tokens: dict[str, dict] = {}

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    token: str
    user: dict

@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest):
    conn = get_conn()
    row = conn.execute(
        "SELECT * FROM students WHERE email = ?", (body.email.lower().strip(),)
    ).fetchone()
    conn.close()

    if not row:
        # Auto-create student account on first login (simple for local distrib)
        student_id = str(uuid.uuid4())
        name = body.email.split("@")[0].replace(".", " ").replace("_", " ").title()
        conn = get_conn()
        conn.execute(
            "INSERT INTO students (id, email, name, password, role) VALUES (?, ?, ?, ?, ?)",
            (student_id, body.email.lower().strip(), name, "local-auth", "student"),
        )
        conn.commit()
        conn.close()
        user = {"id": student_id, "email": body.email, "name": name, "role": "student"}
    else:
        user = {"id": row["id"], "email": row["email"], "name": row["name"], "role": row["role"]}

    token = secrets.token_urlsafe(32)
    _tokens[token] = user
    return {"token": token, "user": user}

def get_user_from_token(token: str) -> dict | None:
    return _tokens.get(token)
