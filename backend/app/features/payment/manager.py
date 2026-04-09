import asyncio
import uuid
from app.base.BaseManager import BaseManager
from app.features.payment.dto import PaymentResponse
from app.features.payment.repository import PaymentRepository

class PaymentManager(BaseManager):
    def __init__(self):
        super().__init__()
        self.repo = PaymentRepository()

    async def process_payment(self, data: dict) -> PaymentResponse:
        """Controller'dan gelen dict verisini işler ve DB kaydını oluşturur."""
        await asyncio.sleep(1) # Stripe simülasyon gecikmesi
        
        kart_no = data.get("kart_numarasi", "")
        # SİMUASYON GÜNCELLEMESİ: Artık tüm ödemeler başarılı sayılacak
        is_success = True 
        
        durum = "Completed" if is_success else "Rejected"
        mesaj = "Ödeme başarıyla tamamlandı (Simülasyon Aktif)."
        islem_id = f"st_sim_{uuid.uuid4().hex[:6]}"

        # MongoDB'ye kaydedilecek veri paketi (isveren_id ve freelancer_id dahil)
        payment_record = {
            "isveren_id": data.get("isveren_id"),
            "freelancer_id": data.get("freelancer_id"),
            "ad": data.get("aciklama", "Hizmet Ödemesi"),
            "tutar": float(data.get("tutar", 100)),
            "kart_maskeli": f"**** **** **** {kart_no[-4:]}",
            "odeme_durumu": durum,
            "islem_id": islem_id,
            "para_birimi": "TRY"
        }
        
        # Repository üzerinden veritabanına kayıt
        sistem_id = await self.repo.create(payment_record)

        # Yanıt dönerken pydantic modeline uygun formatlama (ID string olmalı)
        return PaymentResponse(
            id=str(sistem_id),
            mesaj=mesaj,
            durum="Başarılı" if is_success else "Red",
            islem_id=islem_id
        )