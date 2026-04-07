from datetime import datetime
from typing import List, Dict, Any
from app.base.BaseService import BaseService
from app.features.message.repository import MessageRepository, ConversationRepository
from app.features.message.manager import MessageManager

class MessageService(BaseService):
    """
    MessageService: Orkestrasyon katmanı.
    """
    def __init__(self, message_repo: MessageRepository = None, conv_repo: ConversationRepository = None, manager: MessageManager = None):
        super().__init__(repository=message_repo or MessageRepository())
        self.conv_repo = conv_repo or ConversationRepository()
        self.manager = manager or MessageManager()

    async def send_message(self, sender_id: str, receiver_id: str, content: str) -> dict:
        # 1. İş Mantığı: İçerik kontrolü
        valid_content = self.manager.validate_message_content(content)

        # 2. Oda kontrolü (Orkestrasyon)
        conv = await self.conv_repo.find_conversation(sender_id, receiver_id)
        if not conv:
            conv_id = await self.conv_repo.create({
                "katilimcilar": [str(sender_id), str(receiver_id)],
                "son_mesaj": valid_content,
                "son_mesaj_tarihi": datetime.utcnow()
            })
        else:
            conv_id = conv["id"]
            await self.conv_repo.update(conv_id, {
                "son_mesaj": valid_content,
                "son_mesaj_tarihi": datetime.utcnow()
            })

        # 3. Mesajı kaydet
        msg_data = {
            "konusma_id": str(conv_id),
            "gonderen_id": str(sender_id),
            "alici_id": str(receiver_id),
            "icerik": valid_content
        }
        msg_id = await self.create(msg_data)
        return await self.get_by_id(msg_id)

    async def get_my_conversations(self, user_id: str) -> List[dict]:
        return await self.conv_repo.get_user_conversations(user_id)

    async def get_messages_paged(self, conversation_id: str, user_id: str, page: int = 1, limit: int = 20) -> dict:
        skip = (page - 1) * limit
        messages = await self.repository.get_conversation_messages(conversation_id, skip, limit)
        return {"mesajlar": messages, "page": page, "limit": limit}

    async def delete_conversation(self, conversation_id: str, user_id: str):
        # 1. Sohbet odasını soft_delete yap
        result = await self.conv_repo.soft_delete(conversation_id)
        
        # 2. Odaya ait mesajları da manuel olarak soft_delete yap
        await self.repository.collection.update_many(
            {"konusma_id": str(conversation_id)},
            {"$set": {"silindi_mi": True, "aktif_mi": False}}
        )
        return result
