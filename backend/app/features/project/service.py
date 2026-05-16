from typing import List
from app.base.BaseService import BaseService
from app.features.project.repository import ProjectRepository

class ProjectService(BaseService):
    """
    ProjectService: Orkestrasyon katmanı (Hoca Standartları).
    
    Kritik Entegrasyon: BidService.update_bid_status() metodu
    teklif onaylandığında bu sınıfın create_project() metodunu
    çağırarak otomatik proje kaydı oluşturur.
    """
    def __init__(self, repository: ProjectRepository = None):
        super().__init__(repository=repository or ProjectRepository())

    async def create_project(self, data: dict) -> dict:
        """
        Onaylanan teklif verileriyle yeni bir proje kaydı oluşturur.
        BidService -> ProjectService zincirinin hedef metodudur.
        """
        if "durum" not in data:
            data["durum"] = "devam_ediyor"
        project_id = await self.create(data)
        return await self.get_by_id(project_id)

    async def list_user_projects(self, user_id: str, role: str) -> List[dict]:
        """Kullanıcının rolüne göre dahil olduğu projeleri listeler."""
        projects, count = await self.repository.get_user_projects(user_id, role)
        return projects

    async def get_project(self, project_id: str) -> dict:
        """Tek bir projenin detaylarını getirir."""
        return await self.get_by_id(project_id)

    async def update_project_status(self, project_id: str, status: str) -> dict:
        """Proje durumunu günceller (devam_ediyor, tamamlandi, iptal)."""
        return await self.update(project_id, {"durum": status})
