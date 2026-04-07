from typing import Optional, List
from datetime import datetime
from app.base.BaseModel import BaseEntity

class JobEntity(BaseEntity):
    """
    İş İlanı Tablosu Modeli (Hoca Standartları).
    'ad' ve 'aciklama' alanlarını BaseEntityden alır.
    """
    butce: float
    kategori: str
    durum: str = "acik" # acik, devam_ediyor, tamamlandi, iptal
    is_veren_id: str
    bitis_tarihi: Optional[datetime] = None
    atanan_freelancer_id: Optional[str] = None
