import asyncio
import os
import sys

# Backend yolunu ekle
sys.path.append(os.getcwd())

from app.features.user.repository import UserRepository

async def main():
    repo = UserRepository()
    users, count = await repo.get_many()
    print(f"Total Users: {count}")
    for u in users:
        print(f"ID: {u.get('_id') or u.get('id')} | Ad: {u.get('ad')} {u.get('soyad')} | Rol: {u.get('rol')}")

if __name__ == "__main__":
    asyncio.run(main())
