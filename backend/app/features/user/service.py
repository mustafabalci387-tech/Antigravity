from typing import List, Dict, Any, Optional
from app.base.BaseService import BaseService
from app.features.user.repository import UserRepository
from app.features.user.manager import UserManager
from app.core.exceptions import ApiError

class UserService(BaseService):
    """
    UserService: Orkestrasyon katmanı.
    Görevi: Süreci yönetir. Manager'ı çağırıp kuralları denetler, Repo'ya yazar.
    """
    def __init__(self, repository: UserRepository = None, manager: UserManager = None):
        super().__init__(repository=repository or UserRepository())
        self.manager = manager or UserManager()

    async def register_user(self, data: dict) -> dict:
        """Kayıt sürecini yönetir."""
        email = data.get("email", "").lower().strip()
        
        # 1. Kural: Email kontrolü (Service orkestrasyonu)
        existing_user = await self.repository.get_by_email(email)
        if existing_user:
            raise ApiError("Bu e-posta adresi zaten kayıtlı", 400)

        # 2. Kural: Şifre hashleme (Manager'dan kuralı al)
        data["sifre"] = self.manager.hash_password(data["sifre"])
        
        # 3. DB'ye yaz (Repo üzerinden)
        user_id = await self.create(data)
        return await self.get_user_by_id(user_id)

    async def get_user_by_id(self, user_id: str) -> Optional[dict]:
        user = await self.repository.get_by_id(user_id)
        return user

    async def update_user(self, user_id: str, data: dict) -> dict:
        """Güncelleme sürecini yönetir."""
        return await self.update(user_id, data)

    async def list_users(self, skip: int = 0, limit: int = 10, filters: dict = None) -> List[dict]:
        users, count = await self.list_all(skip=skip, limit=limit, filters=filters)
        return users
