from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

# ─────────────────────────────────────────────
# Base: Tüm ödeme şemalarının ortak alanları
# ─────────────────────────────────────────────
class PaymentBase(BaseModel):
    """Tüm Payment DTO'larının miras aldığı ortak alan seti."""
    ilan_id: str
    freelancer_id: str
    tutar: float = Field(..., gt=0, description="Ödeme tutarı (TL), 0'dan büyük olmalı")

# ─────────────────────────────────────────────
# Create: İstemciden gelen yeni ödeme verisi
# ─────────────────────────────────────────────
class PaymentCreateDTO(PaymentBase):
    """
    Yeni ödeme oluşturulurken istemciden beklenen alanlar.
    - isveren_id controller'da current_user'dan otomatik set edilir.
    - odeme_durumu ve onay_durumu service katmanında varsayılan atanır.
    """
    aciklama: Optional[str] = None
    odeme_yontemi: Optional[str] = Field(
        None,
        pattern="^(kredi_karti|havale|dijital_cuzdan)$",
        description="Ödeme yöntemi: kredi_karti, havale veya dijital_cuzdan"
    )
    islem_notu: Optional[str] = None

# ─────────────────────────────────────────────
# Response: Dışarıya dönen ödeme verisi
# ─────────────────────────────────────────────
class PaymentResponseDTO(PaymentBase):
    """
    API yanıtlarında dönecek tam ödeme şeması.
    Veritabanı tarafından üretilen alanları da içerir.
    """
    id: str
    isveren_id: str
    odeme_durumu: str = "Pending"
    onay_durumu: str = "beklemede"
    odeme_yontemi: Optional[str] = None
    islem_notu: Optional[str] = None
    olusturulma_tarihi: datetime
    degistirilme_tarihi: Optional[datetime] = None
    aktif_mi: bool = True

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

# ─────────────────────────────────────────────
# Update: Kısmi güncelleme (PATCH) şeması
# ─────────────────────────────────────────────
class PaymentUpdateDTO(BaseModel):
    """Ödeme güncelleme için opsiyonel alanlar."""
    tutar: Optional[float] = Field(None, gt=0)
    odeme_yontemi: Optional[str] = Field(
        None,
        pattern="^(kredi_karti|havale|dijital_cuzdan)$"
    )
    islem_notu: Optional[str] = None
