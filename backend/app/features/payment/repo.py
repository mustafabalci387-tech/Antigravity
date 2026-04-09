from app.base.BaseRepo import BaseRepository
from typing import List, Dict, Any

class PaymentRepo(BaseRepository):
    def __init__(self):
        # 'payments' koleksiyonu üzerinden çalışması için isim belirtilir
        super().__init__(collection_name="payments")
        
    async def get_payments_by_user_id(self, kullanici_id: str) -> List[Dict[str, Any]]:
        """
        Belirli bir kullanıcıya ait ödeme kayıtlarını (payment) getirir.
        BaseRepo'dan gelen genel özelliklerin yanı sıra projeye özel sorgu metodudur.
        """
        query = {
            "kullanici_id": kullanici_id,
            "silindi_mi": False
        }
        
        # BaseRepo içerisinde de olan 'collection' özelliğini kullanarak sorguyu çalıştır
        cursor = self.collection.find(query).sort("olusturulma_tarihi", -1)
        documents = await cursor.to_list(length=100) # En fazla 100 ödeme getirir
        
        # BaseRepo'daki to_dict yardımcı aracıyla MongoDB'den dönen '_id' değerini 'id'ye çevir
        return [self.to_dict(doc) for doc in documents]
