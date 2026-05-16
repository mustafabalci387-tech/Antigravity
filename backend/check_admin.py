"""Admin kullanıcılarını kontrol eden geçici script."""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import certifi

MONGO_URI = "mongodb+srv://admin_baris:Baris123456@cluster0.6mgrocx.mongodb.net/collabflow_db?retryWrites=true&w=majority"

async def check_admin():
    try:
        client = AsyncIOMotorClient(MONGO_URI, tlsCAFile=certifi.where())
        db = client.collabflow_db
        
        # Tüm admin kullanıcılarını bul
        admins = await db.users.find({"rol": "admin"}).to_list(100)
        
        if not admins:
            print("\n[!] Veritabaninda ADMIN rolu olan kullanici BULUNAMADI!")
        else:
            print(f"\n[OK] {len(admins)} adet admin kullanici bulundu:\n")
            for a in admins:
                print(f"  ID:    {a.get('_id')}")
                print(f"  Ad:    {a.get('ad')} {a.get('soyad')}")
                print(f"  Email: {a.get('email')}")
                print(f"  Rol:   {a.get('rol')}")
                print(f"  Sifre Hash: {a.get('sifre', 'YOK')[:30]}...")
                print(f"  Silindi mi: {a.get('silindi_mi', False)}")
                print()
        
        # admin04@gmail.com kontrol
        target = await db.users.find_one({"email": "admin04@gmail.com"})
        if target:
            print(f"--- admin04@gmail.com detaylari ---")
            print(f"  Rol: {target.get('rol')}")
            print(f"  Sifre hash mevcut: {'Evet' if target.get('sifre') else 'Hayir'}")
        else:
            print("[!] admin04@gmail.com bulunamadi!")
        
        # Tüm kullanıcıları da listele
        all_users = await db.users.find({}).to_list(100)
        print(f"\n--- Toplam {len(all_users)} kullanici ---")
        for u in all_users:
            print(f"  {u.get('email')} | rol: {u.get('rol')} | silindi: {u.get('silindi_mi', False)}")
        
        client.close()
    except Exception as e:
        print(f"HATA: {e}")

if __name__ == "__main__":
    asyncio.run(check_admin())
