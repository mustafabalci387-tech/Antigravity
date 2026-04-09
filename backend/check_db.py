import asyncio
import os
import sys

# Backend yolunu ekle
sys.path.append(os.getcwd())

from app.core.database import connect_db
from app.features.user.repository import UserRepository

async def main():
    try:
        await connect_db()
        repo = UserRepository()
        users, count = await repo.get_many(limit=100)
        print(f"BULDUM: {count} kullanici var.")
        for u in users:
            print(f"AD: {u.get('ad')} {u.get('soyad')} | ROL: {u.get('rol')} | EMAIL: {u.get('email')}")
    except Exception as e:
        print(f"HATA: {e}")

if __name__ == "__main__":
    asyncio.run(main())
