from app.core.database import get_db
from bson import ObjectId
from typing import Optional, List, Dict, Any, Tuple, Type
from datetime import datetime

class BaseRepository:
    def __init__(self, collection_name: str):
        self.collection_name = collection_name

    @property
    def db(self):
        return get_db()
        
    @property
    def collection(self):
        return self.db[self.collection_name]

    @staticmethod
    def to_dict(doc: dict) -> Optional[dict]:
        if not doc:
            return None
        if "_id" in doc:
            doc["id"] = str(doc.pop("_id"))
        return doc

    async def create(self, data: dict) -> str:
        data["olusturulma_tarihi"] = datetime.utcnow()
        data["aktif_mi"] = data.get("aktif_mi", True)
        data["silindi_mi"] = False
        result = await self.collection.insert_one(data)
        return str(result.inserted_id)

    async def get_by_id(self, id: str) -> Optional[Dict[str, Any]]:
        try:
            doc = await self.collection.find_one({"_id": ObjectId(id), "silindi_mi": False})
            return self.to_dict(doc)
        except:
            return None

    async def get_many(self, skip: int = 0, limit: int = 10, sort_by: str = "olusturulma_tarihi", sort_order: int = -1, filters: dict = None) -> Tuple[List[Dict[str, Any]], int]:
        query = filters or {}
        query["silindi_mi"] = False
        
        cursor = self.collection.find(query).sort(sort_by, sort_order).skip(skip).limit(limit)
        documents = await cursor.to_list(length=limit)
        
        parsed_documents = [self.to_dict(doc) for doc in documents]
            
        total = await self.collection.count_documents(query)
        return parsed_documents, total

    async def update(self, id: str, data: dict) -> Optional[Dict[str, Any]]:
        """Hoca Kuralı: PATCH (Kısmi Güncelleme)"""
        data["degistirilme_tarihi"] = datetime.utcnow()
        result = await self.collection.find_one_and_update(
            {"_id": ObjectId(id), "silindi_mi": False},
            {"$set": data},
            return_document=True
        )
        return self.to_dict(result)

    async def soft_delete(self, id: str) -> bool:
        """Hoca Kuralı: Soft Delete"""
        result = await self.collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"silindi_mi": True, "aktif_mi": False, "degistirilme_tarihi": datetime.utcnow()}}
        )
        return result.modified_count > 0