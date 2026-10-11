"""
Knowledge Graph Router — Obsidian-Style Tree of Knowledge API.
Serves graph topology, handles quiz results, and validates Bloom's taxonomy tests.
"""
from typing import Optional
from fastapi import APIRouter, Header
from pydantic import BaseModel
from knowledge_graph import (
    KnowledgeGraphEngine,
    KnowledgeGraphResponse,
    QuizRecordRequest,
    GenerateQuizRequest
)
from routers.auth import get_user_from_token

router = APIRouter()

@router.get("/knowledge-graph")
def get_knowledge_graph(authorization: Optional[str] = Header(None)):
    student_id = "demo-student"
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        user = get_user_from_token(token)
        if user and "id" in user:
            student_id = user["id"]

    return KnowledgeGraphEngine.compute_graph(student_id)

@router.post("/record-quiz-result")
def record_quiz_result(payload: QuizRecordRequest, authorization: Optional[str] = Header(None)):
    student_id = payload.student_id or "demo-student"
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        user = get_user_from_token(token)
        if user and "id" in user:
            student_id = user["id"]

    result = KnowledgeGraphEngine.record_quiz_result(
        topic_id=payload.topic_id,
        score=payload.score,
        student_id=student_id
    )
    return result

@router.post("/generate-quiz")
def generate_quiz(payload: GenerateQuizRequest):
    questions = KnowledgeGraphEngine.get_topic_quiz(
        topic_name_or_id=payload.topic,
        lecture_text=payload.lecture_text
    )
    return {"questions": [q.model_dump() for q in questions]}
