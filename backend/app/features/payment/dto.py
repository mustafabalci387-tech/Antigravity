from pydantic import Field
from app.base.BaseModel import BaseEntity

class PaymentRequest(BaseEntity):
    # DRY kuralına göre base/BaseModel.py'daki (id, ad vb.) veri başlıkları buradan miras altında geçerlidir.
    
    kart_numarasi: str = Field(..., min_length=16, max_length=16, description="16 Haneli Kredi Kartı Numarası")
    kart_sahibi: str = Field(..., description="Kart Üzerindeki İsim ve Soyisim")
    cvv: str = Field(..., min_length=3, max_length=4, description="Kartın arkasındaki güvenlik kodu")
    son_kullanma_tarihi: str = Field(..., description="Ay/Yıl (MM/YY) formatında son kullanma tarihi")
    tutar: float = Field(..., gt=0, description="Ödenecek Tutar (Sıfırdan büyük olmalıdır)")
    aciklama: str = Field("Hizmet Ödemesi", description="Ödemenin ne için yapıldığına dair açıklama")
    freelancer_id: str = Field(..., description="Ödemenin yapılacağı freelancer'ın ID'si")

class PaymentResponse(BaseEntity):
    # Yine BaseEntity alanlarını otomatik içerir (örn. id)
    
    mesaj: str = Field(..., description="Kullanıcıya gösterilecek durum mesajı (örn: Ödeme başarılı)")
    durum: str = Field(..., description="İşlem sonucu: 'Başarılı', 'Red' vb.")
    islem_id: str = Field(..., description="Stripe/Sistem tarafındaki benzersiz referans numarası")
