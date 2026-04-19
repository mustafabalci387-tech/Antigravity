"""
database.py — MongoDB bağlantı yapılandırması.

Motor (async MongoDB driver) kullanarak veritabanına bağlanır.
Bu modül tüm servisler tarafından kullanılacak 'db' nesnesini sağlar.
"""

from motor.motor_asyncio import AsyncIOMotorClient
import os

# MongoDB bağlantı URL'si (.env'den okunur)
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/collabflow")

# Motor client ve database nesneleri
client: AsyncIOMotorClient = None
db = None


async def connect_db():
    """MongoDB'ye bağlan — Uygulama başlangıcında çağrılır."""
    global client, db
    try:
        client = AsyncIOMotorClient(MONGO_URI)
        # URI'deki database adını kullan
        db_name = MONGO_URI.split("/")[-1].split("?")[0]
        db = client[db_name]
        
        # Bağlantıyı doğrula (Ping at)
        await client.admin.command('ping')
        
        # Bağlantı bilgilerini temiz bir şekilde yazdır
        hosts = [h[0] for h in client.nodes] if client.nodes else [client.host]
        print(f"[OK] MongoDB Baglandi: {', '.join(hosts)}")
    except Exception as e:
        print(f"[HATA] MongoDB Baglanti Hatasi: {str(e)}")
        raise e


async def close_db():
    """MongoDB bağlantısını kapat — Uygulama kapanırken çağrılır."""
    global client
    if client:
        client.close()
        print("[OK] MongoDB baglantisi kapatildi")


def get_db():
    """Veritabanı nesnesini döndür."""
    return db
