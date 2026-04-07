from typing import Optional
from app.base.BaseModel import BaseEntity

class PaymentEntity(BaseEntity):
    """
    Ödeme (Payment) Tablosu Modeli (Hoca Standartları).

    BaseEntity'den miras alınan alanlar:
        - id, ad, kisa_ad, aciklama
        - etiketler, olusturulma_tarihi, degistirilme_tarihi
        - aktif_mi, silindi_mi

    Ödemeye özel alanlar:
        - ilan_id         : Ödemenin bağlı olduğu iş ilanının ID'si
        - isveren_id      : Ödemeyi yapan işverenin ID'si
        - freelancer_id   : Ödemeyi alacak freelancer'ın ID'si
        - tutar           : Ödeme tutarı (TL)
        - odeme_durumu    : Pending | Completed | Rejected
        - onay_durumu     : İş onay mekanizması durumu
                            (beklemede | onaylandi | reddedildi)
    """
    ilan_id: str
    isveren_id: str
    freelancer_id: str
    tutar: float
    odeme_durumu: str = "Pending"        # Pending, Completed, Rejected
    onay_durumu: str = "beklemede"       # beklemede, onaylandi, reddedildi
    odeme_yontemi: Optional[str] = None  # kredi_karti, havale, dijital_cuzdan
    islem_notu: Optional[str] = None     # Ödemeye ait ek not
