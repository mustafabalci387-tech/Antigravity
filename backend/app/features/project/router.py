from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional
from app.core.dependencies import get_current_user, authorize
from app.core.response import success_response
from app.features.project.service import ProjectService

# ──────────────────────────────────────────────────────────
# Router & Service Tanımları
# ──────────────────────────────────────────────────────────
router = APIRouter(prefix="/api/projects", tags=["Projects"])
project_service = ProjectService()


# ──────────────────────────────────────────────────────────
# DTO / Request Body Şemaları (Pydantic)
# ──────────────────────────────────────────────────────────
class ProjectStatusUpdate(BaseModel):
    """Proje durumu güncelleme isteği için şema."""
    durum: str = Field(
        ...,
        pattern="^(devam_ediyor|tamamlandi|iptal)$",
        description="Geçerli değerler: devam_ediyor, tamamlandi, iptal"
    )


# ══════════════════════════════════════════════════════════
# 1) GET /api/projects — Projeleri Listeleme
# ══════════════════════════════════════════════════════════
@router.get("/")
async def list_my_projects(
    current_user: dict = Depends(get_current_user)
):
    """
    Giriş yapmış kullanıcının dahil olduğu projeleri listeler.
    Kullanıcı rolüne göre (client / freelancer) otomatik filtreleme yapar.

    - Client → client_id eşleşen projeler
    - Freelancer → freelancer_id eşleşen projeler
    """
    user_id = str(current_user.get("id"))
    role = current_user.get("rol", "freelancer")
    projects = await project_service.list_user_projects(user_id, role)
    return success_response(
        "Projeler başarıyla listelendi",
        {"projects": projects}
    )


# ══════════════════════════════════════════════════════════
# 2) GET /api/projects/{project_id} — Proje Detayı
# ══════════════════════════════════════════════════════════
@router.get("/{project_id}")
async def get_project_detail(
    project_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Tek bir projenin detayını getirir.
    Proje bulunamazsa 404 döner.
    """
    project = await project_service.get_project(project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proje bulunamadı"
        )
    return success_response(
        "Proje detayı getirildi",
        {"project": project}
    )


# ══════════════════════════════════════════════════════════
# 3) PATCH /api/projects/{project_id}/status — Durum Güncelleme
# ══════════════════════════════════════════════════════════
@router.patch("/{project_id}/status")
async def update_project_status(
    project_id: str,
    body: ProjectStatusUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Proje durumunu günceller.
    Geçerli durum değerleri: devam_ediyor | tamamlandi | iptal

    Yetki kontrolü: Projenin client'ı veya ilgili freelancer'ı
    bu endpoint'i çağırabilir.
    """
    # Önce projeyi bul, yetki kontrolü için
    project = await project_service.get_project(project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proje bulunamadı"
        )

    # Yetki kontrolü: Proje sahibi (client) veya freelancer mı?
    user_id = str(current_user.get("id"))
    is_owner = (
        project.get("client_id") == user_id or
        project.get("freelancer_id") == user_id
    )
    if not is_owner and current_user.get("rol") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu projeyi güncelleme yetkiniz yok"
        )

    updated = await project_service.update_project_status(project_id, body.durum)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Proje durumu güncellenirken bir hata oluştu"
        )
    return success_response(
        "Proje durumu başarıyla güncellendi",
        {"project": updated}
    )
