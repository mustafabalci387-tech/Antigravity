from app.base.BaseRepo import BaseRepository

class ProjectRepository(BaseRepository):
    """
    Proje Takibi Repository Katmanı (Hoca Standartları).
    BaseRepository'ye 'projects' koleksiyon adını enjekte eder.
    CRUD operasyonları (create, get_by_id, get_many, update, soft_delete)
    tamamen BaseRepository'den miras alınır.
    """
    def __init__(self):
        super().__init__(collection_name="projects")

    async def get_user_projects(self, user_id: str, role: str):
        """Kullanıcının rolüne göre dahil olduğu projeleri getirir."""
        if role == "client":
            return await self.get_many(filters={"client_id": user_id})
        else:
            return await self.get_many(filters={"freelancer_id": user_id})
