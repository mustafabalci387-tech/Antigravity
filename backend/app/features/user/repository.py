from typing import Optional, Dict, Any
from app.base.BaseRepo import BaseRepository

class UserRepository(BaseRepository):
    """
    UserRepository: Kullanıcı veritabanı işlemleri.
    Sadece DB ile konuşur.
    """
    def __init__(self):
        super().__init__(collection_name="users")

    async def get_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """E-posta adresi ile kullanıcıyı bulur."""
        doc = await self.collection.find_one({"email": email.lower().strip(), "silindi_mi": False})
        if doc:
            doc["id"] = str(doc.pop("_id"))
        return doc
