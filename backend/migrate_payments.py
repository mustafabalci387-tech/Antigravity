import asyncio
import os
import sys
from dotenv import load_dotenv
from pathlib import Path

# Backend yolunu ekle
sys.path.append(os.getcwd())

# 1. ÖNCE ENV YÜKLENİR
load_dotenv(dotenv_path=Path(__file__).parent / ".env")

from app.core.database import connect_db, close_db
from app.features.payment.repository import PaymentRepository

async def migrate_payments():
    print("🚀 Veri göçü başlatılıyor...")
    await connect_db()
    try:
        repo = PaymentRepository()
        
        # 1. Filtre: 'odeme_durumu' alanı olmayan veya 'Completed' olmayan tüm kayıtlar
        query = {
            "$or": [
                {"odeme_durumu": {"$exists": False}},
                {"odeme_durumu": {"$ne": "Completed"}}
            ]
        }
        
        # Güncelleme: Hepsini 'Completed' yap
        update_data = {
            "$set": {"odeme_durumu": "Completed"}
        }
        
        result = await repo.collection.update_many(query, update_data)
        
        print(f"✅ İşlem Tamamlandı!")
        print(f"📊 Toplam Güncellenen Kayıt Sayısı: {result.modified_count}")
    finally:
        await close_db()

if __name__ == "__main__":
    asyncio.run(migrate_payments())
