from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

class BidCreate(BaseModel):
    ilan_id: str
    fiyat: float = Field(..., gt=0)
    aciklama: str = Field(..., min_length=1)
    teslim_suresi: int = Field(..., gt=0)

class BidResponse(BaseModel):
    id: str
    ilan_id: str
    freelancer_id: str
    freelancer_adi: Optional[str] = None
    fiyat: float
    aciklama: str
    teslim_suresi: int
    durum: str
    olusturulma_tarihi: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)