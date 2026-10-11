"""
Chat router — AI Helper endpoint.

CURRENT STATE: Returns a stub response.
FUTURE: Replace the body of `chat()` with a call to the university's AI API.
The request format is already defined — zero refactoring needed.

Example university API integration (pseudocode):
    response = httpx.post(
        UNIVERSITY_AI_API_URL,
        headers={"Authorization": f"Bearer {UNIVERSITY_API_KEY}"},
        json={
            "system": f"You are a helpful AI tutor for a course on language models. "
                      f"The student is currently reading chapter: {body.chapter_context}. "
                      "Answer concisely and accurately.",
            "message": body.message,
        }
    )
    return {"reply": response.json()["content"]}
"""
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    chapter_context: str   # e.g. "Tokenization"
    student_id: str

class ChatResponse(BaseModel):
    reply: str

# ─── STUB RESPONSE ────────────────────────────────────────────────────────────
STUB_REPLY = (
    "The AI Helper will be available once the university API is connected. "
    "In the meantime, review the chapter content or ask your instructor. "
    "The integration point is ready — your IT team just needs to configure "
    "the UNIVERSITY_AI_API_URL environment variable."
)
# ──────────────────────────────────────────────────────────────────────────────

@router.post("", response_model=ChatResponse)
async def chat(body: ChatRequest):
    # ── TODO: Replace stub with real university API call ──
    return ChatResponse(reply=STUB_REPLY)
