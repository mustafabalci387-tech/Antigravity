from app.base.BaseRepo import BaseRepository

class PaymentRepository(BaseRepository):
    """
    Ödeme Repository Katmanı (Hoca Standartları).

    BaseRepository'den miras alınan CRUD metodları:
        - create, get_by_id, get_many, update, soft_delete

    Ödemeye özel sorgular (DRY'ı bozmadan, get_many filtre ile):
        - get_by_isveren     : İşverene ait tüm ödemeler
        - get_by_freelancer  : Freelancer'a ait tüm ödemeler
        - get_by_ilan        : Belirli bir ilana ait ödemeler
        - get_by_odeme_durumu: Duruma göre filtreleme (Pending, Completed, Rejected)
    """
    def __init__(self):
        super().__init__(collection_name="payments")

    async def get_by_isveren(self, isveren_id: str, skip: int = 0, limit: int = 20):
        """İşverene ait tüm ödemeleri getirir."""
        return await self.get_many(skip=skip, limit=limit, filters={"isveren_id": isveren_id})

    async def get_by_freelancer(self, freelancer_id: str, skip: int = 0, limit: int = 20):
        """Freelancer'a ait tüm ödemeleri getirir."""
        return await self.get_many(skip=skip, limit=limit, filters={"freelancer_id": freelancer_id})

    async def get_by_ilan(self, ilan_id: str):
        """Belirli bir ilana ait ödemeleri getirir."""
        return await self.get_many(filters={"ilan_id": ilan_id})

    async def get_by_odeme_durumu(self, durum: str, skip: int = 0, limit: int = 20):
        """Ödeme durumuna göre filtreleme (Pending, Completed, Rejected)."""
        return await self.get_many(skip=skip, limit=limit, filters={"odeme_durumu": durum})
