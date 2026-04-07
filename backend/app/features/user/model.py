from typing import Optional, List
from app.base.BaseModel import BaseEntity

class UserEntity(BaseEntity):
    """
    Kullanıcı Tablosu Modeli (Hoca Kuralı - Türkçe Standartlar).
    DB alanlarını birebir temsil eder.
    """
    # 'ad', 'aciklama' (bio yerine), 'etiketler' (skills yerine) BaseEntity'den geliyor.
    soyad: str
    email: str
    sifre: str
    rol: str = "freelancer" # admin, client, freelancer
    telefon: Optional[str] = None
    avatar: Optional[str] = None
    unvan: Optional[str] = None # Örn: Senior Full Stack Developer
    deneyim: Optional[str] = None # Örn: 5+ Years
    sosyal_medya: Optional[dict] = {
        "website": None,
        "github": None,
        "linkedin": None,
        "twitter": None
    }
