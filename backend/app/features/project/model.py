from typing import Optional
from datetime import datetime
from app.base.BaseModel import BaseEntity

class ProjectEntity(BaseEntity):
    """
    Proje Takibi Tablosu Modeli (Hoca Standartları).
    BaseEntity'den 'id', 'ad', 'aciklama', 'olusturulma_tarihi',
    'aktif_mi', 'silindi_mi' gibi ortak alanları miras alır.
    
    Sistem Entegrasyonu: Bir teklif (bid) onaylandığında,
    BidService -> ProjectService.create_project zinciriyle
    bu entity'nin bir instance'ı otomatik olarak veritabanında oluşturulur.
    """
    ilan_id: str
    freelancer_id: str
    client_id: str
    baslik: str
    butce: float
    teslim_tarihi: Optional[datetime] = None
    durum: str = "devam_ediyor"  # devam_ediyor, tamamlandi, iptal
