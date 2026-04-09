import asyncio
import os
import sys

# Backend yolunu ekle
sys.path.append(os.getcwd())

from app.core.database import connect_db
from app.features.user.repository import UserRepository

async def main():
    await connect_db()
    repo = UserRepository()
    users, total = await repo.get_many(limit=100)
    print("--- USER ROLES ---")
    for u in users:
        print(f"Name: {u.get('ad')} {u.get('soyad')} | Role: {u.get('rol')} | Type: {type(u.get('rol'))}")
    print("--- END ---")

if __name__ == "__main__":
    asyncio.run(main())
