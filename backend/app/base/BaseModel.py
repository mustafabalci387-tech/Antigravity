from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class BaseEntity(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    ad: Optional[str] = None
    kisa_ad: Optional[str] = None
    aciklama: Optional[str] = None
    etiketler: List[str] = []
    olusturulma_tarihi: datetime = Field(default_factory=datetime.utcnow)
    degistirilme_tarihi: Optional[datetime] = None
    aktif_mi: bool = True
    silindi_mi: bool = False

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True
    }
