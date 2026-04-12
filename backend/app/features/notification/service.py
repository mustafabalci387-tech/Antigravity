from typing import List
from app.base.BaseService import BaseService
from app.features.notification.repository import NotificationRepository

class NotificationService(BaseService):
    def __init__(self, repository: NotificationRepository = None):
        super().__init__(repository=repository or NotificationRepository())

    async def get_user_notifications(self, user_id: str, limit: int = 50) -> List[dict]:
        return await self.repository.get_user_notifications(user_id, limit)

    async def mark_as_read(self, notification_id: str) -> dict:
        return await self.repository.mark_as_read(notification_id)

    async def create_notification(self, user_id: str, mesaj: str, ilan_id: str = None, tip: str = "genel") -> dict:
        data = {
            "user_id": str(user_id),
            "mesaj": mesaj,
            "ilan_id": str(ilan_id) if ilan_id else None,
            "tip": tip,
            "okundu_mu": False
        }
        id = await self.create(data)
        return await self.get_by_id(id)

    async def mark_all_as_read(self, user_id: str) -> int:
        return await self.repository.mark_all_as_read(user_id)

    async def delete_notification(self, notification_id: str) -> bool:
        return await self.repository.soft_delete(notification_id)

    async def clear_all_notifications(self, user_id: str) -> int:
        return await self.repository.clear_all(user_id)
