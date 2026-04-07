from typing import Optional, List
from datetime import datetime
from app.base.BaseModel import BaseEntity

CONVERSATION_COLLECTION = "conversations"
MESSAGE_COLLECTION = "messages"

class ConversationEntity(BaseEntity):
    katilimcilar: List[str] # ["user_id_1", "user_id_2"]
    son_mesaj: Optional[str] = None
    son_mesaj_tarihi: Optional[datetime] = None

class MessageEntity(BaseEntity):
    konusma_id: str
    gonderen_id: str
    alici_id: str
    icerik: str
