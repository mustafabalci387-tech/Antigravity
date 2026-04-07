from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

class MessageCreate(BaseModel):
    alici_id: str
    icerik: str = Field(..., min_length=1)

class MessageResponse(BaseModel):
    id: str
    konusma_id: str
    gonderen_id: str
    alici_id: str
    icerik: str
    olusturulma_tarihi: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class ConversationResponse(BaseModel):
    id: str
    katilimcilar: List[str]
    son_mesaj: Optional[str] = None
    son_mesaj_tarihi: Optional[datetime] = None
    aktif_mi: bool = True

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)