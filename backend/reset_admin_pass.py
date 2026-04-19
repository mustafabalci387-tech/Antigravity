import asyncio
import os
import bcrypt
from pymongo import MongoClient
import certifi
from motor.motor_asyncio import AsyncIOMotorClient

# Cloud URI from .env
MONGO_URI = "mongodb+srv://admin_baris:Baris123456@cluster0.6mgrocx.mongodb.net/collabflow_db?retryWrites=true&w=majority"
TARGET_EMAIL = "admin04@gmail.com"
NEW_PASSWORD = "Baris123"

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")

async def reset_password():
    print(f"--- {TARGET_EMAIL} icin sifre sifirlama başlatiliyor ---")
    
    try:
        client = AsyncIOMotorClient(MONGO_URI, tlsCAFile=certifi.where())
        db = client.collabflow_db
        
        # Yeni hashlenmiş şifre
        hashed_pass = hash_password(NEW_PASSWORD)
        
        # Güncelleme işlemi
        result = await db.users.update_one(
            {"email": TARGET_EMAIL},
            {"$set": {"sifre": hashed_pass}}
        )
        
        if result.modified_count > 0:
            print(f"SUCCESS: Sifre basariyla guncellendi! Yeni sifre: {NEW_PASSWORD}")
        else:
            print("WARNING: Kullanici bulundu ancak sifre degismedi veya bulunamadi.")
            
    except Exception as e:
        print(f"ERROR: {str(e)}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(reset_password())
