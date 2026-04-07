from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

class JobCreate(BaseModel):
    ad: str = Field(..., min_length=1)
    aciklama: str = Field(..., min_length=1)
    butce: float = Field(..., gt=0)
    kategori: str = Field(..., min_length=1)
    bitis_tarihi: Optional[datetime] = None

class JobResponse(BaseModel):
    id: str
    ad: str
    aciklama: str
    butce: float
    kategori: str
    durum: str = "acik"
    is_veren_id: str
    bitis_tarihi: Optional[datetime] = None
    olusturulma_tarihi: datetime
    degistirilme_tarihi: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
