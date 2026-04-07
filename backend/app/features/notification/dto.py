from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class NotificationCreate(BaseModel):
    user_id: str = Field(..., min_length=1)
    mesaj: str = Field(..., min_length=1)
    ilan_id: Optional[str] = None
    tip: str = "genel"
    okundu_mu: bool = False

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    mesaj: str
    ilan_id: Optional[str] = None
    tip: str
    okundu_mu: bool
    olusturulma_tarihi: datetime
    degistirilme_tarihi: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
