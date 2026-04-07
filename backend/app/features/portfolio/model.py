from typing import Optional
from app.base.BaseModel import BaseEntity

class PortfolioEntity(BaseEntity):
    """
    Portfolyo Modeli (Hoca Standartları).
    'ad', 'aciklama', 'etiketler' alanları BaseEntity'den gelir.
    """
    kullanici_id: str
    medya_url: str                     # Cloudinary URL
    proje_linki: Optional[str] = None # GitHub/Live link
    sira: int = 0                    # Gösterim sırası