from typing import Optional, List, Dict, Any
from app.base.BaseRepo import BaseRepository
from app.features.message.model import MESSAGE_COLLECTION, CONVERSATION_COLLECTION

class MessageRepository(BaseRepository):
    def __init__(self):
        super().__init__(collection_name=MESSAGE_COLLECTION)

    async def get_conversation_messages(self, conversation_id: str, skip: int = 0, limit: int = 50) -> List[Dict[str, Any]]:
        # Sayfalama desteği BaseRepository'den geliyor, burada özelleştiriyoruz
        messages, count = await self.get_many(
            skip=skip, 
            limit=limit, 
            sort_by="olusturulma_tarihi", 
            sort_order=-1, 
            filters={"konusma_id": str(conversation_id)}
        )
        return messages

class ConversationRepository(BaseRepository):
    def __init__(self):
        super().__init__(collection_name=CONVERSATION_COLLECTION)

    async def find_conversation(self, user1: str, user2: str) -> Optional[Dict[str, Any]]:
        """İki kullanıcı arasındaki odayı bulur."""
        doc = await self.collection.find_one({
            "katilimcilar": {"$all": [str(user1), str(user2)]},
            "silindi_mi": False
        })
        if doc:
            doc["id"] = str(doc.pop("_id"))
        return doc

    async def get_user_conversations(self, user_id: str) -> List[Dict[str, Any]]:
        """Kullanıcının odalarını listeler."""
        convs, count = await self.get_many(filters={"katilimcilar": str(user_id)})
        return convs