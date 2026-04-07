from app.base.BaseService import BaseService
from app.features.payment.repository import PaymentRepository
from app.features.payment.manager import PaymentManager

class PaymentService(BaseService):
    """
    PaymentService: Ödeme Orkestrasyon Katmanı.

    BaseService'den miras alınan:
        - get_by_id, list_all, create, update, delete

    Ödemeye özel iş akışları:
        - create_payment                    : Validasyonlu ödeme oluşturma
        - approve_work_and_complete_payment : İş onay + ödeme tamamlama
        - reject_work_and_cancel_payment    : İş red + ödeme iptal
        - get_payments_by_isveren           : İşverene ait ödemeler
        - get_payments_by_freelancer        : Freelancer'a ait ödemeler
        - get_payments_by_ilan              : İlana ait ödemeler
    """
    def __init__(self, repository: PaymentRepository = None, manager: PaymentManager = None):
        super().__init__(repository=repository or PaymentRepository())
        self.manager = manager or PaymentManager()

    async def create_payment(self, data: dict) -> dict:
        """
        Yeni ödeme kaydı oluşturur.
        1. Manager ile tutar validasyonu
        2. Repo ile veritabanına kayıt
        3. Oluşturulan kaydı geri döndür
        """
        self.manager.validate_payment_amount(data.get("tutar", 0))

        data["odeme_durumu"] = "Pending"
        data["onay_durumu"] = "beklemede"

        payment_id = await self.create(data)
        return await self.get_by_id(payment_id)

    async def approve_work_and_complete_payment(self, payment_id: str) -> dict:
        """
        İşveren işi onayladığında çağrılır.
        1. Ödemeyi bul (get_or_404)
        2. Manager ile durum geçiş kontrolü
        3. onay_durumu  -> 'onaylandi'
        4. odeme_durumu -> 'Completed'
        """
        payment = await self.get_by_id(payment_id)
        self.manager.get_or_404(payment, payment_id)

        # Durum geçiş kontrolleri (Manager iş kuralları)
        self.manager.update_onay_status(payment["onay_durumu"], "onaylandi")
        self.manager.update_payment_status(payment["odeme_durumu"], "Completed")

        updated = await self.update(payment_id, {
            "onay_durumu": "onaylandi",
            "odeme_durumu": "Completed"
        })
        return updated

    async def reject_work_and_cancel_payment(self, payment_id: str) -> dict:
        """
        İş reddedildiğinde çağrılır.
        1. Ödemeyi bul (get_or_404)
        2. Manager ile durum geçiş kontrolü
        3. onay_durumu  -> 'reddedildi'
        4. odeme_durumu -> 'Rejected'
        """
        payment = await self.get_by_id(payment_id)
        self.manager.get_or_404(payment, payment_id)

        # Durum geçiş kontrolleri (Manager iş kuralları)
        self.manager.update_onay_status(payment["onay_durumu"], "reddedildi")
        self.manager.update_payment_status(payment["odeme_durumu"], "Rejected")

        updated = await self.update(payment_id, {
            "onay_durumu": "reddedildi",
            "odeme_durumu": "Rejected"
        })
        return updated

    async def get_payments_by_isveren(self, isveren_id: str, skip: int = 0, limit: int = 20):
        """İşverene ait tüm ödemeleri getirir (Repo'ya delege)."""
        return await self.repository.get_by_isveren(isveren_id, skip=skip, limit=limit)

    async def get_payments_by_freelancer(self, freelancer_id: str, skip: int = 0, limit: int = 20):
        """Freelancer'a ait tüm ödemeleri getirir (Repo'ya delege)."""
        return await self.repository.get_by_freelancer(freelancer_id, skip=skip, limit=limit)

    async def get_payments_by_ilan(self, ilan_id: str):
        """Belirli bir ilana ait ödemeleri getirir (Repo'ya delege)."""
        return await self.repository.get_by_ilan(ilan_id)
