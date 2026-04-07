from fastapi import APIRouter, Depends, Query
from app.core.dependencies import get_current_user
from app.core.response import success_response
from app.features.message.dto import MessageCreate, MessageResponse, ConversationResponse
from app.features.message.service import MessageService
from typing import List

router = APIRouter(prefix="/api/messages", tags=["Messages"])
message_service = MessageService()

@router.post("/send", response_model=MessageResponse)
async def send_message(
    body: MessageCreate,
    current_user: dict = Depends(get_current_user)
):
    """Mesaj gönderir."""
    sender_id = str(current_user.get("id"))
    return await message_service.send_message(sender_id, body.alici_id, body.icerik)

@router.get("/conversations")
async def get_my_conversations(current_user: dict = Depends(get_current_user)):
    """Aktif sohbet odalarını listeler."""
    user_id = str(current_user.get("id"))
    convs = await message_service.get_my_conversations(user_id)
    return success_response("Konuşmalar listelendi", {"konusmalar": convs})

@router.get("/conversation/{conversation_id}")
async def get_messages(
    conversation_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Geçmiş mesajları getirir."""
    user_id = str(current_user.get("id"))
    data = await message_service.get_messages_paged(conversation_id, user_id, page, limit)
    return success_response("Mesajlar listelendi", data)

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Sohbeti siler (Cascade)."""
    user_id = str(current_user.get("id"))
    await message_service.delete_conversation(conversation_id, user_id)
    return success_response("Konuşma başarıyla silindi", None)