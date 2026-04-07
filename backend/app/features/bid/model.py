from typing import Optional
from app.base.BaseModel import BaseEntity

class BidEntity(BaseEntity):
    """
    Teklif (Bid) Tablosu Modeli (Hoca Standartları).
    'aciklama' alanını BaseEntity'den alır.
    """
    ilan_id: str
    freelancer_id: str
    freelancer_adi: Optional[str] = None
    fiyat: float
    teslim_suresi: int
    durum: str = "beklemede" # beklemede, onaylandi, reddedildi
