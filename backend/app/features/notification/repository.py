from app.base.BaseRepo import BaseRepository
from bson import ObjectId

class NotificationRepository(BaseRepository):
    def __init__(self):
        super().__init__(collection_name="notifications")

    async def get_user_notifications(self, user_id: str, limit: int = 50):
        query = {"user_id": str(user_id), "silindi_mi": False}
        cursor = self.collection.find(query).sort("olusturulma_tarihi", -1).limit(limit)
        documents = await cursor.to_list(length=limit)
        return [self.to_dict(doc) for doc in documents]

    async def mark_as_read(self, notification_id: str):
        result = await self.collection.find_one_and_update(
            {"_id": ObjectId(notification_id)},
            {"$set": {"okundu_mu": True}},
            return_document=True
        )
        return self.to_dict(result)

    async def mark_all_as_read(self, user_id: str):
        result = await self.collection.update_many(
            {"user_id": str(user_id), "okundu_mu": False},
            {"$set": {"okundu_mu": True}}
        )
        return result.modified_count
