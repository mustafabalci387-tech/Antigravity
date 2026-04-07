from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

class PortfolioCreate(BaseModel):
    """Portfolyo oluşturma DTO."""
    ad: str = Field(..., min_length=1, max_length=100)
    aciklama: str = Field(..., min_length=1, max_length=1000)
    medya_url: str
    etiketler: List[str] = []
    proje_linki: Optional[str] = None
    sira: int = 1

class PortfolioUpdate(BaseModel):
    """Portfolyo güncelleme DTO (Patch destekli)."""
    ad: Optional[str] = Field(None, max_length=100)
    aciklama: Optional[str] = Field(None, max_length=1000)
    medya_url: Optional[str] = None
    etiketler: Optional[List[str]] = None
    proje_linki: Optional[str] = None
    sira: Optional[int] = None

class PortfolioResponse(BaseModel):
    """Portfolyo yanıt DTO."""
    id: str
    kullanici_id: Optional[str] = None
    ad: Optional[str] = None
    aciklama: Optional[str] = None
    medya_url: Optional[str] = None
    etiketler: List[str] = []
    proje_linki: Optional[str] = None
    sira: int = 1
    olusturulma_tarihi: Optional[datetime] = None
    degistirilme_tarihi: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)