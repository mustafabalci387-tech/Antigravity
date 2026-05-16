from fastapi import APIRouter, Depends, Query, HTTPException, status
from app.core.dependencies import get_current_user
from app.core.response import success_response
from app.features.project.service import ProjectService

router = APIRouter(prefix="/api/projects", tags=["Projects"])
project_service = ProjectService()

@router.get("/")
async def list_my_projects(
    current_user: dict = Depends(get_current_user)
):
    """
    Giriş yapmış kullanıcının dahil olduğu projeleri listeler.
    Kullanıcı rolüne göre (client/freelancer) filtreleme yapar.
    """
    user_id = str(current_user.get("id"))
    role = current_user.get("rol", "freelancer")
    projects = await project_service.list_user_projects(user_id, role)
    return success_response("Projeler başarıyla listelendi", {"projects": projects})

@router.get("/{project_id}")
async def get_project_detail(
    project_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Tek bir projenin detayını getirir."""
    project = await project_service.get_project(project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proje bulunamadı"
        )
    return success_response("Proje detayı getirildi", {"project": project})

@router.patch("/{project_id}/status")
async def update_project_status(
    project_id: str,
    durum: str = Query(..., pattern="^(devam_ediyor|tamamlandi|iptal)$"),
    current_user: dict = Depends(get_current_user)
):
    """
    Proje durumunu günceller.
    Geçerli değerler: devam_ediyor, tamamlandi, iptal
    """
    updated = await project_service.update_project_status(project_id, durum)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proje bulunamadı veya güncellenemedi"
        )
    return success_response("Proje durumu güncellendi", {"project": updated})
