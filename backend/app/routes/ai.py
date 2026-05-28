from fastapi import APIRouter, Depends
from app.models.schemas import ChatRequest, ChatResponse, ExamFeedbackRequest, ExamFeedbackResponse
from app.middleware.auth_middleware import get_current_user
from app.services.ai_service import chat_with_ai, generate_exam_feedback

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/chat", response_model=ChatResponse)
async def chat(body: ChatRequest, _: dict = Depends(get_current_user)):
    messages = [{"role": m.role, "content": m.content} for m in body.messages]
    reply = chat_with_ai(messages, body.context)
    return {"reply": reply}

@router.post("/exam-feedback", response_model=ExamFeedbackResponse)
async def exam_feedback(body: ExamFeedbackRequest):
    try:
        feedback = generate_exam_feedback(body.total_score, body.sections, body.passed)
        return {"feedback": feedback}
    except Exception as e:
        print(f"[AI Feedback Error] {type(e).__name__}: {e}")
        raise