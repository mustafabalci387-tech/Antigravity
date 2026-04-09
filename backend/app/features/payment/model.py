from pydantic import Field
from typing import Optional
from app.base.BaseModel import BaseEntity

class PaymentModel(BaseEntity):
    # BaseEntity'den id, ad, kisa_ad, aktif_mi, olusturulma_tarihi vb. miras alınır.
    
    kart_numarasi_maskeli: str = Field(..., description="Kartın sadece son 4 hanesi veya maskeli hali (örn: **** **** **** 1234)")
    tutar: float = Field(..., description="Ödeme tutarı")
    para_birimi: str = Field(default="TRY", description="Para birimi")
    durum: str = Field(default="Bekliyor", description="Ödeme durumu: 'Bekliyor', 'Başarılı', 'Red'")
    kullanici_id: Optional[str] = Field(None, description="Ödemeyi yapan kullanıcının ID'si")
