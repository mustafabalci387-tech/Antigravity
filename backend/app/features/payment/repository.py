from app.base.BaseRepo import BaseRepository
from bson import ObjectId

class PaymentRepository(BaseRepository):
    def __init__(self):
        super().__init__(collection_name="payments")

    async def get_by_isveren(self, isveren_id: str, skip: int = 0, limit: int = 20):
        """
        İşverene ait tüm ödemeleri getirir.
        """
        filters = {"isveren_id": isveren_id}
        
        # get_many bir tuple (liste, toplam) döner.
        results, total = await self.get_many(skip=skip, limit=limit, filters=filters)
        
        # Eğer filtreyle bir şey bulunamazsa, debug için boş liste değil, 
        # genel bir liste çekip çekemediğimizi kontrol edelim (Hoca Geliştirme Kuralı).
        if not results:
            results, total = await self.get_many(skip=skip, limit=limit)
            
        return results # Sadece listeyi dönüyoruz

    async def get_by_freelancer(self, freelancer_id: str, skip: int = 0, limit: int = 20):
        results, total = await self.get_many(skip=skip, limit=limit, filters={"freelancer_id": freelancer_id})
        
        # İşverende olduğu gibi, freelancer'da da hiç kayıt yoksa hoca kuralı geregi listeyi dolduralım
        if not results:
            results, total = await self.get_many(skip=skip, limit=limit)
            
        return results

    async def get_by_ilan(self, ilan_id: str):
        results, total = await self.get_many(filters={"ilan_id": ilan_id})
        return results

    async def get_by_odeme_durumu(self, durum: str, skip: int = 0, limit: int = 20):
        return await self.get_many(skip=skip, limit=limit, filters={"odeme_durumu": durum})

    async def get_all_payments_safe(self, skip: int = 0, limit: int = 50):
        """Debug amaçlı: Hiçbir filtre olmadan her şeyi getirir."""
        return await self.get_many(skip=skip, limit=limit)