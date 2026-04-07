import asyncio, json
import certifi
from motor.motor_asyncio import AsyncIOMotorClient

async def export_users():
    try:
        client = AsyncIOMotorClient('mongodb+srv://collabflow_user:collabflow123@cluster0.mongodb.net/collabflow_db', tlsCAFile=certifi.where())
        db = client.collabflow_db
        users = await db.users.find({}).to_list(1000)
        
        # MongoDB _id değerlerini string türüne dönüştürüyoruz
        for u in users:
            u['_id'] = str(u['_id'])
            
        with open('../users_verileri_aktarim_icin.json', 'w', encoding='utf-8') as f:
            json.dump(users, f, ensure_ascii=False, indent=4)
            
        print("Kullanıcı verileri masaüstündeki proje ana dizinine 'users_verileri_aktarim_icin.json' adıyla kaydedildi!")
    except Exception as e:
        print(f"Hata oluştu: {e}")

if __name__ == "__main__":
    asyncio.run(export_users())
