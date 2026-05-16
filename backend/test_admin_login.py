"""Admin sifre dogrulama testi."""
import asyncio
import bcrypt
from motor.motor_asyncio import AsyncIOMotorClient
import certifi

MONGO_URI = "mongodb+srv://admin_baris:Baris123456@cluster0.6mgrocx.mongodb.net/collabflow_db?retryWrites=true&w=majority"

async def test_login():
    client = AsyncIOMotorClient(MONGO_URI, tlsCAFile=certifi.where())
    db = client.collabflow_db
    
    user = await db.users.find_one({"email": "admin04@gmail.com"})
    if not user:
        print("Kullanici bulunamadi!")
        return
    
    stored_hash = user.get("sifre", "")
    print(f"Kayitli hash: {stored_hash}")
    
    test_passwords = ["Baris123", "baris123", "Baris123456", "admin123", "polis9090"]
    
    for pwd in test_passwords:
        try:
            result = bcrypt.checkpw(pwd.encode("utf-8"), stored_hash.encode("utf-8"))
            status = "ESLESTI" if result else "Eslesmiyor"
            print(f"  '{pwd}' -> {status}")
        except Exception as e:
            print(f"  '{pwd}' -> HATA: {e}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(test_login())
