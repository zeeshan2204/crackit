from fastapi import APIRouter, Depends
from app.models.schemas import ChatRequest, ChatResponse
from app.middleware.auth_middleware import get_current_user
from app.services.ai_service import chat_with_ai

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/chat", response_model=ChatResponse)
async def chat(body: ChatRequest, _: dict = Depends(get_current_user)):
    messages = [{"role": m.role, "content": m.content} for m in body.messages]
    reply = chat_with_ai(messages, body.context)
    return {"reply": reply}